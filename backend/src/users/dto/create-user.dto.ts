import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserPermission, UserLevel } from '../schemas/user.schema';

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

  @ApiPropertyOptional({ type: [String], enum: UserPermission })
  @IsOptional()
  @IsArray()
  @IsEnum(UserPermission, { each: true })
  permissions?: UserPermission[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headerImage?: string;

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

  @ApiPropertyOptional({ description: 'شماره کارت بانکی' })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional({ description: 'شماره شبا' })
  @IsOptional()
  @IsString()
  shebaNumber?: string;

  @ApiPropertyOptional({ description: 'وضعیت فعال بودن کاربر' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'دسترسی فروشگاه' })
  @IsOptional()
  @IsBoolean()
  hasStore?: boolean;

  @ApiPropertyOptional({ description: 'امتیاز کاربر' })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiPropertyOptional({ description: 'تغییر دستی سطح کاربر توسط ادمین (override)', enum: UserLevel })
  @IsOptional()
  @IsEnum(UserLevel)
  overrideLevel?: UserLevel;

  @ApiPropertyOptional({ description: 'امتیاز معیار همکاری کاربر' })
  @IsOptional()
  @IsNumber()
  collaborationScore?: number;

  @ApiPropertyOptional({ description: 'امتیاز معیار فعالیت کاربر' })
  @IsOptional()
  @IsNumber()
  activityScore?: number;

  @ApiPropertyOptional({ description: 'امتیاز معیار پیشرفت در چالش‌ها' })
  @IsOptional()
  @IsNumber()
  challengeProgressScore?: number;

  @ApiPropertyOptional({ description: 'امتیاز معیار مسیر رشد' })
  @IsOptional()
  @IsNumber()
  growthPathScore?: number;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'رمز عبور جدید', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ type: [String], enum: UserPermission })
  @IsOptional()
  @IsArray()
  @IsEnum(UserPermission, { each: true })
  permissions?: UserPermission[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headerImage?: string;

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

  @ApiPropertyOptional({ description: 'شماره کارت بانکی' })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional({ description: 'شماره شبا' })
  @IsOptional()
  @IsString()
  shebaNumber?: string;

  @ApiPropertyOptional({ description: 'دسترسی فروشگاه' })
  @IsOptional()
  @IsBoolean()
  hasStore?: boolean;

  @ApiPropertyOptional({ description: 'وضعیت فعال بودن کاربر' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'امتیاز کاربر' })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiPropertyOptional({
    description: 'وضعیت درخواست فروشگاه',
    enum: ['none', 'pending', 'approved', 'rejected'],
  })
  @IsOptional()
  @IsString()
  storeRequestStatus?: string;

  @ApiPropertyOptional({ description: 'تغییر دستی سطح کاربر توسط ادمین (override)', enum: UserLevel })
  @IsOptional()
  @IsEnum(UserLevel)
  overrideLevel?: UserLevel | null;

  @ApiPropertyOptional({ description: 'امتیاز معیار همکاری کاربر' })
  @IsOptional()
  @IsNumber()
  collaborationScore?: number;

  @ApiPropertyOptional({ description: 'امتیاز معیار فعالیت کاربر' })
  @IsOptional()
  @IsNumber()
  activityScore?: number;

  @ApiPropertyOptional({ description: 'امتیاز معیار پیشرفت در چالش‌ها' })
  @IsOptional()
  @IsNumber()
  challengeProgressScore?: number;

  @ApiPropertyOptional({ description: 'امتیاز معیار مسیر رشد' })
  @IsOptional()
  @IsNumber()
  growthPathScore?: number;
}
