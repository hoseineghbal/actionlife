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

/* ============================================================================
 *   سیستم سطح کاربری (User Level System) — برای کاربران غیر ادمین
 *   بر اساس ۵ معیار:
 *     1) کامل بودن اطلاعات پروفایل    ۲) همکاری کاربر در پلتفرم
 *     ۳) میزان فعالیت روزانه/هفتگی   ۴) پیشرفت در چالش‌ها
 *     ۵) گذراندن گام‌های مسیر رشد
 * ========================================================================== */

export enum UserLevel {
  TIER_1_BEGINNER = 'tier_1_beginner',
  TIER_2_ACTIVE = 'tier_2_active',
  TIER_3_COMMITTED = 'tier_3_committed',
  TIER_4_MENTOR = 'tier_4_mentor',
  TIER_5_VETERAN = 'tier_5_veteran',
}

export interface UserLevelMeta {
  key: UserLevel;
  label: string;
  badgeLabel: string;
  minScore: number;
  color: string;
  description: string;
}

export const USER_LEVEL_META: Record<UserLevel, UserLevelMeta> = {
  [UserLevel.TIER_1_BEGINNER]: {
    key: UserLevel.TIER_1_BEGINNER,
    label: 'مبتدی',
    badgeLabel: 'کمیاب',
    minScore: 0,
    color: '#94a3b8',
    description: 'کاربر تازه‌وارد؛ در حال تکمیل پروفایل و آشنایی با پلتفرم',
  },
  [UserLevel.TIER_2_ACTIVE]: {
    key: UserLevel.TIER_2_ACTIVE,
    label: 'فعال',
    badgeLabel: 'نقره‌ای',
    minScore: 100,
    color: '#0ea5e9',
    description: 'کاربر فعال؛ پروفایل کامل و شروع فعالیت در اکشن کلاب',
  },
  [UserLevel.TIER_3_COMMITTED]: {
    key: UserLevel.TIER_3_COMMITTED,
    label: 'متعهد',
    badgeLabel: 'طلایی',
    minScore: 500,
    color: '#f59e0b',
    description: 'کاربر متعهد؛ شرکت در چالش‌ها و تکمیل گام‌های مسیر رشد',
  },
  [UserLevel.TIER_4_MENTOR]: {
    key: UserLevel.TIER_4_MENTOR,
    label: 'رهنما',
    badgeLabel: 'الماس',
    minScore: 2000,
    color: '#8b5cf6',
    description: 'کاربر رهنما؛ تولید محتوا، همکاری مستمر و راهنمایی سایر کاربران',
  },
  [UserLevel.TIER_5_VETERAN]: {
    key: UserLevel.TIER_5_VETERAN,
    label: 'پیشکسوت',
    badgeLabel: 'پلاتینیوم',
    minScore: 10000,
    color: '#ef4444',
    description: 'پیشکسوت اکشن لایف؛ دسترسی ویژه و حضور در هسته جامعه',
  },
};

export const USER_LEVEL_ORDER: UserLevel[] = [
  UserLevel.TIER_1_BEGINNER,
  UserLevel.TIER_2_ACTIVE,
  UserLevel.TIER_3_COMMITTED,
  UserLevel.TIER_4_MENTOR,
  UserLevel.TIER_5_VETERAN,
];

/* -------------------- محاسبه خودکار سطح کاربری بر اساس امتیاز کل -------------------- */

export function calculateLevelFromScore(totalScore: number): UserLevel {
  const sorted = USER_LEVEL_ORDER.slice().sort(
    (a, b) => USER_LEVEL_META[b].minScore - USER_LEVEL_META[a].minScore,
  );
  return sorted.find((lvl) => totalScore >= USER_LEVEL_META[lvl].minScore) || UserLevel.TIER_1_BEGINNER;
}

export function userMeetsLevel(userLevel: UserLevel, requiredLevel: UserLevel): boolean {
  return USER_LEVEL_ORDER.indexOf(userLevel) >= USER_LEVEL_ORDER.indexOf(requiredLevel);
}

