import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudioFile, StudioFileDocument } from './schemas/studio-file.schema';
import { CreateStudioFileDto, UpdateStudioFileDto } from './dto/studio.dto';

@Injectable()
export class StudioService {
  constructor(
    @InjectModel(StudioFile.name)
    private studioFileModel: Model<StudioFileDocument>,
  ) {}

  async findByUser(userId: string, type?: string) {
    const filter: Record<string, unknown> = { user: userId };
    if (type) filter.type = type;
    return this.studioFileModel.find(filter).sort({ createdAt: -1 });
  }

  async findById(id: string, userId: string) {
    const file = await this.studioFileModel.findById(id);
    if (!file) throw new NotFoundException('فایل استودیو یافت نشد');
    if (file.user.toString() !== userId) throw new ForbiddenException('دسترسی غیرمجاز');
    return file;
  }

  async create(userId: string, dto: CreateStudioFileDto) {
    return this.studioFileModel.create({
      ...dto,
      user: userId,
    } as any);
  }

  async update(id: string, userId: string, dto: UpdateStudioFileDto) {
    const file = await this.findById(id, userId);
    Object.assign(file, dto);
    if (dto.url && !file.originalUrl) {
      file.originalUrl = file.url;
    }
    file.isEdited = true;
    return file.save();
  }

  async remove(id: string, userId: string) {
    await this.findById(id, userId);
    await this.studioFileModel.deleteOne({ _id: id });
    return { message: 'فایل استودیو حذف شد' };
  }
}
