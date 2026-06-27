import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeNewsletterDto {
  @ApiProperty({ description: 'ایمیل' })
  @IsEmail()
  email: string;
}
