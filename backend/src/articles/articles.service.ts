import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument, ArticleSection, ArticleStatus } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
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
  }): Promise<{ articles: ArticleDocument[]; total: number }> {
    const { section, status = ArticleStatus.PUBLISHED, page = 1, limit = 10, featured } = query;
    const filter: Record<string, unknown> = { status };
    if (section) filter.section = section;
    if (featured !== undefined) filter.isFeatured = featured;

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

  async update(id: string, updateDto: Partial<CreateArticleDto>): Promise<ArticleDocument> {
    const article = await this.articleModel.findByIdAndUpdate(id, updateDto, { new: true });
    if (!article) {
      throw new NotFoundException('مقاله یافت نشد');
    }
    return article;
  }

  async delete(id: string): Promise<void> {
    const result = await this.articleModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('مقاله یافت نشد');
    }
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
}
