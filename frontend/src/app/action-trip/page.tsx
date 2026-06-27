import type { Metadata } from "next";
import ArticleCard from "@/components/shared/ArticleCard";
import { getArticles } from "@/lib/api";
import type { Article } from "@/types";

export const metadata: Metadata = {
  title: "اکشن تریپ | طبیعت‌گردی و بقا",
  description:
    "راهنمای سفر تاکتیکال، آموزش بوشکرفت، سفرنامه‌ها، نقشه مکان‌ها و طبیعت‌گردی ایران",
  keywords: ["طبیعت‌گردی", "بقا", "بوشکرفت", "کمپینگ", "سفر", "اکشن تریپ"],
};

export default async function ActionTripPage() {
  let articles: Article[] = [];
  try {
    const res = await getArticles({ section: 'action-trip', limit: 12 });
    articles = res.articles;
  } catch {
    articles = [];
  }

  return (
    <>
      {/* هدر */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏕️</span>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              اکشن <span className="text-accent">تریپ</span>
            </h1>
          </div>
          <p className="text-gray-custom max-w-2xl leading-7">
            راهنمای سفر، آموزش بوشکرفت، سفرنامه‌ها و طبیعت‌گردی ایران
          </p>
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
              هنوز مقاله‌ای در این بخش منتشر نشده است.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
