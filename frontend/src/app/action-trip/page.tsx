import type { Metadata } from "next";
import ArticleCard from "@/components/shared/ArticleCard";

export const metadata: Metadata = {
  title: "اکشن تریپ | طبیعت‌گردی و بقا",
  description:
    "راهنمای سفر تاکتیکال، آموزش بوشکرفت، سفرنامه‌ها، نقشه مکان‌ها و طبیعت‌گردی ایران",
  keywords: ["طبیعت‌گردی", "بقا", "بوشکرفت", "کمپینگ", "سفر", "اکشن تریپ"],
};

const categories = [
  { label: "همه", slug: "all" },
  { label: "راهنمای سفر", slug: "travel-guide" },
  { label: "آموزش بوشکرفت", slug: "bushcraft" },
  { label: "سفرنامه", slug: "travelogue" },
  { label: "تجهیزات", slug: "gear" },
  { label: "مناطق بقا", slug: "survival-zones" },
  { label: "کمپینگ", slug: "camping" },
  { label: "طبیعت‌گردی ایران", slug: "iran-nature" },
];

const demoArticles = [
  {
    title: "راهنمای کامل بقا در جنگل‌های شمال ایران",
    slug: "survival-guide-north-iran-forests",
    excerpt: "همه چیز درباره بقا در جنگل‌های هیرکانی: از پناهگاه تا آب و غذا",
    section: "action-trip" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-17T10:00:00Z",
  },
  {
    title: "آموزش ساخت پناهگاه در طبیعت: ۵ روش مختلف",
    slug: "shelter-building-5-methods",
    excerpt: "آموزش قدم‌به‌قدم ساخت انواع پناهگاه با مواد طبیعی موجود در جنگل و کوهستان",
    section: "action-trip" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-14T10:00:00Z",
  },
  {
    title: "بهترین تجهیزات کمپینگ ۲۰۲۶: راهنمای خرید جامع",
    slug: "best-camping-gear-2026",
    excerpt: "معرفی و مقایسه بهترین تجهیزات کمپینگ موجود در بازار ایران و جهان",
    section: "action-trip" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-11T10:00:00Z",
  },
  {
    title: "سفرنامه: ۷ روز در کویر لوت",
    slug: "travelogue-7-days-lut-desert",
    excerpt: "گزارش سفر هفت‌روزه تیم اکشن لایف به گرم‌ترین نقطه زمین، کویر لوت",
    section: "action-trip" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-08T10:00:00Z",
  },
  {
    title: "چک‌لیست تجهیزات کوهنوردی: از مبتدی تا حرفه‌ای",
    slug: "mountaineering-gear-checklist",
    excerpt: "لیست کامل تجهیزات مورد نیاز برای کوهنوردی در سطوح مختلف",
    section: "action-trip" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-05T10:00:00Z",
  },
  {
    title: "نقشه بهترین مکان‌های کمپینگ نزدیک تهران",
    slug: "camping-spots-near-tehran",
    excerpt: "معرفی و بررسی بهترین مکان‌های کمپینگ در فاصله کمتر از ۲ ساعت از تهران",
    section: "action-trip" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-02T10:00:00Z",
  },
];

export default function ActionTripPage() {
  return (
    <>
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏕️</span>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              اکشن <span className="text-primary">تریپ</span>
            </h1>
          </div>
          <p className="text-gray-custom max-w-2xl leading-7">
            راهنمای سفر تاکتیکال، آموزش بوشکرفت و بقا، سفرنامه‌ها و طبیعت‌گردی ایران
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                cat.slug === "all"
                  ? "bg-primary text-white border-primary"
                  : "bg-white/5 text-gray-custom border-white/10 hover:border-primary/50 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoArticles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      </section>
    </>
  );
}
