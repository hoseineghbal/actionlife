import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, recalculateUserLevel } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ mobile: createUserDto.mobile, countryCode: createUserDto.countryCode || '+98' });
    if (existing) {
      throw new ConflictException('این شماره موبایل قبلاً ثبت شده است');
    }
    if (createUserDto.email) {
      const existingEmail = await this.userModel.findOne({ email: createUserDto.email });
      if (existingEmail) {
        throw new ConflictException('این ایمیل قبلاً ثبت شده است');
      }
    }
    if (createUserDto.username) {
      const existingUsername = await this.userModel.findOne({ username: createUserDto.username });
      if (existingUsername) {
        throw new ConflictException('این نام کاربری قبلاً ثبت شده است');
      }
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const payload: Partial<User> = {
      ...createUserDto,
      countryCode: createUserDto.countryCode || '+98',
      password: hashedPassword,
    };
    const levelCalc = recalculateUserLevel(payload);
    const user = new this.userModel({
      ...payload,
      ...levelCalc,
    });
    const saved = await user.save();
    const result = saved.toObject();
    delete (result as any).password;
    return result as UserDocument;
  }

  async findByMobile(mobile: string): Promise<UserDocument | null> {
    const parsed = this.parseMobile(mobile);
    if (parsed) {
      return this.userModel.findOne({ mobile: parsed.number, countryCode: parsed.countryCode });
    }
    return this.userModel.findOne({ mobile });
  }

  private parseMobile(raw: string): { countryCode: string; number: string } | null {
    const match = raw.trim().match(/^(?:\+|00)?(98\d{9})$/);
    if (match) {
      return { countryCode: '+98', number: match[1] };
    }
    return null;
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password');
  }

  async findByIdentifier(identifier: string): Promise<UserDocument | null> {
    const byUsername = await this.userModel.findOne({ username: identifier }).select('-password');
    if (byUsername) return byUsername;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      return this.userModel.findById(identifier).select('-password');
    }

    return null;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password');
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    if (updateUserDto.mobile) {
      const countryCode = updateUserDto.countryCode || user.countryCode || '+98';
      const existing = await this.userModel.findOne({
        mobile: updateUserDto.mobile,
        countryCode,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException('این شماره موبایل قبلاً ثبت شده است');
      }
    }

    if (updateUserDto.email) {
      const existing = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException('این ایمیل قبلاً ثبت شده است');
      }
    }

    if (updateUserDto.username) {
      const existing = await this.userModel.findOne({
        username: updateUserDto.username,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException('این نام کاربری قبلاً ثبت شده است');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const merged: Partial<User> = {
      ...(user.toObject() as Record<string, any>),
      ...(updateUserDto as Record<string, any>),
    } as Partial<User>;

    const levelCalc = recalculateUserLevel(merged);
    await this.userModel.findByIdAndUpdate(id, { ...updateUserDto, ...levelCalc });

    return this.userModel.findById(id).select('-password');
  }

  async requestStore(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    if (user.hasStore) throw new BadRequestException('شما قبلا فروشگاه دارید');
    if (user.storeRequestStatus === 'pending') throw new BadRequestException('درخواست شما در انتظار بررسی است');

    user.storeRequestStatus = 'pending';
    await user.save();
    return { message: 'درخواست فروشگاه با موفقیت ثبت شد' };
  }

  async handleStoreRequest(userId: string, action: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('کاربر یافت نشد');

    if (action === 'approve') {
      user.storeRequestStatus = 'approved';
      user.hasStore = true;
    } else if (action === 'reject') {
      user.storeRequestStatus = 'rejected';
    } else {
      throw new BadRequestException('عملیات نامعتبر');
    }

    await user.save();
    return user;
  }

  /**
   *   Endpoint برای اعمال محاسبه خودکار سطح روی تمام کاربران (برای مهاجرت دیتابیس قدیمی)
   */
  async recalculateAllLevels(): Promise<{ updated: number }> {
    const users = await this.userModel.find().lean();
    let updated = 0;
    for (const u of users) {
      const calc = recalculateUserLevel(u as Partial<User>);
      await this.userModel.updateOne(
        { _id: u._id },
        {
          profileCompletenessScore: calc.profileCompletenessScore,
          levelScore: calc.levelScore,
          level: calc.level,
          lastLevelRecalculationAt: calc.lastLevelRecalculationAt,
        },
      );
      updated++;
    }
    return { updated };
  }
}
