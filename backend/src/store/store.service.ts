import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Order, OrderDocument } from './schemas/order.schema';
import { Wallet, WalletDocument } from '../wallet/schemas/wallet.schema';
import {
  Transaction,
  TransactionDocument,
  TransactionType,
  TransactionStatus,
} from '../wallet/schemas/transaction.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateProductDto, UpdateProductDto } from './dto/store.dto';

type MongoFilter = Record<string, unknown>;

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    seller?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const filter: MongoFilter = { status: query.status || 'published' };
    if (query.category) filter.category = query.category;
    if (query.seller) filter.seller = query.seller;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: MongoFilter = {};
      if (query.minPrice !== undefined) priceFilter.$gte = query.minPrice;
      if (query.maxPrice !== undefined) priceFilter.$lte = query.maxPrice;
      filter.price = priceFilter;
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { tags: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .select('-files')
        .populate('seller', 'fullName avatar')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.productModel.countDocuments(filter),
    ]);

    return { products, total };
  }

  async findBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug, status: 'published' })
      .populate('seller', 'fullName avatar bio')
      .populate('category', 'name slug');

    if (!product) throw new NotFoundException('محصول یافت نشد');
    return product;
  }

  async findById(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('seller', 'fullName avatar bio')
      .populate('category', 'name slug');

    if (!product) throw new NotFoundException('محصول یافت نشد');
    return product;
  }

  async create(dto: CreateProductDto, sellerId: string) {
    const user = await this.userModel.findById(sellerId);
    if (!user) throw new ForbiddenException('کاربر یافت نشد');
    if (!user.hasStore && user.role !== 'admin') {
      throw new ForbiddenException('شما دسترسی به ایجاد فروشگاه ندارید');
    }

    const existing = await this.productModel.findOne({ slug: dto.slug });
    if (existing) throw new BadRequestException('این اسلاگ قبلا استفاده شده');

    // Users can only set draft; admins can set anything. "published" from a user becomes "pending"
    let finalStatus = dto.status || 'draft';
    if (user.role !== 'admin' && finalStatus === 'published') {
      finalStatus = 'pending';
    }

    return this.productModel.create({
      ...dto,
      status: finalStatus,
      seller: sellerId,
    } as any);
  }

  async update(id: string, dto: UpdateProductDto, sellerId: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('محصول یافت نشد');

    const user = await this.userModel.findById(sellerId);
    if (!user) throw new ForbiddenException('کاربر یافت نشد');
    if (product.seller.toString() !== sellerId && user.role !== 'admin') {
      throw new ForbiddenException('شما دسترسی به ویرایش این محصول ندارید');
    }

    // Only admin can edit published products
    if (product.status === 'published' && user.role !== 'admin') {
      throw new ForbiddenException('محصول منتشر شده توسط ادمین قابل ویرایش نیست');
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.productModel.findOne({ slug: dto.slug });
      if (existing) throw new BadRequestException('این اسلاگ قبلا استفاده شده');
    }

    // Only assign defined (non-undefined) fields to avoid overwriting with undefined
    for (const key of Object.keys(dto) as (keyof UpdateProductDto)[]) {
      const val = dto[key];
      if (val !== undefined) {
        // Users setting status to "published" get "pending" instead; admins skip this
        if (key === 'status' && val === 'published' && user.role !== 'admin') {
          (product as unknown as Record<string, unknown>).status = 'pending';
        } else {
          (product as unknown as Record<string, unknown>)[key] = val;
        }
      }
    }
    return product.save();
  }

  async remove(id: string, sellerId: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('محصول یافت نشد');

    const user = await this.userModel.findById(sellerId);
    if (!user) throw new ForbiddenException('کاربر یافت نشد');
    if (product.seller.toString() !== sellerId && user.role !== 'admin') {
      throw new ForbiddenException('شما دسترسی به حذف این محصول ندارید');
    }

    // Only admin can delete published products
    if (product.status === 'published' && user.role !== 'admin') {
      throw new ForbiddenException('محصول منتشر شده توسط ادمین قابل حذف نیست');
    }

    await product.deleteOne();
    return { message: 'محصول با موفقیت حذف شد' };
  }

  async purchase(productId: string, buyerId: string) {
    const product = await this.productModel.findById(productId);
    if (!product || product.status !== 'published') {
      throw new NotFoundException('محصول یافت نشد یا در دسترس نیست');
    }

    if (product.seller.toString() === buyerId) {
      throw new BadRequestException('نمی‌توانید محصول خود را خریداری کنید');
    }

    const existingOrder = await this.orderModel.findOne({
      buyer: buyerId,
      product: productId,
      status: 'completed',
    } as MongoFilter);
    if (existingOrder) {
      throw new BadRequestException('شما قبلا این محصول را خریداری کرده‌اید');
    }

    const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    const wallet = await this.walletModel.findOne({ user: buyerId } as MongoFilter);
    if (!wallet || wallet.balance < finalPrice) {
      throw new BadRequestException('موجودی توکن کافی نیست');
    }

    wallet.balance -= finalPrice;
    wallet.totalSpent += finalPrice;
    await wallet.save();

    await this.walletModel.findOneAndUpdate(
      { user: product.seller },
      { $inc: { balance: finalPrice, totalPurchased: finalPrice } },
      { upsert: true },
    );

    const tx = await this.transactionModel.create({
      user: buyerId,
      type: TransactionType.SHOP_PURCHASE,
      amount: -finalPrice,
      status: TransactionStatus.COMPLETED,
      description: `خرید محصول: ${product.title}`,
      relatedUser: product.seller,
    } as any);

    const order = await this.orderModel.create({
      buyer: buyerId,
      product: productId,
      seller: product.seller,
      productTitle: product.title,
      productSlug: product.slug,
      productCover: product.coverImage,
      price: product.price,
      finalPrice,
      status: 'completed',
      transactionId: tx._id.toString(),
    } as any);

    product.salesCount += 1;
    await product.save();

    return { order, walletBalance: wallet.balance };
  }

  async getUserPurchases(buyerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter: MongoFilter = { buyer: buyerId, status: 'completed' };
    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.orderModel.countDocuments(filter),
    ]);

    return { orders, total };
  }

  async hasPurchased(productId: string, userId: string): Promise<boolean> {
    const order = await this.orderModel.findOne({
      buyer: userId,
      product: productId,
      status: 'completed',
    } as MongoFilter);
    return !!order;
  }

  async getSellerProducts(sellerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter: MongoFilter = { seller: sellerId };
    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.productModel.countDocuments(filter),
    ]);

    return { products, total };
  }

  async getSellerOrders(sellerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter: MongoFilter = { seller: sellerId, status: 'completed' };
    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('buyer', 'fullName mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.orderModel.countDocuments(filter),
    ]);

    return { orders, total };
  }

  async adminFindAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel
        .find()
        .populate('seller', 'fullName mobile')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.productModel.countDocuments(),
    ]);

    return { products, total };
  }

  async adminUpdateStatus(id: string, status: string) {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!product) throw new NotFoundException('محصول یافت نشد');
    return product;
  }
}
