import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PageViewDocument = HydratedDocument<PageView>;

@Schema({ timestamps: true })
export class PageView {
  @Prop({ required: true })
  path: string;

  @Prop()
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;
}

export const PageViewSchema = SchemaFactory.createForClass(PageView);
