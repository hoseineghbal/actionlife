import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { WalletService } from '../wallet/wallet.service';
import { RegisterDto, LoginDto, VerifyOtpDto, SendOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private walletService: WalletService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      fullName: registerDto.fullName,
      mobile: registerDto.mobile,
      countryCode: registerDto.countryCode || '+98',
      password: registerDto.password,
    });

    // Generate and send OTP
    const code = await this.otpService.generateOtp(registerDto.mobile, registerDto.countryCode || '+98');

    return {
      message: 'ثبت نام با موفقیت انجام شد. کد تأیید ارسال شد.',
      mobile: registerDto.mobile,
      countryCode: registerDto.countryCode || '+98',
      otp: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async sendOtp(sendOtpDto: SendOtpDto) {
    const countryCode = sendOtpDto.countryCode || '+98';
    const code = await this.otpService.generateOtp(sendOtpDto.mobile, countryCode);

    return {
      message: 'کد تأیید ارسال شد.',
      mobile: sendOtpDto.mobile,
      countryCode,
      otp: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const countryCode = verifyOtpDto.countryCode || '+98';

    // Verify OTP
    await this.otpService.verifyOtp(verifyOtpDto.mobile, verifyOtpDto.code);

    // Find the user
    let user = await this.usersService.findByMobile(verifyOtpDto.mobile);
    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    // Activate user if not already active
    if (!user.isActive) {
      user.isActive = true;
      await user.save();
      // Give signup bonus on first verification
      await this.walletService.giveSignupBonus(user._id.toString()).catch(() => {});
    }

    // Generate JWT
    const payload = { sub: user._id, mobile: user.mobile, countryCode: user.countryCode, role: user.role, fullName: user.fullName };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        countryCode: user.countryCode,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByMobile(loginDto.mobile);
    if (!user) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    // If user is not active (not verified), send OTP
    if (!user.isActive) {
      const code = await this.otpService.generateOtp(loginDto.mobile, user.countryCode || '+98');
      return {
        message: 'حساب کاربری تأیید نشده است. کد تأیید ارسال شد.',
        needsVerification: true,
        mobile: loginDto.mobile,
        countryCode: user.countryCode || '+98',
        otp: process.env.NODE_ENV !== 'production' ? code : undefined,
      };
    }

    const payload = { sub: user._id, mobile: user.mobile, countryCode: user.countryCode, role: user.role, fullName: user.fullName };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        countryCode: user.countryCode,
        role: user.role,
      },
    };
  }

  async validateUser(mobile: string, password: string) {
    const user = await this.usersService.findByMobile(mobile);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
}
