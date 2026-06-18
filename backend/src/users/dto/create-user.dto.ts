import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ description: 'نام کامل' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'ایمیل' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'موبایل' })
  @IsOptional()
  @IsString()
  mobile?: string;

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
}
