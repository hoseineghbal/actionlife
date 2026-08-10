import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;
export type ProductCondition = 'new' | 'used' | 'clearance';
export type ProductType = 'physical' | 'digital';

@Schema({ _id: false })
export class ProductFile {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: ['pdf', 'image', 'video', 'audio'] })
  fileType: string;

  @Prop({ default: 0 })
  order: number;
}

export const ProductFileSchema = SchemaFactory.createForClass(ProductFile);

@Schema({ _id: false })
export class ProductDiscount {
  @Prop({ required: true, min: 0 })
  discountPrice: number;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;
}

export const ProductDiscountSchema = SchemaFactory.createForClass(ProductDiscount);

@Schema({ _id: false })
export class ProductVariant {
  @Prop({ required: true })
  variantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  values: string[];

  @Prop({ required: true, min: 0, default: 0 })
  quantity: number;

  @Prop({ min: 0 })
  priceDiff: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  excerpt: string;

  @Prop()
  coverImage: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 0 })
  discountPrice: number;

  @Prop({ type: [ProductDiscountSchema], default: [] })
  discounts: ProductDiscount[];

  @Prop({ type: [ProductFileSchema], default: [] })
  files: ProductFile[];

  @Prop({ type: MSchema.Types.ObjectId, ref: 'Category', default: null })
  category: MSchema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, enum: ['draft', 'pending', 'published', 'rejected', 'archived'], default: 'draft' })
  status: string;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'User', required: true })
  seller: MSchema.Types.ObjectId;

  @Prop({ default: 0 })
  salesCount: number;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: String, enum: ['new', 'used', 'clearance'], default: 'new' })
  condition: ProductCondition;

  @Prop({ type: String, enum: ['physical', 'digital'], default: 'physical' })
  productType: ProductType;

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants: ProductVariant[];

  @Prop({ required: true, min: 0, default: 0 })
  stockQuantity: number;

  @Prop()
  sku: string;

  @Prop()
  weight: number;

  @Prop({ default: true })
  trackInventory: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ seller: 1, status: 1 });
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
