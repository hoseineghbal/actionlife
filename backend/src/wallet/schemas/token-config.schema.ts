import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TokenConfigDocument = HydratedDocument<TokenConfig>;

@Schema({ timestamps: true })
export class TokenConfig {
  @Prop({ default: 1000 })
  tomanPerToken: number;

  @Prop({ default: 0 })
  minPurchaseAmount: number;

  @Prop({ default: 100000 })
  maxPurchaseAmount: number;

  @Prop({ default: 0 })
  minSellAmount: number;

  @Prop({ default: 500000 })
  maxSellAmount: number;

  @Prop({ default: 24 })
  sellCooldownHours: number;

  @Prop({ default: 100 })
  signupBonus: number;

  @Prop({ default: true })
  sellEnabled: boolean;

  @Prop({ default: true })
  purchaseEnabled: boolean;

  @Prop({ default: true })
  transferEnabled: boolean;

  @Prop({ default: true })
  giftCardEnabled: boolean;

  @Prop({ default: 0 })
  minGiftCardAmount: number;

  @Prop({ default: 1000000 })
  maxGiftCardAmount: number;

  @Prop({ default: 100 })
  maxGiftCardsPerUser: number;

  @Prop({ default: 30 })
  giftCardExpiryDays: number;

  @Prop({ default: 0 })
  transferFee: number;

  @Prop({ default: 0 })
  transferFeePercent: number;

  @Prop({ default: 0 })
  marketplaceFeePercent: number;
}

export const TokenConfigSchema = SchemaFactory.createForClass(TokenConfig);
