"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ArticleCard from "@/components/shared/ArticleCard";
import { getArticles, getPopularArticles, getStoreProducts } from "@/lib/api";
import type { Article, StoreProduct } from "@/types";

const blogCategories = [
  { label: "همه", slug: "all" },
  { label: "سبک زندگی اکشن", slug: "action-lifestyle" },
  { label: "ترفندها و آموزش‌ها", slug: "tips-tricks" },
  { label: "دانستنی‌ها", slug: "facts" },
  { label: "اخبار", slug: "news" },
  { label: "طبیعت‌گردی", slug: "nature" },
  { label: "گیم", slug: "game" },
  { label: "سینما", slug: "cinema" },
  { label: "ورزش", slug: "sport" },
];

const PAGE_SIZE = 12;

interface Props {
  category?: string;
  page: number;
}

export default function BlogClient({ category, page }: Props) {
  const [popularArticle, setPopularArticle] = useState<Article | null>(null);
  const [bestProduct, setBestProduct] = useState<StoreProduct | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const buildHref = useCallback(
    (p: number) => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (p > 1) params.set("page", String(p));
      const qs = params.toString();
      return qs ? `/blog?${qs}` : "/blog";
    },
    [category],
  );

  useEffect(() => {
    setLoading(true);

    Promise.all([
      getPopularArticles(1),
      getStoreProducts({ sort: "sales_desc", limit: 1 }),
      getArticles({ limit: PAGE_SIZE, page, category }),
    ])
      .then(([popularArr, bestProductRes, articlesRes]) => {
        if (popularArr.length > 0) {
          setPopularArticle(popularArr[0]);
        }
        if (bestProductRes.products?.length > 0) {
          setBestProduct(bestProductRes.products[0]);
        }
        setArticles(articlesRes.articles);
        setTotal(articlesRes.total);
      })
      .catch(() => {
        setArticles([]);
      })
      .finally(() => setLoading(false));
  }, [page, category]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filteredArticles = popularArticle
    ? articles.filter((a) => a._id !== popularArticle._id)
    : articles;

  return (
    <>
      {/* هدر صفحه */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            زندگی <span className="text-accent">اکشن</span>
          </h1>
          <p className="text-gray-custom max-w-2xl leading-7">
            آخرین مقالات، آموزش‌ها و اخبار دنیای سبک زندگی اکشن
          </p>
        </div>
      </section>

      {/* دسته‌بندی‌ها */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {blogCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.slug === "all" ? "/blog" : `/blog?category=${cat.slug}`}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                cat.slug === category || (cat.slug === "all" && !category)
                  ? "bg-accent text-white border-accent"
                  : "bg-white/5 text-gray-custom border-white/10 hover:border-accent/50 hover:text-white"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
          </div>
        </section>
      ) : (
        <>
          {/* هیرو: پربازدیدترین مطلب + پرفروش‌ترین محصول */}
          {page === 1 && !category && popularArticle && (
            <section className="max-w-7xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Link
                    href={`/blog/${popularArticle.slug}`}
                    className="group block bg-dark-light border border-white/10 rounded-2xl overflow-hidden hover:border-accent/30 transition-all h-full"
                  >
                    <div className="aspect-video lg:aspect-[21/9] bg-white/5 relative overflow-hidden">
                      {popularArticle.featuredImage ? (
                        <img
                          src={popularArticle.featuredImage}
                          alt={popularArticle.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-custom">
                          <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-red-500/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                        پربازدیدترین
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-light via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 text-xs gradient-primary text-white rounded-md">
                          زندگی اکشن
                        </span>
                        <span className="text-xs text-gray-custom">
                          {popularArticle.views} بازدید
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-accent transition-colors">
                        {popularArticle.title}
                      </h2>
                      <p className="text-gray-custom text-sm line-clamp-3 leading-7 mb-4">
                        {popularArticle.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-custom">
                        {popularArticle.author && (
                          <Link
                            href={`/users/${popularArticle.author.username || popularArticle.author._id}`}
                            className="hover:text-accent transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {popularArticle.author.username || popularArticle.author.fullName}
                          </Link>
                        )}
                        <span>&bull;</span>
                        <span>{new Date(popularArticle.createdAt).toLocaleDateString("fa-IR")}</span>
                      </div>
                    </div>
                  </Link>
                </div>

                {bestProduct && (
                  <div className="lg:col-span-1">
                    <Link
                      href={`/store/${bestProduct.slug}`}
                      className="group block bg-dark-light border border-white/10 rounded-2xl overflow-hidden hover:border-green-500/30 transition-all h-full"
                    >
                      <div className="aspect-video bg-white/5 relative overflow-hidden">
                        {bestProduct.coverImage ? (
                          <img
                            src={bestProduct.coverImage}
                            alt={bestProduct.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-custom">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-green-500/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                          پرفروش‌ترین
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-md">
                            فروشگاه
                          </span>
                          <span className="text-xs text-gray-custom">
                            {bestProduct.salesCount} فروش
                          </span>
                        </div>
                        <h3 className="text-white font-bold mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
                          {bestProduct.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-400">
                            {new Intl.NumberFormat("fa-IR").format(
                              bestProduct.discountPrice > 0 ? bestProduct.discountPrice : bestProduct.price,
                            )}{" "}
                            توکن
                          </span>
                          {bestProduct.discountPrice > 0 && bestProduct.discountPrice < bestProduct.price && (
                            <span className="text-xs text-gray-custom line-through">
                              {new Intl.NumberFormat("fa-IR").format(bestProduct.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* مطالب جدید */}
          <section className="max-w-7xl mx-auto px-4 py-8">
            {filteredArticles.length > 0 ? (
              <>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 gradient-primary rounded-full inline-block" />
                  {page === 1 && !category ? "مطالب جدید" : "مطالب"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article._id} {...article} />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-custom col-span-full text-center py-12">
                هنوز مقاله‌ای منتشر نشده است.
              </p>
            )}
          </section>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4 mb-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildHref(p)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                    p === page
                      ? "gradient-primary text-white border-transparent"
                      : "bg-white/5 text-gray-custom border-white/10 hover:text-white hover:border-accent/50"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
