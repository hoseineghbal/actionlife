import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<ContactDocument> {
    const contact = new this.contactModel(createContactDto);
    return contact.save();
  }

  async findAll(): Promise<ContactDocument[]> {
    return this.contactModel.find().sort({ createdAt: -1 });
  }

  async markAsRead(id: string): Promise<ContactDocument | null> {
    return this.contactModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }
}
