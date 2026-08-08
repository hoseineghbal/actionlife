import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PageView, PageViewSchema } from './schemas/pageview.schema';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { UsersModule } from '../users/users.module';
import { ContactModule } from '../contact/contact.module';
import { TicketsModule } from '../tickets/tickets.module';
import { Transaction, TransactionSchema } from '../wallet/schemas/transaction.schema';
import { Order, OrderSchema } from '../store/schemas/order.schema';
import { Product, ProductSchema } from '../store/schemas/product.schema';
import { TokenConfig, TokenConfigSchema } from '../wallet/schemas/token-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PageView.name, schema: PageViewSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: TokenConfig.name, schema: TokenConfigSchema },
    ]),
    UsersModule,
    ContactModule,
    TicketsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
