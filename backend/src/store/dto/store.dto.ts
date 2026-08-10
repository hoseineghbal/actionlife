import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductFileDto {
  @IsString()
  url: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsString()
  @IsEnum(['pdf', 'image', 'video', 'audio'])
  fileType: string;

  @IsOptional()
  @IsNumber()
  order: number;
}

export class ProductVariantDto {
  @IsString()
  variantId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values: string[];

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  priceDiff: number;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  excerpt: string;

  @IsOptional()
  @IsString()
  coverImage: string;

  @IsNumber()
  @Min(1)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFileDto)
  files: ProductFileDto[];

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsString()
  @IsEnum(['draft', 'pending', 'published', 'rejected', 'archived'])
  status: string;

  @IsOptional()
  @IsString()
  @IsEnum(['new', 'used', 'clearance'])
  condition: string;

  @IsOptional()
  @IsString()
  @IsEnum(['physical', 'digital'])
  productType: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsString()
  sku: string;

  @IsOptional()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsBoolean()
  trackInventory: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  excerpt: string;

  @IsOptional()
  @IsString()
  coverImage: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDiscountDto)
  discounts: ProductDiscountDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFileDto)
  files: ProductFileDto[];

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsString()
  @IsEnum(['draft', 'pending', 'published', 'rejected', 'archived'])
  status: string;

  @IsOptional()
  @IsString()
  @IsEnum(['new', 'used', 'clearance'])
  condition: string;

  @IsOptional()
  @IsString()
  @IsEnum(['physical', 'digital'])
  productType: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsString()
  sku: string;

  @IsOptional()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsBoolean()
  trackInventory: boolean;
}

export class ProductDiscountDto {
  @IsNumber()
  @Min(1)
  discountPrice: number;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}

export class SetDiscountsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDiscountDto)
  discounts: ProductDiscountDto[];
}

export class PurchaseProductDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity: number;
}
