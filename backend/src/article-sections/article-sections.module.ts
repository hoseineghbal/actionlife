import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleSectionsService } from './article-sections.service';
import { ArticleSectionsController } from './article-sections.controller';
import { ArticleSection, ArticleSectionSchema } from './schemas/article-section.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ArticleSection.name, schema: ArticleSectionSchema },
    ]),
  ],
  controllers: [ArticleSectionsController],
  providers: [ArticleSectionsService],
  exports: [ArticleSectionsService],
})
export class ArticleSectionsModule {}
