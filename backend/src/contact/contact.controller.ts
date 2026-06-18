import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.contactService.findAll();
  }

  @Put(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }
}
