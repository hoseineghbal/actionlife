import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type GiftCardDocument = HydratedDocument<GiftCard>;

export enum GiftCardStatus {
  ACTIVE = 'active',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class GiftCard {
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'User', required: true })
  creator: MSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, enum: GiftCardStatus, default: GiftCardStatus.ACTIVE })
  status: GiftCardStatus;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'User' })
  redeemedBy: MSchema.Types.ObjectId;

  @Prop()
  redeemedAt: Date;

  @Prop()
  expiresAt: Date;

  @Prop()
  message: string;
}

export const GiftCardSchema = SchemaFactory.createForClass(GiftCard);
