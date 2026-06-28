export interface User {
  _id: string;
  fullName: string;
  mobile: string;
  countryCode?: string;
  email?: string;
  role: string;
  avatar?: string;
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
  points: number;
  hasStore: boolean;
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

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    fullName: string;
    mobile: string;
    countryCode?: string;
    role: string;
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
export interface StoreProduct {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  coverImage?: string;
  price: number;
  discountPrice: number;
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
