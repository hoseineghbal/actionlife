export interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
  order?: number;
}

export interface VideoEmbed {
  url: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
  source?: 'upload' | 'youtube' | 'aparat';
  videoId?: string;
  order?: number;
}

export interface ArticleAttachment {
  url: string;
  filename: string;
  mimeType?: string;
  size?: number;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  gallery?: GalleryImage[];
  videos?: VideoEmbed[];
  attachments?: ArticleAttachment[];
  section: ArticleSection;
  categories: Category[];
  tags: string[];
  author: Author;
  status: string;
  views: number;
  metaTitle?: string;
  metaDescription?: string;
  isFeatured: boolean;
  /** حداقل سطح کاربری موردنیاز برای دسترسی؛ null = عمومی و قابل دسترس برای همه */
  minRequiredLevel?: UserLevel | null;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  _id: string;
  fullName: string;
  avatar?: string;
  username?: string;
  bio?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: Category;
  order: number;
  isActive: boolean;
}

export interface ContactForm {
  name: string;
  email: string;
  mobile?: string;
  subject: string;
  message: string;
}

export type UserLevel =
  | 'tier_1_beginner'
  | 'tier_2_active'
  | 'tier_3_committed'
  | 'tier_4_mentor'
  | 'tier_5_veteran';

export interface UserLevelMeta {
  key: UserLevel;
  label: string;
  badgeLabel: string;
  minScore: number;
  color: string;
  description: string;
}

export const USER_LEVEL_META: Record<UserLevel, UserLevelMeta> = {
  tier_1_beginner: {
    key: 'tier_1_beginner',
    label: 'مبتدی',
    badgeLabel: 'کمیاب',
    minScore: 0,
    color: '#94a3b8',
    description: 'کاربر تازه‌وارد؛ در حال تکمیل پروفایل و آشنایی با پلتفرم',
  },
  tier_2_active: {
    key: 'tier_2_active',
    label: 'فعال',
    badgeLabel: 'نقره‌ای',
    minScore: 100,
    color: '#0ea5e9',
    description: 'کاربر فعال؛ پروفایل کامل و شروع فعالیت در اکشن کلاب',
  },
  tier_3_committed: {
    key: 'tier_3_committed',
    label: 'متعهد',
    badgeLabel: 'طلایی',
    minScore: 500,
    color: '#f59e0b',
    description: 'کاربر متعهد؛ شرکت در چالش‌ها و تکمیل گام‌های مسیر رشد',
  },
  tier_4_mentor: {
    key: 'tier_4_mentor',
    label: 'رهنما',
    badgeLabel: 'الماس',
    minScore: 2000,
    color: '#8b5cf6',
    description: 'کاربر رهنما؛ تولید محتوا، همکاری مستمر و راهنمایی سایر کاربران',
  },
  tier_5_veteran: {
    key: 'tier_5_veteran',
    label: 'پیشکسوت',
    badgeLabel: 'پلاتینیوم',
    minScore: 10000,
    color: '#ef4444',
    description: 'پیشکسوت اکشن لایف؛ دسترسی ویژه و حضور در هسته جامعه',
  },
};

export const USER_LEVEL_ORDER: UserLevel[] = [
  'tier_1_beginner',
  'tier_2_active',
  'tier_3_committed',
  'tier_4_mentor',
  'tier_5_veteran',
];

export type LevelGatedFeature =
  | 'action_club_access'
  | 'exclusive_articles'
  | 'workshops_events'
  | 'growth_path_premium'
  | 'mentorship_sessions'
  | 'core_community';

export const LEVEL_REQUIREMENTS: Record<LevelGatedFeature, UserLevel> = {
  action_club_access: 'tier_2_active',
  exclusive_articles: 'tier_3_committed',
  workshops_events: 'tier_3_committed',
  growth_path_premium: 'tier_3_committed',
  mentorship_sessions: 'tier_4_mentor',
  core_community: 'tier_5_veteran',
};

export function userMeetsLevel(userLevel: UserLevel, requiredLevel: UserLevel): boolean {
  return USER_LEVEL_ORDER.indexOf(userLevel) >= USER_LEVEL_ORDER.indexOf(requiredLevel);
}

export interface User {
  id: string;
  fullName: string;
  mobile: string;
  countryCode?: string;
  username?: string;
  role: string;
  email?: string;
  avatar?: string;
  headerImage?: string;
  bio?: string;
  birthDate?: string;
  gender?: string;
  education?: string;
  fieldOfStudy?: string;
  expertise?: string;
  interests?: string[];
  country?: string;
  city?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  cardNumber?: string;
  shebaNumber?: string;
  points?: number;
  hasStore?: boolean;
  storeRequestStatus?: string;

