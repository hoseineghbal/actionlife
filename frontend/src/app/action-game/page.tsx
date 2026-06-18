import type { Metadata } from "next";
import ArticleCard from "@/components/shared/ArticleCard";

export const metadata: Metadata = {
  title: "اکشن گیم | نقد و بررسی بازی‌های اکشن",
  description:
    "نقد و بررسی بازی‌های اکشن PC، Console و Mobile، آموزش و راهنمای بازی‌ها، معرفی بهترین بازی‌های اکشن",
  keywords: ["بازی اکشن", "نقد بازی", "گیم", "Shooter", "Adventure", "Survival"],
};

const categories = [
  { label: "همه", slug: "all" },
  { label: "نقد و بررسی", slug: "review" },
  { label: "آموزش و راهنما", slug: "guide" },
  { label: "PC", slug: "pc" },
  { label: "Console", slug: "console" },
  { label: "Mobile", slug: "mobile" },
  { label: "Shooter", slug: "shooter" },
  { label: "Open World", slug: "open-world" },
];

const demoArticles = [
  {
    title: "نقد و بررسی GTA 6: انقلاب در دنیای بازی‌های Open World",
    slug: "gta-6-review",
    excerpt: "بررسی کامل بازی GTA 6 از نظر گیم‌پلی، گرافیک، داستان و محتوای بازی",
    section: "action-game" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-17T10:00:00Z",
  },
  {
    title: "راهنمای کامل بازی The Last of Us Part III",
    slug: "the-last-of-us-3-walkthrough",
    excerpt: "راهنمای قدم‌به‌قدم بازی The Last of Us Part III با تمام اسرار و آیتم‌های مخفی",
    section: "action-game" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-14T10:00:00Z",
  },
  {
    title: "بهترین بازی‌های Survival سال ۲۰۲۶",
    slug: "best-survival-games-2026",
    excerpt: "معرفی و رتبه‌بندی برترین بازی‌های بقا که در سال ۲۰۲۶ منتشر شده‌اند",
    section: "action-game" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-11T10:00:00Z",
  },
  {
    title: "Tips & Tricks برای موفقیت در بازی‌های Battle Royale",
    slug: "battle-royale-tips-tricks",
    excerpt: "ترفندها و نکات حرفه‌ای برای بالا بردن رنک و بهتر بازی کردن در بازی‌های بتل رویال",
    section: "action-game" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-08T10:00:00Z",
  },
  {
    title: "مقایسه Unreal Engine 6 و Unity: کدام برای بازی‌های اکشن بهتر است؟",
    slug: "unreal-engine-6-vs-unity",
    excerpt: "بررسی فنی دو موتور بازی‌سازی محبوب و تأثیر آن‌ها بر بازی‌های اکشن آینده",
    section: "action-game" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-05T10:00:00Z",
  },
  {
    title: "بهترین بازی‌های اکشن موبایل ۲۰۲۶",
    slug: "best-mobile-action-games-2026",
    excerpt: "معرفی برترین بازی‌های اکشن موبایل برای اندروید و iOS",
    section: "action-game" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-02T10:00:00Z",
  },
];

export default function ActionGamePage() {
  return (
    <>
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🎮</span>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              اکشن <span className="text-primary">گیم</span>
            </h1>
          </div>
          <p className="text-gray-custom max-w-2xl leading-7">
            نقد و بررسی بازی‌های اکشن، آموزش و راهنما، معرفی بهترین بازی‌ها برای PC، Console و Mobile
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
