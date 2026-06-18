import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePageViewDto {
  @ApiProperty()
  @IsString()
  path: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
}