  /** سیستم سطح کاربری — بر اساس امتیاز کل از ۵ معیار */
  level?: UserLevel;
  overrideLevel?: UserLevel | null;
  levelScore?: number;
  profileCompletenessScore?: number;
  collaborationScore?: number;
  activityScore?: number;
  challengeProgressScore?: number;
  growthPathScore?: number;
  lastLevelRecalculationAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  mobile: string;
  countryCode: string;
  otp?: string;
}

export interface LoginResponse extends AuthResponse {
  needsVerification?: boolean;
  message?: string;
  mobile?: string;
  countryCode?: string;
  otp?: string;
}

export type ArticleSection =
  | 'blog'
  | 'action-cinema'
  | 'action-game'
  | 'action-trip'
  | 'action-fit'
  | 'action-media';

export interface PaginatedArticles {
  articles: Article[];
  total: number;
}

export interface TicketMessage {
  _id: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

// Wallet / Token types
export interface WalletInfo {
  _id: string;
  user: string;
  balance: number;
  totalPurchased: number;
  totalSpent: number;
}

export interface WalletTransaction {
  _id: string;
  user: string;
  type: string;
  amount: number;
  status: string;
  description?: string;
  relatedUser?: string | { _id: string; fullName?: string; mobile?: string; username?: string };
  createdAt: string;
}

export interface TokenConfig {
  tomanPerToken: number;
  minPurchaseAmount: number;
  maxPurchaseAmount: number;
  minSellAmount: number;
  maxSellAmount: number;
  sellCooldownHours: number;
  sellEnabled: boolean;
  purchaseEnabled: boolean;
  transferEnabled: boolean;
  giftCardEnabled: boolean;
  minGiftCardAmount: number;
  maxGiftCardAmount: number;
  maxGiftCardsPerUser: number;
  giftCardExpiryDays: number;
  transferFee: number;
  transferFeePercent: number;
  marketplaceFeePercent: number;
}

export interface GiftCard {
  _id: string;
  code: string;
  amount: number;
  status: string;
  message?: string;
  expiresAt?: string;
  redeemedAt?: string;
  createdAt: string;
}

// Store types
export interface ProductFile {
  url: string;
  title: string;
  description?: string;
  fileType: 'pdf' | 'image' | 'video' | 'audio';
  order: number;
}

export interface ProductDiscount {
  discountPrice: number;
  startDate: string;
  endDate: string;
}

export interface StoreProduct {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  coverImage?: string;
  price: number;
  discountPrice: number;
  discounts?: ProductDiscount[];
  files: ProductFile[];
  category?: Category | null;
  tags: string[];
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
  seller: {
    _id: string;
    fullName: string;
    avatar?: string;
    username?: string;
    bio?: string;
  };
  salesCount: number;
  views: number;
  hasPurchased?: boolean;
  effectivePrice?: number;
  currentDiscount?: ProductDiscount | null;
  createdAt: string;
  updatedAt: string;
}

export function getEffectivePrice(product: StoreProduct): number {
  // Check time-based discounts
  if (product.discounts?.length) {
    const now = new Date();
    const active = product.discounts.find(
      (d) => now >= new Date(d.startDate) && now <= new Date(d.endDate),
    );
    if (active) return active.discountPrice;
  }
  // API may provide pre-computed effectivePrice
  if (product.effectivePrice) return product.effectivePrice;
  // Fallback to legacy discountPrice
  if (product.discountPrice > 0) return product.discountPrice;
  return product.price;
}

export function hasActiveDiscount(product: StoreProduct): boolean {
  if (product.discounts?.length) {
    const now = new Date();
    return product.discounts.some(
      (d) => now >= new Date(d.startDate) && now <= new Date(d.endDate),
    );
  }
  return product.discountPrice > 0;
}

export interface StoreOrder {
  _id: string;
  buyer: string | {
    _id: string;
    fullName: string;
    mobile?: string;
  };
  product: string;
  productTitle: string;
  productSlug: string;
  productCover?: string;
  price: number;
  finalPrice: number;
  status: 'completed' | 'refunded';
  transactionId: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  coverImage?: string;
  price: number;
  discountPrice: number;
  sellerName: string;
}

// Studio types
export interface StudioFile {
  _id: string;
  user: string;
  url: string;
  title: string;
  type: 'video' | 'audio';
  mimeType: string;
  size: number;
  duration: number;
  thumbnail?: string;
  isEdited: boolean;
  originalUrl?: string;
  createdAt: string;
  updatedAt: string;
}
