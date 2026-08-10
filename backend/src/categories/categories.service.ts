import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  private async getNextOrderForParent(parentId: string | Types.ObjectId | undefined | null): Promise<number> {
    const match = parentId
      ? { parent: new Types.ObjectId(parentId as any) }
      : { $or: [{ parent: { $exists: false } }, { parent: null }] };
    const maxResult = await this.categoryModel
      .find(match)
      .sort({ order: -1 })
      .limit(1)
      .select('order')
      .lean();
    const maxOrder = maxResult.length > 0 && typeof maxResult[0].order === 'number' ? maxResult[0].order : -1;
    return maxOrder + 1;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const order =
      typeof createCategoryDto.order === 'number' && !Number.isNaN(createCategoryDto.order)
        ? createCategoryDto.order
        : await this.getNextOrderForParent(createCategoryDto.parent);
    const category = new this.categoryModel({ ...createCategoryDto, order });
    return category.save();
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ isActive: true })
      .populate('parent', 'name slug')
      .sort({ order: 1, createdAt: 1 });
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({ slug }).populate('parent', 'name slug');
    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
    return category;
  }

  async update(id: string, updateDto: Partial<CreateCategoryDto>): Promise<CategoryDocument> {
    const current = await this.categoryModel.findById(id);
    if (!current) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    const parentChanged =
      (updateDto.parent || null) !==
      ((current.parent as any)?.toString
        ? (current.parent as any).toString()
        : (current.parent as any) || null);

    let order = updateDto.order;
    if (parentChanged && (typeof order !== 'number' || Number.isNaN(order))) {
      order = await this.getNextOrderForParent(updateDto.parent ?? current.parent ?? null);
    }

    const payload: any = { ...updateDto };
    if (typeof order === 'number' && !Number.isNaN(order)) {
      payload.order = order;
    }

    const updated = await this.categoryModel.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
  }
}
