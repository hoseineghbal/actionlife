import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument, ArticleSection, ArticleStatus } from './schemas/article.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createArticleDto: CreateArticleDto, authorId: string): Promise<ArticleDocument> {
    const article = new this.articleModel({
      ...createArticleDto,
      author: authorId,
    });
    return article.save();
  }

  async findAll(query: {
    section?: ArticleSection;
    status?: ArticleStatus;
    page?: number;
    limit?: number;
    featured?: boolean;
    all?: boolean;
    category?: string;
  }): Promise<{ articles: ArticleDocument[]; total: number }> {
    const { section, status: rawStatus, page = 1, limit = 10, featured, all, category } = query;
    const filter: Record<string, unknown> = {};
    if (!all) {
      filter.status = rawStatus || ArticleStatus.PUBLISHED;
    } else if (rawStatus) {
      filter.status = rawStatus;
    }
    if (section) filter.section = section;
    if (featured !== undefined) filter.isFeatured = featured;
    if (category) {
      const cat = await this.categoryModel.findOne({ slug: category });
      if (cat) {
        filter.categories = cat._id;
      }
    }

    const [articles, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .populate('author', 'fullName avatar')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.articleModel.countDocuments(filter),
    ]);

    return { articles, total };
  }

  async findBySlug(slug: string): Promise<ArticleDocument> {
    const article = await this.articleModel
      .findOne({ slug, status: ArticleStatus.PUBLISHED })
      .populate('author', 'fullName avatar bio')
      .populate('categories', 'name slug');
    if (!article) {
      throw new NotFoundException('مقاله یافت نشد');
    }
    await this.articleModel.findByIdAndUpdate(article._id, { $inc: { views: 1 } });
    return article;
  }

  async findById(id: string): Promise<ArticleDocument> {
    const article = await this.articleModel.findById(id)
      .populate('author', 'fullName avatar')
      .populate('categories', 'name slug');
    if (!article) {
      throw new NotFoundException('مقاله یافت نشد');
    }
    return article;
  }

  async update(id: string, updateDto: Partial<CreateArticleDto>, userId?: string, isAdmin?: boolean): Promise<ArticleDocument> {
    const article = await this.articleModel.findById(id);
    if (!article) throw new NotFoundException('مقاله یافت نشد');

    // Only admin can update published articles
    if (article.status === ArticleStatus.PUBLISHED && !isAdmin) {
      throw new ForbiddenException('امکان ویرایش مقاله منتشر شده وجود ندارد');
    }

    // Non-admin users can only update their own non-published articles
    if (!isAdmin && article.author.toString() !== userId) {
      throw new ForbiddenException('شما اجازه ویرایش این مقاله را ندارید');
    }

    const updated = await this.articleModel.findByIdAndUpdate(id, updateDto, { new: true })!;
    return updated!;
  }

  async delete(id: string, userId?: string, isAdmin?: boolean): Promise<void> {
    const article = await this.articleModel.findById(id);
    if (!article) throw new NotFoundException('مقاله یافت نشد');

    // Only admin can delete published articles
    if (article.status === ArticleStatus.PUBLISHED && !isAdmin) {
      throw new ForbiddenException('امکان حذف مقاله منتشر شده وجود ندارد');
    }

    // Non-admin users can only delete their own non-published articles
    if (!isAdmin && article.author.toString() !== userId) {
      throw new ForbiddenException('شما اجازه حذف این مقاله را ندارید');
    }

    await this.articleModel.findByIdAndDelete(id);
  }

  async getLatest(limit = 6): Promise<ArticleDocument[]> {
    return this.articleModel
      .find({ status: ArticleStatus.PUBLISHED })
      .populate('author', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getFeatured(limit = 4): Promise<ArticleDocument[]> {
    return this.articleModel
      .find({ status: ArticleStatus.PUBLISHED, isFeatured: true })
      .populate('author', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getPopular(limit = 6): Promise<ArticleDocument[]> {
    return this.articleModel
      .find({ status: ArticleStatus.PUBLISHED })
      .populate('author', 'fullName avatar')
      .sort({ views: -1 })
      .limit(limit);
  }

  async findByUser(userId: string, page = 1, limit = 10): Promise<{ articles: ArticleDocument[]; total: number }> {
    const filter = { author: userId as any };
    const [articles, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .populate('author', 'fullName avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.articleModel.countDocuments(filter),
    ]);
    return { articles, total };
  }

  async approve(id: string): Promise<ArticleDocument> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { status: ArticleStatus.PUBLISHED },
      { new: true },
    );
    if (!article) throw new NotFoundException('مقاله یافت نشد');
    return article;
  }

  async reject(id: string, reason?: string): Promise<ArticleDocument> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { status: ArticleStatus.REJECTED, rejectionReason: reason },
      { new: true },
    );
    if (!article) throw new NotFoundException('مقاله یافت نشد');
    return article;
  }
}
