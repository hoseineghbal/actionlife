import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { CategoriesModule } from './categories/categories.module';
import { ContactModule } from './contact/contact.module';
import { TicketsModule } from './tickets/tickets.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UploadModule } from './upload/upload.module';
import { OtpModule } from './otp/otp.module';
import { WalletModule } from './wallet/wallet.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { StoreModule } from './store/store.module';
import { StudioModule } from './studio/studio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/actionlife'),
    AuthModule,
    UsersModule,
    ArticlesModule,
    CategoriesModule,
    ContactModule,
    TicketsModule,
    AnalyticsModule,
    UploadModule,
    OtpModule,
    WalletModule,
    NewsletterModule,
    StoreModule,
    StudioModule,
  ],
})
export class AppModule {}
