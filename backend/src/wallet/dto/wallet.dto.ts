import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class PurchaseTokenDto {
  @IsNumber()
  @Min(1)
  tokenAmount: number;
}

export class TransferTokenDto {
  @IsOptional()
  @IsString()
  targetMobile?: string;

  @IsOptional()
  @IsString()
  targetUsername?: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SellTokenRequestDto {
  @IsNumber()
  @Min(1)
  tokenAmount: number;

  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsString()
  shebaNumber?: string;
}

export class CreateGiftCardDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  message?: string;
}

export class RedeemGiftCardDto {
  @IsString()
  code: string;
}

export class UpdateTokenConfigDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsOptional()
  __v?: number;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  createdAt?: string;

  @IsOptional()
  updatedAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  tomanPerToken?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSellAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSellAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  sellCooldownHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  signupBonus?: number;

  @IsOptional()
  sellEnabled?: boolean;

  @IsOptional()
  purchaseEnabled?: boolean;

  @IsOptional()
  transferEnabled?: boolean;

  @IsOptional()
  giftCardEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minGiftCardAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxGiftCardAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxGiftCardsPerUser?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  giftCardExpiryDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transferFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transferFeePercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketplaceFeePercent?: number;
}

export class ProcessSellRequestDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  adminNote?: string;
}

export class AdjustWalletDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
