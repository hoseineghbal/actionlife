import { IsArray, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ description: 'نام کامل' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'شماره موبایل' })
  @IsString()
  mobile: string;

  @ApiPropertyOptional({ description: 'کد کشور', default: '+98' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ description: 'ایمیل' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'رمز عبور', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'تاریخ تولد' })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'جنسیت' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'مقطع تحصیلی' })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiPropertyOptional({ description: 'رشته تحصیلی' })
  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @ApiPropertyOptional({ description: 'تخصص' })
  @IsOptional()
  @IsString()
  expertise?: string;

  @ApiPropertyOptional({ description: 'علایق', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({ description: 'کشور' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'شهر' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'وبسایت' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'اینستاگرام' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ description: 'لینکدین' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'توییتر' })
  @IsOptional()
  @IsString()
  twitter?: string;
}
