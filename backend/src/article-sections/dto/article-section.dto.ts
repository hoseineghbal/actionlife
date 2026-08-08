import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleSectionDto {
  @ApiProperty({ description: 'نام بخش (مثلا: وبلاگ)' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'اسلاگ بخش (مثلا: blog)' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'توضیحات بخش' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'ترتیب نمایش' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'فعال بودن بخش' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateArticleSectionDto extends CreateArticleSectionDto {}
