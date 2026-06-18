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
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleSection, ArticleStatus } from './schemas/article.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiQuery({ name: 'section', required: false, enum: ArticleSection })
  @ApiQuery({ name: 'status', required: false, enum: ArticleStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'featured', required: false })
  findAll(
    @Query('section') section?: ArticleSection,
    @Query('status') status?: ArticleStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('featured') featured?: string,
  ) {
    return this.articlesService.findAll({
      section,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      featured: featured ? featured === 'true' : undefined,
    });
  }

  @Get('latest')
  getLatest(@Query('limit') limit?: string) {
    return this.articlesService.getLatest(limit ? parseInt(limit) : 6);
  }

  @Get('featured')
  getFeatured(@Query('limit') limit?: string) {
    return this.articlesService.getFeatured(limit ? parseInt(limit) : 4);
  }

  @Get('popular')
  getPopular(@Query('limit') limit?: string) {
    return this.articlesService.getPopular(limit ? parseInt(limit) : 6);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createArticleDto: CreateArticleDto, @Request() req: any) {
    return this.articlesService.create(createArticleDto, req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateArticleDto>) {
    return this.articlesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.articlesService.delete(id);
  }
}
