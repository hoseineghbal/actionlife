import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
  Min,
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
}
