import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: MSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  user: MSchema.Types.ObjectId;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  blockedBalance: number;

  @Prop({ default: 0 })
  totalPurchased: number;

  @Prop({ default: 0 })
  totalSpent: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
