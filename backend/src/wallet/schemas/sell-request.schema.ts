import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type SellRequestDocument = HydratedDocument<SellRequest>;

export enum SellRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class SellRequest {
  @Prop({ type: MSchema.Types.ObjectId, ref: 'User', required: true })
  user: MSchema.Types.ObjectId;

  @Prop({ required: true })
  tokenAmount: number;

  @Prop({ required: true })
  tomanAmount: number;

  @Prop({ type: String, enum: SellRequestStatus, default: SellRequestStatus.PENDING })
  status: SellRequestStatus;

  @Prop()
  adminNote: string;

  @Prop()
  cardNumber: string;

  @Prop()
  shebaNumber: string;

  @Prop()
  processedAt: Date;
}

export const SellRequestSchema = SchemaFactory.createForClass(SellRequest);
