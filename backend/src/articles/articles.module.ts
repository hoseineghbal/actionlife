import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article, ArticleSchema } from './schemas/article.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Article.name, schema: ArticleSchema },
    { name: Category.name, schema: CategorySchema },
  ])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
