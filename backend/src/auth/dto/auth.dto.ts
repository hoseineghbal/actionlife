import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'شماره موبایل بدون کد کشور' })
  @IsString()
  mobile: string;

  @ApiPropertyOptional({ description: 'کد کشور', default: '+98' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ description: 'شماره موبایل بدون کد کشور' })
  @IsString()
  mobile: string;

  @ApiPropertyOptional({ description: 'کد کشور', default: '+98' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class SendOtpDto {
  @ApiProperty({ description: 'شماره موبایل بدون کد کشور' })
  @IsString()
  mobile: string;

  @ApiPropertyOptional({ description: 'کد کشور', default: '+98' })
  @IsOptional()
  @IsString()
  countryCode?: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'شماره موبایل بدون کد کشور' })
  @IsString()
  mobile: string;

  @ApiPropertyOptional({ description: 'کد کشور', default: '+98' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ description: 'کد ۴ رقمی تأیید' })
  @IsString()
  code: string;
}
