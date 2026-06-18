import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ description: 'نام' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'ایمیل' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'موبایل' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ description: 'موضوع' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'پیام' })
  @IsString()
  message: string;
}
