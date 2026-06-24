import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/shared/ArticleCard";
import type { Article } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const user = await fetchAPI<{ fullName: string; bio?: string }>(`/users/${id}`);
    return {
      title: `${user.fullName} | پروفایل کاربری`,
      description: user.bio || `پروفایل کاربری ${user.fullName} در اکشن لایف`,
    };
  } catch {
    return { title: "پروفایل کاربری | اکشن لایف" };
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  let user: { fullName: string; bio?: string; city?: string; country?: string; expertise?: string; website?: string; instagram?: string; twitter?: string; interests?: string[] };
  let articles: { articles: Article[]; total: number };
  try {
    [user, articles] = await Promise.all([
      fetchAPI<typeof user>(`/users/${id}`),
      fetchAPI<{ articles: Article[]; total: number }>(`/articles/user/${id}?limit=20`),
    ]);
  } catch {
    notFound();
  }

  return (
    <>
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
                {user.fullName}
              </h1>
              {user.bio && <p className="text-gray-custom">{user.bio}</p>}
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-custom">
                {user.city && <span>📍 {user.city}{user.country ? `, ${user.country}` : ''}</span>}
                {user.expertise && <span>💼 {user.expertise}</span>}
                <span>📝 {articles.total} مقاله</span>
              </div>
              {(user.website || user.instagram || user.twitter) && (
                <div className="flex gap-3 mt-3">
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">
                      وبسایت
                    </a>
                  )}
                  {user.instagram && (
                    <a href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">
                      اینستاگرام
                    </a>
                  )}
                  {user.twitter && (
                    <a href={`https://x.com/${user.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">
                      توییتر
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {user.interests.map((i: string) => (
                <span key={i} className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-gray-custom">{i}</span>
              ))}
            </div>
          )}
        </div>
      </section>

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
