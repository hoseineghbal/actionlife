import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const category = new this.categoryModel(createCategoryDto);
    return category.save();
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find({ isActive: true }).populate('parent', 'name slug').sort({ order: 1 });
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findOne({ slug }).populate('parent', 'name slug');
    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
    return category;
  }

  async update(id: string, updateDto: Partial<CreateCategoryDto>): Promise<CategoryDocument> {
    const category = await this.categoryModel.findByIdAndUpdate(id, updateDto, { new: true });
    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
    return category;
  }

  async delete(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
  }
}
