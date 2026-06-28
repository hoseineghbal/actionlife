import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/shared/ArticleCard";
import StoreProductCard from "./StoreProductCard";
import type { Article, StoreProduct } from "@/types";

type Props = {
  params: Promise<{ identifier: string }>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { identifier } = await params;
    const user = await fetchAPI<{ fullName: string; bio?: string }>(`/users/u/${identifier}`);
    return {
      title: `${user.fullName} | پروفایل کاربری`,
      description: user.bio || `پروفایل کاربری ${user.fullName} در اکشن لایف`,
    };
  } catch {
    return { title: "پروفایل کاربری | اکشن لایف" };
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { identifier } = await params;

  let user: {
    _id: string; fullName: string; bio?: string; city?: string; country?: string;
    expertise?: string; website?: string; instagram?: string;
    twitter?: string; interests?: string[]; avatar?: string;
    headerImage?: string; hasStore?: boolean;
  };
  let articles: { articles: Article[]; total: number };
  let storeProducts: StoreProduct[] = [];
  let storeTotal = 0;
  try {
    user = await fetchAPI<typeof user>(`/users/u/${identifier}`);
    articles = await fetchAPI<{ articles: Article[]; total: number }>(
      `/articles/user/${user._id}?limit=20`
    );
    if (user.hasStore) {
      const storeRes = await fetchAPI<{ products: StoreProduct[]; total: number }>(
        `/store/products?seller=${user._id}&limit=12`
      );
      storeProducts = storeRes.products;
      storeTotal = storeRes.total;
    }
  } catch {
    notFound();
  }

  return (
    <>
      {/* Header Image + Profile Info */}
      <section className="relative border-b border-white/10">
        {/* Cover / Header Image */}
        <div className="h-48 md:h-64 bg-dark-light overflow-hidden">
          {user.headerImage ? (
            <img
              src={user.headerImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20" />
          )}
        </div>

        {/* Profile Info - Overlapping the header image */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-dark bg-dark-light flex items-center justify-center text-white text-4xl font-bold shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{user.fullName?.charAt(0) || 'U'}</span>
              )}
            </div>
            {/* Name & Bio */}
            <div className="pb-3 pt-1">
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                {user.fullName}
              </h1>
              {user.bio && <p className="text-gray-custom text-sm">{user.bio}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-custom">
                {user.city && <span>📍 {user.city}{user.country ? `, ${user.country}` : ''}</span>}
                {user.expertise && <span>💼 {user.expertise}</span>}
                <span>📝 {articles.total} مقاله</span>
                {user.hasStore && <span>🛍️ فروشنده</span>}
              </div>
              {(user.website || user.instagram || user.twitter) && (
                <div className="flex gap-3 mt-2">
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-accent text-sm hover:underline">
                      وبسایت
                    </a>
                  )}
                  {user.instagram && (
                    <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-accent text-sm hover:underline">
                      اینستاگرام
                    </a>
                  )}
                  {user.twitter && (
                    <a href={`https://x.com/${user.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-accent text-sm hover:underline">
                      توییتر
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pb-4">
              {user.interests.map((i: string) => (
                <span key={i} className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-gray-custom">{i}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Store Section */}
      {user.hasStore && storeProducts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">فروشگاه {user.fullName}</h2>
            <Link
              href={`/store?seller=${user._id}`}
              className="text-accent text-sm hover:underline"
            >
              مشاهده همه ({storeTotal} محصول)
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeProducts.map((product) => (
              <StoreProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Articles Section */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-white mb-6">مقالات {user.fullName}</h2>
        {articles.articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {articles.articles.map((article) => (
              <ArticleCard key={article._id} {...article} />
            ))}
          </div>
        ) : (
          <p className="text-gray-custom">هنوز مقاله‌ای منتشر نکرده است.</p>
        )}
      </section>
    </>
  );
}
