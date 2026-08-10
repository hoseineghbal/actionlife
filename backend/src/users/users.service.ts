import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
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
    const user = new this.userModel({
      ...createUserDto,
      countryCode: createUserDto.countryCode || '+98',
      password: hashedPassword,
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
    // Match formats like +989121111111, 00989121111111, 989121111111
    const match = raw.trim().match(/^(?:\+|00)?(98\d{9})$/);
    if (match) {
      return { countryCode: '+98', number: match[1] }; // match[1] = 989121111111
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
    // First try by username
    const byUsername = await this.userModel.findOne({ username: identifier }).select('-password');
    if (byUsername) return byUsername;

    // Try by MongoDB ObjectId
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

    return this.userModel.findByIdAndUpdate(id, updateUserDto, { returnDocument: 'after' }).select('-password');
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
}
