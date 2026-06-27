import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { WalletService } from './wallet.service';
import {
  PurchaseTokenDto,
  TransferTokenDto,
  SellTokenRequestDto,
  CreateGiftCardDto,
  RedeemGiftCardDto,
  UpdateTokenConfigDto,
  ProcessSellRequestDto,
  AdjustWalletDto,
} from './dto/wallet.dto';
import { UsersService } from '../users/users.service';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyWallet(@Request() req: any) {
    return this.walletService.getWallet(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getMyTransactions(@Request() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.walletService.getTransactions(req.user.userId, +page, +limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  async purchaseTokens(@Request() req: any, @Body() dto: PurchaseTokenDto) {
    return this.walletService.purchaseTokens(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  async transferTokens(@Request() req: any, @Body() dto: TransferTokenDto) {
    let target = null;

    // Search by username first, then by mobile
    if (dto.targetUsername?.trim()) {
      target = await this.usersService.findByUsername(dto.targetUsername.trim());
      if (!target) {
        throw new BadRequestException('کاربری با این نام کاربری یافت نشد');
      }
    } else if (dto.targetMobile?.trim()) {
      target = await this.usersService.findByMobile(dto.targetMobile.trim());
      if (!target) {
        throw new BadRequestException('کاربری با این شماره موبایل یافت نشد');
      }
    } else {
      throw new BadRequestException('لطفاً نام کاربری یا شماره موبایل مقصد را وارد کنید');
    }

    if (target._id.toString() === req.user.userId) {
      throw new BadRequestException('نمی‌توانید به خودتان انتقال دهید');
    }
    const sender = await this.usersService.findById(req.user.userId);
    return this.walletService.transferTokens(
      req.user.userId,
      target._id.toString(),
      target.fullName,
      sender?.fullName || 'کاربر',
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('sell-request')
  async requestSell(@Request() req: any, @Body() dto: SellTokenRequestDto) {
    return this.walletService.requestSell(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/gift-card')
  async adminCreateGiftCard(@Request() req: any, @Body() dto: CreateGiftCardDto) {
    return this.walletService.createGiftCard(req.user.userId, dto, true);
  }

  @UseGuards(JwtAuthGuard)
  @Post('gift-card/redeem')
  async redeemGiftCard(@Request() req: any, @Body() dto: RedeemGiftCardDto) {
    return this.walletService.redeemGiftCard(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('gift-cards')
  async getMyGiftCards(@Request() req: any) {
    return this.walletService.getUserGiftCards(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('config')
  async getPublicConfig() {
    const config = await this.walletService.getTokenConfig();
    return {
      tomanPerToken: config.tomanPerToken,
      minPurchaseAmount: config.minPurchaseAmount,
      maxPurchaseAmount: config.maxPurchaseAmount,
      minSellAmount: config.minSellAmount,
      maxSellAmount: config.maxSellAmount,
      sellCooldownHours: config.sellCooldownHours,
      sellEnabled: config.sellEnabled,
      purchaseEnabled: config.purchaseEnabled,
      transferEnabled: config.transferEnabled,
      giftCardEnabled: config.giftCardEnabled,
      minGiftCardAmount: config.minGiftCardAmount,
      maxGiftCardAmount: config.maxGiftCardAmount,
      maxGiftCardsPerUser: config.maxGiftCardsPerUser,
      giftCardExpiryDays: config.giftCardExpiryDays,
      transferFee: config.transferFee,
      transferFeePercent: config.transferFeePercent,
    };
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/config')
  async getAdminConfig() {
    return this.walletService.getTokenConfig();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('admin/config')
  async updateTokenConfig(@Body() dto: UpdateTokenConfigDto) {
    return this.walletService.updateTokenConfig(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/sell-requests')
  async getSellRequests(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.walletService.adminGetAllSellRequests(+page, +limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('admin/sell-requests/:id')
  async processSellRequest(@Param('id') id: string, @Body() dto: ProcessSellRequestDto) {
    return this.walletService.processSellRequest(id, dto.status, dto.adminNote);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/transactions')
  async getAllTransactions(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.walletService.adminGetAllTransactions(+page, +limit, type, search, status, from, to);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/gift-cards')
  async getAllGiftCards(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.walletService.adminGetAllGiftCards(+page, +limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/adjust')
  async adjustWallet(@Body() dto: AdjustWalletDto) {
    return this.walletService.adminAdjustWallet(dto.userId, dto.amount, dto.description);
  }
}
