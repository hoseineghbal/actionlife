import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactDocument = HydratedDocument<Contact>;

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  mobile: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
