import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArticleSectionDocument = HydratedDocument<ArticleSection>;

@Schema({ timestamps: true })
export class ArticleSection {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ArticleSectionSchema = SchemaFactory.createForClass(ArticleSection);
