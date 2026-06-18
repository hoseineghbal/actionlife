import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

export enum ArticleSection {
  BLOG = 'blog',
  ACTION_CINEMA = 'action-cinema',
  ACTION_GAME = 'action-game',
  ACTION_TRIP = 'action-trip',
  ACTION_FIT = 'action-fit',
  ACTION_MEDIA = 'action-media',
}

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  excerpt: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  featuredImage: string;

  @Prop({ type: String, enum: ArticleSection, required: true })
  section: ArticleSection;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categories: Types.ObjectId[];

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: String, enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status: ArticleStatus;

  @Prop({ default: 0 })
  views: number;

  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;

  @Prop({ default: false })
  isFeatured: boolean;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ section: 1, status: 1 });
ArticleSchema.index({ tags: 1 });
