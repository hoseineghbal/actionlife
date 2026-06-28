import type { Metadata } from "next";
import ArticleCard from "@/components/shared/ArticleCard";
import Link from "next/link";
import { getArticles } from "@/lib/api";
import type { Article } from "@/types";

export const metadata: Metadata = {
  title: "وبلاگ",
  description:
    "آخرین مقالات و آموزش‌های سبک زندگی اکشن - طبیعت‌گردی، بقا، ورزش، گیم و سینما",
};

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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1") || 1);

  let articles: Article[] = [];
  let total = 0;
  try {
    const res = await getArticles({ limit: PAGE_SIZE, page, category });
    articles = res.articles;
    total = res.total;
  } catch {
    articles = [];
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <>
      {/* هدر صفحه */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            وبلاگ <span className="text-accent">اکشن لایف</span>
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

      {/* مقالات */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.length > 0 ? (
            articles.map((article) => (
              <ArticleCard key={article._id} {...article} />
            ))
          ) : (
            <p className="text-gray-custom col-span-full text-center py-12">
              هنوز مقاله‌ای منتشر نشده است.
            </p>
          )}
        </div>

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
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
      </section>
    </>
  );
}
