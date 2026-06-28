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

export interface StoreProduct {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  coverImage?: string;
  price: number;
  discountPrice: number;
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
  createdAt: string;
  updatedAt: string;
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