/* -------------------- امتیازات جزئی و دسترسی‌ها -------------------- */

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

  /* =====================================================
   *    سیستم سطح کاربری
   * ===================================================== */

  /** سطح نهایی کاربر (اگر overrideLevel تنظیم شده باشد، همان؛ در غیر این صورت calculateLevelFromScore) */
  @Prop({ type: String, enum: UserLevel, default: UserLevel.TIER_1_BEGINNER })
  level: UserLevel;

  /** اگر ادمین بخواهد سطح را دستی تنظیم کند (برای جشنواره/قدردانی خاص) */
  @Prop({ type: String, enum: UserLevel, default: null })
  overrideLevel: UserLevel | null;

  /** مجموع امتیاز سطح کاربری بر اساس ۵ معیار زیر */
  @Prop({ default: 0 })
  levelScore: number;

  /** معیار ۱: میزان تکمیل بودن اطلاعات پروفایل (0 تا 100) */
  @Prop({ default: 0 })
  profileCompletenessScore: number;

  /** معیار ۲: میزان همکاری کاربر (ساخت محتوا، راهنمایی، فروش در فروشگاه و...) */
  @Prop({ default: 0 })
  collaborationScore: number;

  /** معیار ۳: میزان فعالیت (ورود روزانه، بازدید، تراکنش، خرید و...) */
  @Prop({ default: 0 })
  activityScore: number;

  /** معیار ۴: پیشرفت در چالش‌های هفتگی/ماهانه */
  @Prop({ default: 0 })
  challengeProgressScore: number;

  /** معیار ۵: تکمیل گام‌های مسیر رشد */
  @Prop({ default: 0 })
  growthPathScore: number;

  /** آخرین بازمحاسبه خودکار سطح */
  @Prop()
  lastLevelRecalculationAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 *   تابع کمکی برای حساب کردن درصد کامل بودن پروفایل
 *   بر اساس وجود field های اصلی در آبجکت کاربر
 */
export function computeProfileCompleteness(u: Partial<User>): number {
  let score = 0;
  const checks: { cond: boolean; value: number }[] = [
    { cond: Boolean(u.fullName && u.fullName.trim().length > 2), value: 10 },
    { cond: Boolean(u.mobile || u.email), value: 10 },
    { cond: Boolean(u.username && u.username.trim().length > 2), value: 10 },
    { cond: Boolean(u.avatar), value: 10 },
    { cond: Boolean(u.bio && u.bio.trim().length > 20), value: 10 },
    { cond: Boolean(u.birthDate) || Boolean(u.gender), value: 10 },
    { cond: Boolean(u.education) || Boolean(u.fieldOfStudy) || Boolean(u.expertise), value: 10 },
    { cond: Boolean(u.city) || Boolean(u.country), value: 10 },
    { cond: Boolean(u.website) || Boolean(u.instagram) || Boolean(u.linkedin) || Boolean(u.twitter), value: 10 },
    { cond: Array.isArray(u.interests) && u.interests.length >= 2, value: 10 },
  ];
  checks.forEach((c) => {
    if (c.cond) score += c.value;
  });
  return Math.min(100, score);
}

/**
 *   بازمحاسبه کل امتیازات و سطح کاربر
 *   مجموع ۵ معیار + سطح (با رعایت overrideLevel)
 */
export function recalculateUserLevel(u: Partial<User>): {
  profileCompletenessScore: number;
  levelScore: number;
  level: UserLevel;
  lastLevelRecalculationAt: Date;
} {
  const profileCompletenessScore = computeProfileCompleteness(u);
  const a = u.activityScore || 0;
  const c = u.collaborationScore || 0;
  const cp = u.challengeProgressScore || 0;
  const gp = u.growthPathScore || 0;
  const levelScore = profileCompletenessScore + a + c + cp + gp;
  const autoLevel = calculateLevelFromScore(levelScore);
  const level = (u.overrideLevel as UserLevel) || autoLevel;
  return {
    profileCompletenessScore,
    levelScore,
    level,
    lastLevelRecalculationAt: new Date(),
  };
}
