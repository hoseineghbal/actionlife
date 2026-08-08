import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ArticleSection, ArticleSectionDocument } from './schemas/article-section.schema';
import { CreateArticleSectionDto } from './dto/article-section.dto';

@Injectable()
export class ArticleSectionsService {
  constructor(
    @InjectModel(ArticleSection.name)
    private readonly sectionModel: Model<ArticleSectionDocument>,
  ) {}

  async findAll(): Promise<ArticleSectionDocument[]> {
    return this.sectionModel.find().sort({ order: 1, createdAt: -1 }).exec();
  }

  async findActive(): Promise<ArticleSectionDocument[]> {
    return this.sectionModel.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).exec();
  }

  async findBySlug(slug: string): Promise<ArticleSectionDocument> {
    const section = await this.sectionModel.findOne({ slug }).exec();
    if (!section) throw new NotFoundException('بخش مورد نظر یافت نشد');
    return section;
  }

  async findById(id: string): Promise<ArticleSectionDocument> {
    const section = await this.sectionModel.findById(id).exec();
    if (!section) throw new NotFoundException('بخش مورد نظر یافت نشد');
    return section;
  }

  async create(dto: CreateArticleSectionDto): Promise<ArticleSectionDocument> {
    const existing = await this.sectionModel.findOne({ slug: dto.slug }).exec();
    if (existing) throw new ConflictException('بخشی با این اسلاگ قبلا ثبت شده است');

    const maxOrder = await this.sectionModel.findOne().sort({ order: -1 }).select('order').exec();
    const order = dto.order ?? (maxOrder ? maxOrder.order + 1 : 0);

    return this.sectionModel.create({ ...dto, order });
  }

  async update(id: string, dto: Partial<CreateArticleSectionDto>): Promise<ArticleSectionDocument> {
    const section = await this.sectionModel.findById(id).exec();
    if (!section) throw new NotFoundException('بخش مورد نظر یافت نشد');

    if (dto.slug && dto.slug !== section.slug) {
      const existing = await this.sectionModel.findOne({ slug: dto.slug, _id: { $ne: id } }).exec();
      if (existing) throw new ConflictException('بخشی با این اسلاگ قبلا ثبت شده است');
    }

    const updated = await this.sectionModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    return updated!;
  }

  async delete(id: string): Promise<void> {
    const result = await this.sectionModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('بخش مورد نظر یافت نشد');
  }
}
