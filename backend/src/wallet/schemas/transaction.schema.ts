import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

export enum TransactionType {
  PURCHASE = 'purchase',
  TRANSFER_SENT = 'transfer_sent',
  TRANSFER_RECEIVED = 'transfer_received',
  SELL = 'sell',
  GIFT_CARD_CREATE = 'gift_card_create',
  GIFT_CARD_REDEEM = 'gift_card_redeem',
  SHOP_PURCHASE = 'shop_purchase',
  INITIAL_BONUS = 'initial_bonus',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: MSchema.Types.ObjectId, ref: 'User', required: true })
  user: MSchema.Types.ObjectId;

  @Prop({ type: String, enum: TransactionType, required: true })
  type: TransactionType;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: TransactionStatus.COMPLETED, enum: TransactionStatus })
  status: TransactionStatus;

  @Prop()
  description: string;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'User' })
  relatedUser: MSchema.Types.ObjectId;

  @Prop()
  reference: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
