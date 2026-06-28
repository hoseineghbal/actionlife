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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

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
  @ApiQuery({ name: 'all', required: false })
  @ApiQuery({ name: 'category', required: false })
  findAll(
    @Query('section') section?: ArticleSection,
    @Query('status') status?: ArticleStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('featured') featured?: string,
    @Query('all') all?: string,
    @Query('category') category?: string,
  ) {
    return this.articlesService.findAll({
      section,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      featured: featured ? featured === 'true' : undefined,
      all: all === 'true',
      category,
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

  @Get('by-id/:id')
  findById(@Param('id') id: string) {
    return this.articlesService.findById(id);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.articlesService.findByUser(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  // --- User submits a new article (published as pending_review) ---
  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  submit(@Body() createArticleDto: CreateArticleDto, @Request() req: any) {
    return this.articlesService.create(
      { ...createArticleDto, status: ArticleStatus.PENDING_REVIEW },
      req.user.userId,
    );
  }

  // --- Admin creates article directly (published) ---
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createArticleDto: CreateArticleDto, @Request() req: any) {
    return this.articlesService.create(createArticleDto, req.user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateArticleDto>, @Request() req: any) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.articlesService.update(id, updateDto, req.user.userId, isAdmin);
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  approve(@Param('id') id: string) {
    return this.articlesService.approve(id);
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.articlesService.reject(id, reason);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    return this.articlesService.delete(id, req.user.userId, isAdmin);
  }
}
