import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  async generateOtp(mobile: string, countryCode: string = '+98'): Promise<string> {
    // In development, always return 1111
    // In production, generate a random 4-digit code and send via SMS
    const code = process.env.NODE_ENV === 'production'
      ? Math.floor(1000 + Math.random() * 9000).toString()
      : '1111';

    // Expire in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate previous OTPs for this mobile
    await this.otpModel.updateMany(
      { mobile, isVerified: false },
      { $set: { isVerified: true } },
    );

    await this.otpModel.create({
      mobile,
      countryCode,
      code,
      expiresAt,
    });

    console.log(`📱 OTP for ${countryCode}${mobile}: ${code}`);

    return code;
  }

  async verifyOtp(mobile: string, code: string): Promise<boolean> {
    const otp = await this.otpModel
      .findOne({ mobile, isVerified: false })
      .sort({ createdAt: -1 });

    if (!otp) {
      throw new NotFoundException('کد تأییدی یافت نشد. لطفاً درخواست کد جدید دهید.');
    }

    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('کد تأیید منقضی شده است. لطفاً کد جدید درخواست کنید.');
    }

    if (otp.code !== code) {
      throw new BadRequestException('کد تأیید اشتباه است.');
    }

    otp.isVerified = true;
    await otp.save();

    return true;
  }
}
