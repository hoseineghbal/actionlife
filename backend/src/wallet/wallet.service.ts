import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
  TransactionType,
  TransactionStatus,
} from './schemas/transaction.schema';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { GiftCard, GiftCardDocument, GiftCardStatus } from './schemas/gift-card.schema';
import { TokenConfig, TokenConfigDocument } from './schemas/token-config.schema';
import {
  SellRequest,
  SellRequestDocument,
  SellRequestStatus,
} from './schemas/sell-request.schema';
import {
  PurchaseTokenDto,
  TransferTokenDto,
  SellTokenRequestDto,
  CreateGiftCardDto,
  RedeemGiftCardDto,
} from './dto/wallet.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

type MongoFilter = Record<string, unknown>;

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(GiftCard.name) private giftCardModel: Model<GiftCardDocument>,
    @InjectModel(TokenConfig.name) private tokenConfigModel: Model<TokenConfigDocument>,
    @InjectModel(SellRequest.name) private sellRequestModel: Model<SellRequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getTokenConfig(): Promise<TokenConfigDocument> {
    let config = await this.tokenConfigModel.findOne();
    if (!config) {
      config = await this.tokenConfigModel.create({});
    }
    return config;
  }

  async updateTokenConfig(dto: any): Promise<TokenConfigDocument> {
    let config = await this.tokenConfigModel.findOne();
    if (!config) {
      // Strip non-schema fields before create
      const clean: any = {};
      for (const key of Object.keys(dto)) {
        if (!['_id', '__v', 'createdAt', 'updatedAt'].includes(key) && dto[key] !== undefined) {
          clean[key] = dto[key];
        }
      }
      config = await this.tokenConfigModel.create(clean);
    } else {
      for (const key of Object.keys(dto)) {
        if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) continue;
        const val = dto[key];
        if (val !== undefined) {
          (config as any)[key] = val;
        }
      }
      await config.save();
    }
    return config;
  }

  async getWallet(userId: string): Promise<WalletDocument> {
    const wallet = await this.walletModel.findOne({ user: userId } as MongoFilter);
    if (!wallet) {
      throw new NotFoundException('کیف پول یافت نشد');
    }
    return wallet;
  }

  async ensureWallet(userId: string): Promise<WalletDocument> {
    let wallet = await this.walletModel.findOne({ user: userId } as MongoFilter);
    if (!wallet) {
      wallet = await this.walletModel.create({ user: userId, balance: 0 } as any);
    }
    return wallet;
  }

  async giveSignupBonus(userId: string): Promise<void> {
    const config = await this.getTokenConfig();
    if (config.signupBonus > 0) {
      const wallet = await this.ensureWallet(userId);
      wallet.balance += config.signupBonus;
      await wallet.save();
      await this.createTransaction(userId, TransactionType.INITIAL_BONUS, config.signupBonus);
    }
  }

  async purchaseTokens(
    userId: string,
    dto: PurchaseTokenDto,
  ): Promise<{ transaction: TransactionDocument; wallet: WalletDocument }> {
    const config = await this.getTokenConfig();
    if (!config.purchaseEnabled) {
      throw new BadRequestException('خرید توکن در حال حاضر غیرفعال است');
    }
    if (dto.tokenAmount < config.minPurchaseAmount) {
      throw new BadRequestException(
        `حداقل مقدار خرید ${config.minPurchaseAmount} توکن می‌باشد`,
      );
    }
    if (dto.tokenAmount > config.maxPurchaseAmount) {
      throw new BadRequestException(
        `حداکثر مقدار خرید ${config.maxPurchaseAmount} توکن می‌باشد`,
      );
    }
    const wallet = await this.ensureWallet(userId);
    wallet.balance += dto.tokenAmount;
    wallet.totalPurchased += dto.tokenAmount;
    await wallet.save();
    const tx = await this.createTransaction(userId, TransactionType.PURCHASE, dto.tokenAmount);
    return { transaction: tx, wallet };
  }

  async transferTokens(
    userId: string,
    targetUserId: string,
    targetName: string,
    senderName: string,
    dto: TransferTokenDto,
  ): Promise<{ sentTx: TransactionDocument; wallet: WalletDocument }> {
    const config = await this.getTokenConfig();
    if (!config.transferEnabled) {
      throw new BadRequestException('انتقال توکن در حال حاضر غیرفعال است');
    }
    const senderWallet = await this.ensureWallet(userId);
    const receiverWallet = await this.ensureWallet(targetUserId);
    let fee = 0;
    if (config.transferFee > 0) {
      fee = config.transferFee;
    } else if (config.transferFeePercent > 0) {
      fee = Math.ceil((dto.amount * config.transferFeePercent) / 100);
    }
    const totalDeduction = dto.amount + fee;
    if (senderWallet.balance < totalDeduction) {
      throw new BadRequestException('موجودی کیف پول کافی نیست');
    }
    senderWallet.balance -= totalDeduction;
    await senderWallet.save();
    receiverWallet.balance += dto.amount;
    await receiverWallet.save();
    const sentTx = await this.createTransaction(userId, TransactionType.TRANSFER_SENT, dto.amount, {
      relatedUser: targetUserId,
      description: dto.description || `انتقال به ${targetName}`,
    });
    await this.createTransaction(targetUserId, TransactionType.TRANSFER_RECEIVED, dto.amount, {
      relatedUser: userId,
      description: dto.description || `دریافت از ${senderName}`,
    });
    if (fee > 0) {
      await this.createTransaction(userId, TransactionType.TRANSFER_SENT, fee, {
        description: 'کارمزد انتقال',
      });
    }
    return { sentTx, wallet: senderWallet };
  }

  async requestSell(
    userId: string,
    dto: SellTokenRequestDto,
  ): Promise<SellRequestDocument> {
    const config = await this.getTokenConfig();
    if (!config.sellEnabled) {
      throw new BadRequestException('فروش توکن در حال حاضر غیرفعال است');
    }
    if (dto.tokenAmount < config.minSellAmount) {
      throw new BadRequestException(
        `حداقل مقدار فروش ${config.minSellAmount} توکن می‌باشد`,
      );
    }
    if (dto.tokenAmount > config.maxSellAmount) {
      throw new BadRequestException(
        `حداکثر مقدار فروش ${config.maxSellAmount} توکن می‌باشد`,
      );
    }
    const wallet = await this.ensureWallet(userId);
    if (wallet.balance < dto.tokenAmount) {
      throw new BadRequestException('موجودی کیف پول کافی نیست');
    }
    const cooldownDate = new Date(Date.now() - config.sellCooldownHours * 60 * 60 * 1000);
    const recentSell = await this.sellRequestModel.findOne({
      user: userId,
      status: { $ne: SellRequestStatus.REJECTED },
      createdAt: { $gte: cooldownDate },
    } as MongoFilter);
    if (recentSell) {
      throw new BadRequestException(
        `حداقل ${config.sellCooldownHours} ساعت باید از آخرین درخواست فروش شما گذشته باشد`,
      );
    }
    wallet.balance -= dto.tokenAmount;
    wallet.blockedBalance = (wallet.blockedBalance || 0) + dto.tokenAmount;
    await wallet.save();
    const tomanAmount = dto.tokenAmount * config.tomanPerToken;
    return this.sellRequestModel.create({
      user: userId,
      tokenAmount: dto.tokenAmount,
      tomanAmount,
      cardNumber: dto.cardNumber,
      shebaNumber: dto.shebaNumber,
    } as any);
  }

  async processSellRequest(
    requestId: string,
    status: string,
    adminNote?: string,
  ): Promise<SellRequestDocument> {
    const request = await this.sellRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('درخواست فروش یافت نشد');
    if (request.status !== SellRequestStatus.PENDING) {
      throw new BadRequestException('این درخواست قبلا پردازش شده است');
    }
    const wallet = await this.ensureWallet(request.user.toString());
    if (status === SellRequestStatus.APPROVED) {
      if ((wallet.blockedBalance || 0) < request.tokenAmount) {
        throw new BadRequestException('موجودی بلاک شده کاربر کافی نیست');
      }
      wallet.blockedBalance = (wallet.blockedBalance || 0) - request.tokenAmount;
      wallet.totalSpent = (wallet.totalSpent || 0) + request.tokenAmount;
      await wallet.save();
      await this.createTransaction(
        request.user.toString(),
        TransactionType.SELL,
        request.tokenAmount,
        { description: adminNote ? `تایید شد: ${adminNote}` : 'درخواست فروش تایید شد' },
      );
      request.processedAt = new Date();
    } else if (status === SellRequestStatus.REJECTED) {
      if ((wallet.blockedBalance || 0) < request.tokenAmount) {
        throw new BadRequestException('موجودی بلاک شده کاربر کافی نیست');
      }
      wallet.blockedBalance = (wallet.blockedBalance || 0) - request.tokenAmount;
      wallet.balance += request.tokenAmount;
      await wallet.save();
      await this.createTransaction(
        request.user.toString(),
        TransactionType.SELL,
        request.tokenAmount,
        {
          status: TransactionStatus.REJECTED,
          description: adminNote ? `رد شد: ${adminNote}` : 'درخواست فروش رد شد',
        },
      );
    }
    request.status = status as SellRequestStatus;
    if (adminNote) request.adminNote = adminNote;
    await request.save();
    return request;
  }

  async getTransactions(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ transactions: TransactionDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find({ user: userId } as MongoFilter)
        .populate('relatedUser', 'fullName mobile username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.transactionModel.countDocuments({ user: userId } as MongoFilter),
    ]);
    return { transactions, total };
  }

  async createGiftCard(
    userId: string,
    dto: CreateGiftCardDto,
    skipWalletCheck = false,
  ): Promise<GiftCardDocument> {
    const config = await this.getTokenConfig();
    if (!config.giftCardEnabled) {
      throw new BadRequestException('کارت هدیه در حال حاضر غیرفعال است');
    }
    if (dto.amount < config.minGiftCardAmount) {
      throw new BadRequestException(
        `حداقل مبلغ کارت هدیه ${config.minGiftCardAmount} توکن می‌باشد`,
      );
    }
    if (dto.amount > config.maxGiftCardAmount) {
      throw new BadRequestException(
        `حداکثر مبلغ کارت هدیه ${config.maxGiftCardAmount} توکن می‌باشد`,
      );
    }
    if (!skipWalletCheck) {
      const userCardCount = await this.giftCardModel.countDocuments({
        creator: userId,
        status: GiftCardStatus.ACTIVE,
      } as MongoFilter);
      if (userCardCount >= config.maxGiftCardsPerUser) {
        throw new BadRequestException(
          `حداکثر ${config.maxGiftCardsPerUser} کارت هدیه فعال می‌توانید داشته باشید`,
        );
      }
      const wallet = await this.ensureWallet(userId);
      if (wallet.balance < dto.amount) {
        throw new BadRequestException('موجودی کیف پول کافی نیست');
      }
      wallet.balance -= dto.amount;
      await wallet.save();
    }
    const code = 'GC-' + uuidv4().slice(0, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + config.giftCardExpiryDays * 24 * 60 * 60 * 1000);
    const card = await this.giftCardModel.create({
      code,
      creator: userId,
      amount: dto.amount,
      message: dto.message,
      expiresAt,
    } as any);
    await this.createTransaction(
      userId,
      TransactionType.GIFT_CARD_CREATE,
      dto.amount,
      {
        description: `ایجاد کارت هدیه ${code}${skipWalletCheck ? ' (توسط ادمین)' : ''}`,
      },
    );
    return card;
  }

  async redeemGiftCard(
    userId: string,
    dto: RedeemGiftCardDto,
  ): Promise<GiftCardDocument> {
    const card = await this.giftCardModel.findOne({ code: dto.code.toUpperCase() });
    if (!card) throw new NotFoundException('کارت هدیه یافت نشد');
    if (card.status !== GiftCardStatus.ACTIVE) {
      throw new BadRequestException('این کارت هدیه قبلا استفاده شده یا منقضی شده است');
    }
    if (card.expiresAt && card.expiresAt < new Date()) {
      card.status = GiftCardStatus.EXPIRED;
      await card.save();
      throw new BadRequestException('این کارت هدیه منقضی شده است');
    }
    card.status = GiftCardStatus.REDEEMED;
    card.redeemedBy = userId as any;
    card.redeemedAt = new Date();
    await card.save();
    const wallet = await this.ensureWallet(userId);
    wallet.balance += card.amount;
    await wallet.save();
    await this.createTransaction(userId, TransactionType.GIFT_CARD_REDEEM, card.amount, {
      description: `دریافت کارت هدیه ${card.code}`,
    });
    return card;
  }

  async getUserGiftCards(userId: string): Promise<GiftCardDocument[]> {
    return this.giftCardModel
      .find({ creator: userId } as MongoFilter)
      .sort({ createdAt: -1 });
  }

  async adminGetAllSellRequests(
    page = 1,
    limit = 20,
  ): Promise<{ requests: SellRequestDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      this.sellRequestModel
        .find()
        .populate('user', 'fullName mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.sellRequestModel.countDocuments(),
    ]);
    return { requests, total };
  }

  async adminGetAllTransactions(
    page = 1,
    limit = 20,
    typeFilter?: string,
    search?: string,
    statusFilter?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ transactions: TransactionDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (typeFilter) filter['type'] = typeFilter;
    if (statusFilter) filter['status'] = statusFilter;
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt['$gte'] = new Date(dateFrom);
      if (dateTo) createdAt['$lte'] = new Date(dateTo);
      filter['createdAt'] = createdAt;
    }
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      // First find matching user IDs by name or mobile
      const matchedUsers = await this.userModel
        .find({
          $or: [
            { fullName: searchRegex },
            { mobile: searchRegex },
          ],
        })
        .select('_id')
        .lean();

      const matchedUserIds = matchedUsers.map((u) => u._id);

      const searchConditions: any[] = [
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
      ];

      if (matchedUserIds.length > 0) {
        searchConditions.push({ user: { $in: matchedUserIds } });
        searchConditions.push({ relatedUser: { $in: matchedUserIds } });
      }

      filter['$or'] = searchConditions;
    }

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find(filter as MongoFilter)
        .populate('user', 'fullName mobile')
        .populate('relatedUser', 'fullName mobile username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.transactionModel.countDocuments(filter as MongoFilter),
    ]);
    return { transactions, total };
  }

  async adminGetAllGiftCards(
    page = 1,
    limit = 20,
  ): Promise<{ cards: GiftCardDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [cards, total] = await Promise.all([
      this.giftCardModel
        .find()
        .populate('creator', 'fullName mobile')
        .populate('redeemedBy', 'fullName mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.giftCardModel.countDocuments(),
    ]);
    return { cards, total };
  }

  async adminAdjustWallet(
    targetUserId: string,
    amount: number,
    description?: string,
  ): Promise<WalletDocument> {
    const wallet = await this.ensureWallet(targetUserId);
    wallet.balance += amount;
    await wallet.save();
    await this.createTransaction(targetUserId, TransactionType.ADMIN_ADJUSTMENT, Math.abs(amount), {
      description: description || 'تنظیم توسط ادمین',
    });
    return wallet;
  }

  private async createTransaction(
    userId: string,
    type: TransactionType,
    amount: number,
    extra?: { relatedUser?: string; description?: string; reference?: string; status?: TransactionStatus },
  ): Promise<TransactionDocument> {
    return this.transactionModel.create({
      user: userId,
      type,
      amount: Math.abs(amount),
      status: extra?.status ?? TransactionStatus.COMPLETED,
      description: extra?.description,
      relatedUser: extra?.relatedUser,
      reference: extra?.reference,
    } as any);
  }
}
