import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  INSTRUCTOR = 'instructor',
  USER = 'user',
  VIP = 'vip',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ unique: true, sparse: true })
  username: string;

  @Prop()
  email: string;

  @Prop({ required: true, unique: true })
  mobile: string;

  @Prop({ default: '+98' })
  countryCode: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop()
  avatar: string;

  @Prop()
  headerImage: string;

  @Prop()
  bio: string;

  @Prop()
  birthDate: string;

  @Prop()
  gender: string;

  @Prop()
  education: string;

  @Prop()
  fieldOfStudy: string;

  @Prop()
  expertise: string;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop()
  country: string;

  @Prop()
  city: string;

  @Prop()
  website: string;

  @Prop()
  instagram: string;

  @Prop()
  linkedin: string;

  @Prop()
  twitter: string;

  @Prop()
  cardNumber: string;

  @Prop()
  shebaNumber: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: false })
  hasStore: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
