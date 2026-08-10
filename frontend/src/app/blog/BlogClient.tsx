"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ArticleCard from "@/components/shared/ArticleCard";
import { getArticles, getPopularArticles, getStoreProducts, getCategories } from "@/lib/api";
import type { Article, StoreProduct, Category } from "@/types";

const PAGE_SIZE = 12;

interface Props {
  category?: string;
  page: number;
  search?: string;
}

// نگاشت آیکن‌های اختصاصی برای دسته‌بندی‌ها بر اساس slug
const categoryIconMap: Record<string, (props: { className?: string }) => ReactElement> = {
  // آیکن‌های پیش‌فرض برای دسته‌بندی‌های رایج
  "action-lifestyle": ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
    </svg>
  ),
  "sport": ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  "game": ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "cinema": ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  ),
  "nature": ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  "news": ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  "tips-tricks": ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  "facts": ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

// آیکن پیش‌فرض برای دسته‌بندی‌های دیگر
const defaultCategoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

// رنگ‌های چرخشی برای کارت دسته‌بندی‌ها
const categoryColors = [
  "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20",
  "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20",
  "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20",
  "from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/20",
  "from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/20",
  "from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/20",
];

function getCategoryColor(index: number) {
  return categoryColors[index % categoryColors.length];
}

export default function BlogClient({ category, page, search }: Props) {
  const router = useRouter();
  const [popularArticle, setPopularArticle] = useState<Article | null>(null);
  const [latestArticle, setLatestArticle] = useState<Article | null>(null);
  const [bestProduct, setBestProduct] = useState<StoreProduct | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(search || "");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildHref = useCallback(
    (p: number) => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (p > 1) params.set("page", String(p));
      const qs = params.toString();
      return qs ? `/blog?${qs}` : "/blog";
    },
    [category, search],
  );

  useEffect(() => {
    setLoading(true);

    Promise.all([
      getPopularArticles(1),
      getArticles({ limit: 1, page: 1 }),
      getStoreProducts({ sort: "sales_desc", limit: 1 }),
      getCategories(),
      getArticles({ limit: PAGE_SIZE, page, category, search }),
    ])
      .then(([popularArr, latestArr, bestProductRes, categoriesRes, articlesRes]) => {
        if (popularArr.length > 0) {
          setPopularArticle(popularArr[0]);
        }
        if (latestArr.articles?.length > 0) {
          setLatestArticle(latestArr.articles[0]);
        }
        if (bestProductRes.products?.length > 0) {
          setBestProduct(bestProductRes.products[0]);
        }
        setCategories(categoriesRes.filter((c) => c.isActive));
        setArticles(articlesRes.articles);
        setTotal(articlesRes.total);
      })
      .catch(() => {
        setArticles([]);
      })
      .finally(() => setLoading(false));
  }, [page, category, search]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        if (value.trim()) {
          const params = new URLSearchParams();
          params.set("search", value.trim());
          if (category) params.set("category", category);
          router.push(`/blog?${params.toString()}`);
        } else {
          if (category) {
            router.push(`/blog?category=${category}`);
          } else {
            router.push("/blog");
          }
        }
      }, 500);
    },
    [router, category],
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // فیلتر مقالات تکراری از بخش‌های ویژه
  const featuredIds = new Set<string>();
  if (popularArticle) featuredIds.add(popularArticle._id);
  if (latestArticle) featuredIds.add(latestArticle._id);
  const filteredArticles = articles.filter((a) => !featuredIds.has(a._id));

  const getCategoryIcon = (slug: string) => {
    return categoryIconMap[slug] || defaultCategoryIcon;
  };

  return (
    <>
      {/* هدر صفحه */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            وبلاگ <span className="text-accent">زندگی اکشن</span>
          </h1>
          <p className="text-gray-custom max-w-2xl leading-7">
            مقالات، آموزش‌ها، اخبار اعضای قبیله زندگی اکشن و انجمن های تخصصی
          </p>
        </div>
      </section>

      {/* جستجو */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="relative max-w-xl">
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-custom"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="جستجو در مقالات..."
            className="w-full pr-10 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-custom focus:outline-none focus:border-accent/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                router.push("/blog");
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-custom hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </section>

      {/* دسته‌بندی‌ها با لوگوی ویژه */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* دکمه "همه" */}
            <Link
              href="/blog"
              className={`group flex flex-col items-center gap-2 p-4 rounded-xl border bg-white/5 transition-all hover:scale-105 ${
                !category
                  ? "border-accent bg-accent/10"
                  : "border-white/10 hover:border-accent/30"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                !category ? "bg-accent/20 text-accent" : "bg-white/10 text-gray-custom group-hover:text-white"
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <span className={`text-xs font-medium truncate w-full text-center ${
                !category ? "text-accent" : "text-gray-custom group-hover:text-white"
              }`}>
                همه
              </span>
            </Link>

            {categories.map((cat, index) => {
              const Icon = getCategoryIcon(cat.slug);
              const colorClass = getCategoryColor(index);
              const isActive = category === cat.slug;
              return (
                <Link
                  key={cat._id}
                  href={`/blog?category=${cat.slug}`}
                  className={`group flex flex-col items-center gap-2 p-4 rounded-xl border bg-white/5 transition-all hover:scale-105 ${
                    isActive
                      ? "border-accent bg-accent/10"
                      : "border-white/10 hover:border-accent/30"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br transition-colors ${
                    isActive ? "bg-accent/20 text-accent" : `bg-white/10 ${colorClass.split(" ")[1] || "text-gray-custom"}`
                  } group-hover:bg-white/10 group-hover:!text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-medium truncate w-full text-center ${
                    isActive ? "text-accent" : "text-gray-custom group-hover:text-white"
                  }`}>
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {loading ? (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
          </div>
        </section>
      ) : (
        <>
          {/* جدیدترین + پربازدیدترین + پرفروش‌ترین */}
          {page === 1 && !category && (latestArticle || popularArticle) && (
            <section className="max-w-7xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* جدیدترین مطلب */}
                {latestArticle && (
                  <div className="lg:col-span-1">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-green-500 rounded-full inline-block" />
                      جدیدترین مطلب
                    </h2>
                    <Link
                      href={`/blog/${latestArticle.slug}`}
                      className="group block bg-dark-light border border-white/10 rounded-xl overflow-hidden hover:border-green-500/30 transition-all h-full"
                    >
                      <div className="aspect-video bg-white/5 relative overflow-hidden">
                        {latestArticle.featuredImage ? (
                          <img
                            src={latestArticle.featuredImage}
                            alt={latestArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-custom">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-500/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                          جدید
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-bold mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
                          {latestArticle.title}
                        </h3>
                        <p className="text-gray-custom text-xs line-clamp-2 mb-3 leading-6">
                          {latestArticle.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-custom">
                          <span>{new Date(latestArticle.createdAt).toLocaleDateString("fa-IR")}</span>
                          <span>&bull;</span>
                          <span>{latestArticle.views} بازدید</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* پربازدیدترین (در صورت وجود جدیدترین، فقط 1 ستون می‌گیرد) */}
                {popularArticle && (
                  <div className={latestArticle ? "lg:col-span-1" : "lg:col-span-2"}>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-red-500 rounded-full inline-block" />
                      پربازدیدترین
                    </h2>
                    <Link
                      href={`/blog/${popularArticle.slug}`}
                      className="group block bg-dark-light border border-white/10 rounded-xl overflow-hidden hover:border-accent/30 transition-all h-full"
                    >
                      <div className="aspect-video bg-white/5 relative overflow-hidden">
                        {popularArticle.featuredImage ? (
                          <img
                            src={popularArticle.featuredImage}
                            alt={popularArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-custom">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-red-500/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                          پربازدیدترین
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs gradient-primary text-white rounded-md">
                            وبلاگ زندگی اکشن
                          </span>
                          <span className="text-xs text-gray-custom">
                            {popularArticle.views} بازدید
                          </span>
                        </div>
                        <h3 className="text-white font-bold mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                          {popularArticle.title}
                        </h3>
                        <p className="text-gray-custom text-xs line-clamp-2 mb-3 leading-6">
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
                )}

                {/* پرفروش‌ترین محصول */}
                {bestProduct && (
                  <div className="lg:col-span-1">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-amber-500 rounded-full inline-block" />
                      پرفروش‌ترین فروشگاه
                    </h2>
                    <Link
                      href={`/store/${bestProduct.slug}`}
                      className="group block bg-dark-light border border-white/10 rounded-xl overflow-hidden hover:border-green-500/30 transition-all h-full"
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
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-500/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm">
                          پرفروش‌ترین
                        </div>
                      </div>
                      <div className="p-4">
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

          {/* مطالب */}
          {filteredArticles.length > 0 || articles.length === 0 ? (
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
                !loading && (
                  <p className="text-gray-custom col-span-full text-center py-12">
                    هنوز مقاله‌ای منتشر نشده است.
                  </p>
                )
              )}
            </section>
          ) : null}

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
