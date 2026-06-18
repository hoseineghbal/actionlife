export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
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
  email: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
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
