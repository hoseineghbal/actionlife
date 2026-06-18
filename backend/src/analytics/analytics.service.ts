import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageView, PageViewDocument } from './schemas/pageview.schema';
import { CreatePageViewDto } from './dto/pageview.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(PageView.name) private pageViewModel: Model<PageViewDocument>,
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
