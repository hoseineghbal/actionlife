import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { GiftCard, GiftCardSchema } from './schemas/gift-card.schema';
import { TokenConfig, TokenConfigSchema } from './schemas/token-config.schema';
import { SellRequest, SellRequestSchema } from './schemas/sell-request.schema';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: GiftCard.name, schema: GiftCardSchema },
      { name: TokenConfig.name, schema: TokenConfigSchema },
      { name: SellRequest.name, schema: SellRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
