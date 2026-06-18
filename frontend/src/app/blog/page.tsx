import type { Metadata } from "next";
import ArticleCard from "@/components/shared/ArticleCard";
import Link from "next/link";

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

const demoArticles = [
  {
    title: "سبک زندگی اکشن چیست و چگونه آن را شروع کنیم؟",
    slug: "what-is-action-lifestyle",
    excerpt: "آشنایی با مفهوم سبک زندگی اکشن و راه‌های عملی برای شروع این مسیر هیجان‌انگیز",
    section: "blog" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-17T10:00:00Z",
  },
  {
    title: "۱۰ عادت روزانه افراد ماجراجو",
    slug: "10-daily-habits-adventurers",
    excerpt: "عادت‌هایی که افراد ماجراجو هر روز تمرین می‌کنند و شما هم می‌توانید",
    section: "blog" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-15T10:00:00Z",
  },
  {
    title: "تجهیزات ضروری طبیعت‌گردی برای مبتدیان",
    slug: "essential-hiking-gear-beginners",
    excerpt: "لیست کامل تجهیزاتی که برای اولین سفر طبیعت‌گردی خود نیاز دارید",
    section: "blog" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-12T10:00:00Z",
  },
  {
    title: "مقایسه PS5 Pro و Xbox Series X: کدام برای گیمرهای اکشن بهتر است؟",
    slug: "ps5-pro-vs-xbox-series-x-action-gamers",
    excerpt: "بررسی تخصصی دو کنسول برتر بازار برای بازی‌های اکشن",
    section: "blog" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-10T10:00:00Z",
  },
  {
    title: "چگونه در خانه تمرین بوشکرفت انجام دهیم؟",
    slug: "bushcraft-practice-at-home",
    excerpt: "تکنیک‌ها و تمرین‌های بوشکرفت که می‌توانید بدون رفتن به طبیعت انجام دهید",
    section: "blog" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-08T10:00:00Z",
  },
  {
    title: "برترین فیلم‌های اکشن سال ۲۰۲۶",
    slug: "top-action-movies-2026",
    excerpt: "معرفی و رتبه‌بندی بهترین فیلم‌های اکشن امسال که حتماً باید ببینید",
    section: "blog" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-05T10:00:00Z",
  },
];

export default function BlogPage() {
  return (
    <>
      {/* هدر صفحه */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            وبلاگ <span className="text-primary">اکشن لایف</span>
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
                  ? "bg-primary text-white border-primary"
                  : "bg-white/5 text-gray-custom border-white/10 hover:border-primary/50 hover:text-white"
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
          {demoArticles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>

        {/* صفحه‌بندی */}
        <div className="flex justify-center gap-2 mt-12">
          <span className="px-4 py-2 gradient-primary text-white rounded-lg text-sm">۱</span>
          <button className="px-4 py-2 bg-white/5 text-gray-custom border border-white/10 rounded-lg text-sm hover:text-white hover:border-primary/50 transition-colors">
            ۲
          </button>
          <button className="px-4 py-2 bg-white/5 text-gray-custom border border-white/10 rounded-lg text-sm hover:text-white hover:border-primary/50 transition-colors">
            ۳
          </button>
        </div>
      </section>
    </>
  );
}
