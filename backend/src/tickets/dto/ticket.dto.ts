import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;
}

export class AdminCreateTicketDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;
}

export class AddMessageDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ enum: ['user', 'admin'] })
  @IsEnum(['user', 'admin'])
  senderRole: string;

  @ApiProperty()
  @IsString()
  senderName: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: ['open', 'pending', 'closed'] })
  @IsEnum(['open', 'pending', 'closed'])
  status: string;
}
