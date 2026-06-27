import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from './schemas/newsletter.schema';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name) private newsletterModel: Model<NewsletterDocument>,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto): Promise<{ message: string }> {
    const existing = await this.newsletterModel.findOne({ email: dto.email });
    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('این ایمیل قبلاً ثبت شده است');
      }
      existing.isActive = true;
      await existing.save();
      return { message: 'عضویت شما با موفقیت تمدید شد' };
    }
    await this.newsletterModel.create({ email: dto.email });
    return { message: 'ایمیل شما با موفقیت در خبرنامه ثبت شد' };
  }

  async findAll(): Promise<NewsletterDocument[]> {
    return this.newsletterModel.find().sort({ createdAt: -1 });
  }

  async unsubscribe(email: string): Promise<{ message: string }> {
    const sub = await this.newsletterModel.findOne({ email });
    if (!sub) {
      return { message: 'ایمیلی یافت نشد' };
    }
    sub.isActive = false;
    await sub.save();
    return { message: 'لغو عضویت با موفقیت انجام شد' };
  }
}
