import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateStudioFileDto {
  @IsString()
  url: string;

  @IsString()
  title: string;

  @IsEnum(['video', 'audio'])
  type: 'video' | 'audio';

  @IsOptional()
  @IsString()
  mimeType: string;

  @IsOptional()
  @IsNumber()
  size: number;

  @IsOptional()
  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  thumbnail: string;
}

export class UpdateStudioFileDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  thumbnail: string;

  @IsOptional()
  @IsNumber()
  duration: number;

  @IsOptional()
  @IsNumber()
  size: number;
}
