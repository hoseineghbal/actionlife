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

export default async function BlogPage() {
  let articles: Article[] = [];
  try {
    const res = await getArticles({ limit: 12 });
    articles = res.articles;
  } catch {
    articles = [];
  }

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
                cat.slug === "all"
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
        <div className="flex justify-center gap-2 mt-12">
          <span className="px-4 py-2 gradient-primary text-white rounded-lg text-sm">۱</span>
          <button className="px-4 py-2 bg-white/5 text-gray-custom border border-white/10 rounded-lg text-sm hover:text-white hover:border-accent/50 transition-colors">
            ۲
          </button>
          <button className="px-4 py-2 bg-white/5 text-gray-custom border border-white/10 rounded-lg text-sm hover:text-white hover:border-accent/50 transition-colors">
            ۳
          </button>
        </div>
      </section>
    </>
  );
}
