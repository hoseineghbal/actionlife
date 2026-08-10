export type UserPermission =
  | 'dashboard:view'
  | 'articles:view'
  | 'articles:create'
  | 'articles:edit'
  | 'articles:delete'
  | 'categories:view'
  | 'categories:create'
  | 'categories:edit'
  | 'categories:delete'
  | 'sections:view'
  | 'sections:create'
  | 'sections:edit'
  | 'sections:delete'
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'tickets:view'
  | 'tickets:reply'
  | 'contacts:view'
  | 'token_settings:view'
  | 'token_settings:edit'
  | 'sell_requests:view'
  | 'sell_requests:approve'
  | 'transactions:view'
  | 'gift_cards:view'
  | 'gift_cards:create'
  | 'store_products:view'
  | 'store_products:edit';

export const PERMISSION_GROUPS: {
  label: string;
  items: { value: UserPermission; label: string }[];
}[] = [
  {
    label: 'داشبورد',
    items: [{ value: 'dashboard:view', label: 'مشاهده داشبورد' }],
  },
  {
    label: 'مدیریت مقالات',
    items: [
      { value: 'articles:view', label: 'مشاهده مقالات' },
      { value: 'articles:create', label: 'ایجاد مقاله' },
      { value: 'articles:edit', label: 'ویرایش مقالات' },
      { value: 'articles:delete', label: 'حذف مقالات' },
    ],
  },
  {
    label: 'مدیریت دسته‌بندی‌ها',
    items: [
      { value: 'categories:view', label: 'مشاهده دسته‌بندی‌ها' },
      { value: 'categories:create', label: 'ایجاد دسته‌بندی' },
      { value: 'categories:edit', label: 'ویرایش دسته‌بندی‌ها' },
      { value: 'categories:delete', label: 'حذف دسته‌بندی‌ها' },
    ],
  },
  {
    label: 'بخش‌های مقالات',
    items: [
      { value: 'sections:view', label: 'مشاهده بخش‌ها' },
      { value: 'sections:create', label: 'ایجاد بخش' },
      { value: 'sections:edit', label: 'ویرایش بخش‌ها' },
      { value: 'sections:delete', label: 'حذف بخش‌ها' },
    ],
  },
  {
    label: 'مدیریت کاربران',
    items: [
      { value: 'users:view', label: 'مشاهده کاربران' },
      { value: 'users:create', label: 'ایجاد کاربر' },
      { value: 'users:edit', label: 'ویرایش کاربران' },
      { value: 'users:delete', label: 'حذف کاربران' },
    ],
  },
  {
    label: 'تیکت‌ها',
    items: [
      { value: 'tickets:view', label: 'مشاهده تیکت‌ها' },
      { value: 'tickets:reply', label: 'پاسخ به تیکت‌ها' },
    ],
  },
  {
    label: 'تماس با ما',
    items: [{ value: 'contacts:view', label: 'مشاهده پیام‌های تماس' }],
  },
  {
    label: 'تنظیمات توکن',
    items: [
      { value: 'token_settings:view', label: 'مشاهده تنظیمات توکن' },
      { value: 'token_settings:edit', label: 'ویرایش تنظیمات توکن' },
    ],
  },
  {
    label: 'درخواست‌های فروش',
    items: [
      { value: 'sell_requests:view', label: 'مشاهده درخواست‌ها' },
      { value: 'sell_requests:approve', label: 'تایید/رد درخواست‌ها' },
    ],
  },
  {
    label: 'تراکنش‌ها',
    items: [{ value: 'transactions:view', label: 'مشاهده تراکنش‌ها' }],
  },
  {
    label: 'کارت‌های هدیه',
    items: [
      { value: 'gift_cards:view', label: 'مشاهده کارت‌ها' },
      { value: 'gift_cards:create', label: 'ایجاد کارت هدیه' },
    ],
  },
  {
    label: 'محصولات فروشگاه',
    items: [
      { value: 'store_products:view', label: 'مشاهده محصولات' },
      { value: 'store_products:edit', label: 'ویرایش محصولات' },
    ],
  },
];

export interface User {
  _id: string;
  fullName: string;
  mobile: string;
  countryCode?: string;
  email?: string;
  role: string;
  username?: string;
  permissions?: UserPermission[];
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
  points: number;
  hasStore: boolean;
  storeRequestStatus?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface PageView {
  _id: string;
  path: string;
  title: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalPageViews: number;
  todayPageViews: number;
  totalUsers: number;
  totalContacts: number;
  openTickets: number;
  topPages: { path: string; count: number }[];
  dailyViews: { date: string; count: number }[];
}

export interface EcosystemStats {
  totalCoinsPurchased: number;
  totalRialValue: number;
  tomanPerToken: number;
  coinBuyAmount: number;
  coinBuyCount: number;
  coinSellAmount: number;
  coinSellCount: number;
}

export interface StoreStats {
  totalOrders: number;
  totalSalesAmount: number;
  newProductsCount: number;
  productsBySales: { title: string; salesCount: number }[];
}

export interface AdminDashboard extends AnalyticsOverview {
  ecosystem: EcosystemStats;
  store: StoreStats;
  dailyCoinTransactions: { date: string; buy: number; sell: number }[];
  dailyStoreSales: { date: string; count: number; totalAmount: number }[];
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    fullName: string;
    mobile: string;
    countryCode?: string;
    role: string;
    hasStore?: boolean;
    permissions?: UserPermission[];
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | { _id: string; name: string; slug: string };
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  section: string;
  categories: { _id: string; name: string; slug: string }[];
  tags: string[];
  author: { _id: string; fullName: string; avatar?: string };
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
  rejectionReason?: string;
  views: number;
  metaTitle?: string;
  metaDescription?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Wallet / Token types
export interface TokenConfig {
  tomanPerToken: number;
  minPurchaseAmount: number;
  maxPurchaseAmount: number;
  minSellAmount: number;
  maxSellAmount: number;
  sellCooldownHours: number;
  signupBonus: number;
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

export interface WalletTransaction {
  _id: string;
  user: { _id: string; fullName: string; mobile: string } | string;
  type: string;
  amount: number;
  status: string;
  description?: string;
  relatedUser?: { _id: string; fullName: string; mobile: string; username?: string } | string;
  createdAt: string;
}

export interface SellRequest {
  _id: string;
  user: { _id: string; fullName: string; mobile?: string };
  tokenAmount: number;
  tomanAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  cardNumber?: string;
  shebaNumber?: string;
  createdAt: string;
  processedAt?: string;
}

export interface GiftCard {
  _id: string;
  code: string;
  creator: { _id: string; fullName: string; mobile: string };
  amount: number;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  redeemedBy?: { _id: string; fullName: string; mobile: string };
  redeemedAt?: string;
  expiresAt?: string;
  message?: string;
  createdAt: string;
}

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  totalPurchased: number;
  totalSpent: number;
}

// Store types
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
  discounts: ProductDiscount[];
  files: { url: string; title: string; description?: string; fileType: string; order: number }[];
  category?: string | { _id: string; name: string; slug: string } | null;
  tags: string[];
  status: string;
  seller: { _id: string; fullName: string; mobile?: string; avatar?: string };
  salesCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}
