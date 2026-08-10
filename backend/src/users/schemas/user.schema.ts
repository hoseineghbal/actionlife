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

export enum UserPermission {
  DASHBOARD_VIEW = 'dashboard:view',

  ARTICLES_VIEW = 'articles:view',
  ARTICLES_CREATE = 'articles:create',
  ARTICLES_EDIT = 'articles:edit',
  ARTICLES_DELETE = 'articles:delete',

  CATEGORIES_VIEW = 'categories:view',
  CATEGORIES_CREATE = 'categories:create',
  CATEGORIES_EDIT = 'categories:edit',
  CATEGORIES_DELETE = 'categories:delete',

  SECTIONS_VIEW = 'sections:view',
  SECTIONS_CREATE = 'sections:create',
  SECTIONS_EDIT = 'sections:edit',
  SECTIONS_DELETE = 'sections:delete',

  USERS_VIEW = 'users:view',
  USERS_CREATE = 'users:create',
  USERS_EDIT = 'users:edit',
  USERS_DELETE = 'users:delete',

  TICKETS_VIEW = 'tickets:view',
  TICKETS_REPLY = 'tickets:reply',

  CONTACTS_VIEW = 'contacts:view',

  TOKEN_SETTINGS_VIEW = 'token_settings:view',
  TOKEN_SETTINGS_EDIT = 'token_settings:edit',

  SELL_REQUESTS_VIEW = 'sell_requests:view',
  SELL_REQUESTS_APPROVE = 'sell_requests:approve',

  TRANSACTIONS_VIEW = 'transactions:view',

  GIFT_CARDS_VIEW = 'gift_cards:view',
  GIFT_CARDS_CREATE = 'gift_cards:create',

  STORE_PRODUCTS_VIEW = 'store_products:view',
  STORE_PRODUCTS_EDIT = 'store_products:edit',
}

export const ALL_PERMISSIONS = Object.values(UserPermission);

export function getAdminPermissions(): UserPermission[] {
  return [...ALL_PERMISSIONS];
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

  @Prop({ type: [String], enum: UserPermission, default: [] })
  permissions: UserPermission[];

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

  @Prop({
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  })
  storeRequestStatus: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
