"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getUserArticles, deleteArticle } from "@/lib/api";
import type { Article } from "@/types";

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  draft: { label: "پیش‌نویس", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  pending_review: { label: "در انتظار تایید", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  published: { label: "منتشر شده", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  rejected: { label: "رد شده", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const SECTION_ICON: Record<string, string> = {
  blog: "📝", 'action-cinema': "🎬", 'action-game': "🎮",
  'action-trip': "🏕️", 'action-fit': "💪", 'action-media': "📹",
};

export default function MyArticlesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token || !user) return;
    try {
      const res = await getUserArticles(token, user.id, 1, 50);
      setArticles(res.articles);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    loadArticles();
  }, [user, loadArticles]);

  const handleDelete = async (article: Article) => {
    if (article.status === 'published') {
      alert('امکان حذف مقاله منتشر شده وجود ندارد');
      return;
    }
    if (!confirm(`آیا از حذف "${article.title}" اطمینان دارید؟`)) return;
    setDeleting(article._id);
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      await deleteArticle(token, article._id);
      setArticles(prev => prev.filter(a => a._id !== article._id));
    } catch {
      alert('خطا در حذف مقاله');
    }
    finally { setDeleting(null); }
  };

  if (!user) return null;

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">مقالات من</h1>
          <p className="text-gray-custom">مدیریت مقالات ارسالی شما</p>
        </div>
        <Link
          href="/articles/new"
          className="px-5 py-2.5 gradient-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
        >
          + مقاله جدید
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-dark-light border border-white/10 rounded-xl p-12 text-center">
          <p className="text-gray-custom text-lg mb-4">هنوز مقاله‌ای ارسال نکرده‌اید</p>
          <Link href="/articles/new" className="text-primary hover:underline">ارسال اولین مقاله</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => {
            const badge = STATUS_BADGE[article.status] || { label: article.status, color: "bg-gray-500/10 text-gray-400" };
            const canEdit = article.status !== 'published';
            const sectionPath = article.section === 'blog' ? '/blog' : `/${article.section}`;

            return (
              <div key={article._id} className="bg-dark-light border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                <div className="flex items-start gap-4">
                  {article.featuredImage ? (
                    <img src={article.featuredImage} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-dark flex items-center justify-center text-2xl shrink-0">
                      {SECTION_ICON[article.section] || "📄"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-gray-custom">
                        {new Date(article.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                    <h3 className="text-white font-bold truncate mb-1">{article.title}</h3>
                    <p className="text-gray-custom text-sm truncate">{article.excerpt}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Link
                        href={`${sectionPath}/${article.slug}`}
                        className="text-xs text-primary hover:underline"
                        target="_blank"
                      >
                        مشاهده
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/articles/edit/${article._id}`}
                          className="text-xs text-blue-400 hover:underline"
                        >
                          ویرایش
                        </Link>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(article)}
                          disabled={deleting === article._id}
                          className="text-xs text-red-400 hover:underline disabled:opacity-50"
                        >
                          {deleting === article._id ? "..." : "حذف"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
