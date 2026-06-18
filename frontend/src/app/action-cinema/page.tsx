import type { Metadata } from "next";
import ArticleCard from "@/components/shared/ArticleCard";

export const metadata: Metadata = {
  title: "اکشن نما | نقد و بررسی فیلم‌ها و سریال‌های اکشن",
  description:
    "نقد تخصصی فیلم‌ها و سریال‌های اکشن، معرفی آثار جدید، تریلرها و دسته‌بندی فیلم‌های اکشن هالیوود، کره‌ای، ژاپنی و چینی",
  keywords: ["فیلم اکشن", "نقد فیلم", "سریال اکشن", "سینمای اکشن", "اکشن نما"],
};

const categories = [
  { label: "همه", slug: "all" },
  { label: "نقد فیلم", slug: "review" },
  { label: "معرفی فیلم", slug: "introduction" },
  { label: "هالیوود", slug: "hollywood" },
  { label: "کره‌ای", slug: "korean" },
  { label: "ژاپنی", slug: "japanese" },
  { label: "سریال‌ها", slug: "series" },
  { label: "کلاسیک", slug: "classic" },
];

const demoArticles = [
  {
    title: "نقد فیلم Mission Impossible 8: پایان یک دوران",
    slug: "mission-impossible-8-review",
    excerpt: "تام کروز در آخرین ماموریت غیرممکن بار دیگر اثبات می‌کند که هنوز پادشاه اکشن است",
    section: "action-cinema" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-16T10:00:00Z",
  },
  {
    title: "بهترین سریال‌های اکشن ۲۰۲۶ برای تماشا",
    slug: "best-action-series-2026",
    excerpt: "لیست برترین سریال‌های اکشن سال ۲۰۲۶ از پلتفرم‌های مختلف استریمینگ",
    section: "action-cinema" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-14T10:00:00Z",
  },
  {
    title: "معرفی آثار جدید اکشن کره‌ای: موج جدید هالیو",
    slug: "new-korean-action-movies",
    excerpt: "بررسی موج جدید فیلم‌های اکشن کره‌ای و تأثیر آن‌ها بر سینمای جهان",
    section: "action-cinema" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-11T10:00:00Z",
  },
  {
    title: "تریلر جدید فیلم The Dark Knight Legacy منتشر شد",
    slug: "dark-knight-legacy-trailer",
    excerpt: "اولین تریلر رسمی ادامه مجموعه شوالیه تاریکی منتشر شد و طرفداران را شگفت‌زده کرد",
    section: "action-cinema" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-08T10:00:00Z",
  },
  {
    title: "۱۰ فیلم اکشن کلاسیک که حتماً باید ببینید",
    slug: "10-classic-action-movies-must-watch",
    excerpt: "فیلم‌هایی که تاریخ سینمای اکشن را شکل دادند و هنوز هم ارزش تماشا دارند",
    section: "action-cinema" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-05T10:00:00Z",
  },
  {
    title: "مقایسه آثار اکشن ژاپنی و هالیوودی: تفاوت در فلسفه",
    slug: "japanese-vs-hollywood-action",
    excerpt: "بررسی تفاوت‌های بنیادین سینمای اکشن ژاپن و هالیوود از نظر فلسفی و بصری",
    section: "action-cinema" as const,
    author: { fullName: "تیم اکشن لایف" },
    createdAt: "2026-06-02T10:00:00Z",
  },
];

export default function ActionCinemaPage() {
  return (
    <>
      {/* هدر */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🎬</span>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              اکشن <span className="text-primary">نما</span>
            </h1>
          </div>
          <p className="text-gray-custom max-w-2xl leading-7">
            نقد و بررسی تخصصی فیلم‌ها و سریال‌های اکشن - معرفی آثار جدید، تریلرها و دسته‌بندی فیلم‌ها
          </p>
        </div>
      </section>

      {/* دسته‌بندی‌ها */}
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

      {/* مقالات */}
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
