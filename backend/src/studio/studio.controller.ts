import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StudioService } from './studio.service';
import { CreateStudioFileDto, UpdateStudioFileDto } from './dto/studio.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('studio')
@Controller('studio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  @Get()
  findByUser(@Req() req: any, @Query('type') type?: string) {
    return this.studioService.findByUser(req.user.userId, type);
  }

  @Get(':id')
  findById(@Req() req: any, @Param('id') id: string) {
    return this.studioService.findById(id, req.user.userId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateStudioFileDto) {
    return this.studioService.create(req.user.userId, dto);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStudioFileDto) {
    return this.studioService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.studioService.remove(id, req.user.userId);
  }
}
