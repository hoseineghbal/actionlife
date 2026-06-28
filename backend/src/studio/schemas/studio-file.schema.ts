import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type StudioFileDocument = HydratedDocument<StudioFile>;

@Schema({ timestamps: true })
export class StudioFile {
  @Prop({ type: MSchema.Types.ObjectId, ref: 'User', required: true })
  user: MSchema.Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  title: string;

  @Prop({ enum: ['video', 'audio'], required: true })
  type: 'video' | 'audio';

  @Prop({ default: 'video/mp4' })
  mimeType: string;

  @Prop({ default: 0 })
  size: number;

  @Prop({ default: 0 })
  duration: number;

  @Prop()
  thumbnail: string;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop()
  originalUrl: string;
}

export const StudioFileSchema = SchemaFactory.createForClass(StudioFile);
StudioFileSchema.index({ user: 1, createdAt: -1 });
