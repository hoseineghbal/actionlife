import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageView, PageViewDocument } from './schemas/pageview.schema';
import { CreatePageViewDto } from './dto/pageview.dto';
import { Transaction, TransactionDocument, TransactionType } from '../wallet/schemas/transaction.schema';
import { Order, OrderDocument } from '../store/schemas/order.schema';
import { Product, ProductDocument } from '../store/schemas/product.schema';
import { TokenConfig, TokenConfigDocument } from '../wallet/schemas/token-config.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(PageView.name) private pageViewModel: Model<PageViewDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(TokenConfig.name) private tokenConfigModel: Model<TokenConfigDocument>,
  ) {}

  async trackView(
    dto: CreatePageViewDto,
    userId?: string,
    ip?: string,
    userAgent?: string,
  ): Promise<PageViewDocument> {
    const view = new this.pageViewModel({
      path: dto.path,
      title: dto.title,
      userId: userId || undefined,
      ip,
      userAgent,
    });
    return view.save();
  }

  async getOverview(totalUsers: number, totalContacts: number, openTickets: number) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalPageViews, todayPageViews, topPages, dailyViews] = await Promise.all([
      this.pageViewModel.countDocuments(),
      this.pageViewModel.countDocuments({ createdAt: { $gte: todayStart } }),
      this.pageViewModel.aggregate([
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { path: '$_id', count: 1, _id: 0 } },
      ]),
      this.getDailyViews(30),
    ]);

    return {
      totalPageViews,
      todayPageViews,
      totalUsers,
      totalContacts,
      openTickets,
      topPages,
      dailyViews,
    };
  }

  async getAdminDashboard(from?: string, to?: string) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter['$gte'] = new Date(from);
    if (to) dateFilter['$lte'] = new Date(to);
    const matchDate = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Token config for conversion rate
    const config = await this.tokenConfigModel.findOne();
    const tomanPerToken = config?.tomanPerToken ?? 1000;

    // Ecosystem: Total coins in wallets
    const walletsAgg = await this.transactionModel.aggregate([
      { $match: { status: 'completed', ...matchDate } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const purchaseData = walletsAgg.find((w) => w._id === TransactionType.PURCHASE) || { totalAmount: 0, count: 0 };
    const sellData = walletsAgg.find((w) => w._id === TransactionType.SELL) || { totalAmount: 0, count: 0 };

    // total coins in circulation = total purchased (coin buy)
    const totalCoinsPurchased = purchaseData.totalAmount;
    const totalRialValue = totalCoinsPurchased * tomanPerToken;

    // Store: orders
    const orderAgg = await this.orderModel.aggregate([
      { $match: { status: 'completed', ...matchDate } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSalesAmount: { $sum: '$finalPrice' },
        },
      },
    ]);
    const storeStats = orderAgg[0] || { totalOrders: 0, totalSalesAmount: 0 };

    // New products in date range
    const newProductsCount = await this.productModel.countDocuments(matchDate);

    // Products by sales (top 10)
    const productsBySales = await this.productModel.aggregate([
      { $match: matchDate },
      { $sort: { salesCount: -1 } },
      { $limit: 10 },
      { $project: { title: 1, salesCount: 1, _id: 0 } },
    ]);

    // Daily coin transactions for chart
    const dailyCoinTransactions = await this.getDailyCoinTransactions(from, to);

    // Daily store sales for chart
    const dailyStoreSales = await this.getDailyStoreSales(from, to);

    return {
      ecosystem: {
        totalCoinsPurchased,
        totalRialValue,
        tomanPerToken,
        coinBuyAmount: purchaseData.totalAmount,
        coinBuyCount: purchaseData.count,
        coinSellAmount: sellData.totalAmount,
        coinSellCount: sellData.count,
      },
      store: {
        totalOrders: storeStats.totalOrders,
        totalSalesAmount: storeStats.totalSalesAmount,
        newProductsCount,
        productsBySales,
      },
      dailyCoinTransactions,
      dailyStoreSales,
    };
  }

  private async getDailyCoinTransactions(from?: string, to?: string) {
    const startDate = from ? new Date(from) : new Date();
    if (!from) startDate.setDate(startDate.getDate() - 30);
    const endDate = to ? new Date(to) : new Date();

    const result = await this.transactionModel.aggregate([
      {
        $match: {
          status: 'completed',
          type: { $in: [TransactionType.PURCHASE, TransactionType.SELL] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Pivot the data: each date has buy and sell amounts
    const map = new Map<string, { date: string; buy: number; sell: number }>();
    for (const item of result) {
      const date = item._id.date;
      if (!map.has(date)) map.set(date, { date, buy: 0, sell: 0 });
      const entry = map.get(date)!;
      if (item._id.type === TransactionType.PURCHASE) entry.buy = item.totalAmount;
      else if (item._id.type === TransactionType.SELL) entry.sell = item.totalAmount;
    }
    return Array.from(map.values());
  }

  private async getDailyStoreSales(from?: string, to?: string) {
    const startDate = from ? new Date(from) : new Date();
    if (!from) startDate.setDate(startDate.getDate() - 30);
    const endDate = to ? new Date(to) : new Date();

    const result = await this.orderModel.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalPrice' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, totalAmount: 1, _id: 0 } },
    ]);

    return result;
  }

  private async getDailyViews(days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.pageViewModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    return result;
  }
}
