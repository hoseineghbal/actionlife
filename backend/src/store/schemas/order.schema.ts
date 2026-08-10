import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: MSchema.Types.ObjectId, ref: 'User', required: true })
  buyer: MSchema.Types.ObjectId;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'Product', required: true })
  product: MSchema.Types.ObjectId;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'User', required: true })
  seller: MSchema.Types.ObjectId;

  @Prop({ required: true })
  productTitle: string;

  @Prop({ required: true })
  productSlug: string;

  @Prop()
  productCover: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  finalPrice: number;

  @Prop({ type: String, enum: ['completed', 'refunded'], default: 'completed' })
  status: string;

  @Prop()
  transactionId: string;

  @Prop()
  variantId: string;

  @Prop()
  variantName: string;

  @Prop({ type: [String], default: [] })
  variantValues: string[];

  @Prop({ required: true, min: 1, default: 1 })
  quantity: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ product: 1 });
OrderSchema.index({ seller: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
