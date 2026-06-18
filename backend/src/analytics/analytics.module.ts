import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PageView, PageViewSchema } from './schemas/pageview.schema';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { UsersModule } from '../users/users.module';
import { ContactModule } from '../contact/contact.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PageView.name, schema: PageViewSchema }]),
    UsersModule,
    ContactModule,
    TicketsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
