import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/shared/ArticleCard";
import { getArticles, getCategories } from "@/lib/api";
import type { Article, Category } from "@/types";

export const metadata: Metadata = {
  title: "بازی اکشن | معرفی، نقد و بررسی و آموزش بازی‌های اکشن",
  description:
    "معرفی بهترین بازی‌ها، نقد و بررسی ، آموزش، راهنمایی و گفتگو درباره بازی‌های اکشن",
  keywords: ["بازی اکشن", "نقد بازی", "گیم", "Shooter", "Adventure", "Survival", "آموزش بازی"],
};

const CATEGORY_ICONS: Record<string, string> = {
  "gaming-news": "📰",
  "game-intros": "🎮",
  "game-guides": "📖",
  "hardware-reviews": "🖥️",
  "game-review": "⭐",
  "game-guide": "🗺️",
  game: "🕹️",
  review: "📝",
  news: "📢",
  guide: "📚",
  tutorial: "🎓",
  esports: "🏆",
  "mobile-gaming": "📱",
  "pc-gaming": "💻",
  "console-gaming": "🎯",
  "rpg": "⚔️",
  "fps": "🔫",
  "strategy": "♟️",
  "sports": "⚽",
  "racing": "🏎️",
  "simulation": "🎪",
  "indie": "💎",
  "horror": "👻",
  "adventure": "🗺️",
  "puzzle": "🧩",
  "multiplayer": "👥",
  "open-world": "🌍",
  "survival": "🏕️",
  "battle-royale": "🎯",
  "retro": "👾",
  "vr": "🥽",
  "streaming": "📡",
  "tech": "🔧",
};

function getCategoryIcon(slug: string): string {
  if (CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug];
  // Try partial match
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (slug.includes(key) || key.includes(slug)) return icon;
  }
  return "📂";
}

type Props = {
  searchParams: Promise<{ search?: string; category?: string }>;
};

export default async function ActionGamePage({ searchParams }: Props) {
  const { search, category } = await searchParams;

  let articles: Article[] = [];
  let total = 0;
  let latestArticle: Article | null = null;
  let categories: Category[] = [];

  try {
    const [articlesRes, categoriesRes] = await Promise.all([
      getArticles({
        section: "action-game",
        limit: 12,
        category: category || undefined,
        search: search || undefined,
      }),
      getCategories(),
    ]);

    articles = articlesRes.articles;
    total = articlesRes.total;
    categories = categoriesRes.filter((c) => c.isActive);

    // Get latest article (first one, unless we're filtering)
    if (!search && !category && articles.length > 0) {
      latestArticle = articles[0];
    }
  } catch {
    articles = [];
  }

  const activeCategory = category || "";

  return (
    <>
      {/* هدر */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🎮</span>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              بازی <span className="text-accent">اکشن</span>
            </h1>
          </div>
          <p className="text-lg text-gray-custom max-w-2xl leading-7">
            معرفی بهترین بازی‌ها، نقد و بررسی ، آموزش، راهنمایی و گفتگو درباره بازی‌های اکشن
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* جستجو */}
        <form className="relative mb-8" method="GET" action="/action-game">
          {activeCategory && (
            <input type="hidden" name="category" value={activeCategory} />
          )}
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="جستجو در مقالات بازی اکشن..."
            className="w-full px-5 py-3.5 pl-12 bg-dark-light border border-white/10 rounded-xl text-white placeholder-gray-custom focus:outline-none focus:border-accent/50 transition-colors text-sm"
          />
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-custom hover:text-accent transition-colors"
            aria-label="جستجو"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          {(search || activeCategory) && (
            <Link
              href="/action-game"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent hover:underline"
            >
              پاک کردن فیلترها
            </Link>
          )}
        </form>

        {/* جدیدترین مطلب — نمایش ویژه در صفحه اول */}
        {latestArticle && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-6 bg-accent rounded-full inline-block" />
              جدیدترین مطلب
            </h2>
            <Link
              href={`/action-game/${latestArticle.slug}`}
              className="group block bg-dark-light border border-white/10 rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-video md:aspect-auto overflow-hidden">
                  {latestArticle.featuredImage ? (
                    <img
                      src={latestArticle.featuredImage}
                      alt={latestArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[240px] bg-dark flex items-center justify-center">
                      <span className="text-6xl">🎮</span>
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 text-xs gradient-primary text-white rounded-md">
                      جدیدترین
                    </span>
                    {latestArticle.categories?.[0] && (
                      <span className="text-xs text-gray-custom">
                        {latestArticle.categories[0].name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-accent transition-colors leading-tight">
                    {latestArticle.title}
                  </h3>
                  <p className="text-gray-custom text-sm leading-7 line-clamp-3 mb-4">
                    {latestArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-custom mt-auto">
                    {latestArticle.author && (
                      <span>{latestArticle.author.fullName}</span>
                    )}
                    {latestArticle.createdAt && (
                      <>
                        <span>•</span>
                        <span>
                          {new Date(latestArticle.createdAt).toLocaleDateString("fa-IR")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* دسته‌بندی‌ها با لوگو */}
        {categories.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-6 bg-accent rounded-full inline-block" />
              دسته‌بندی‌ها
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/action-game?category=${cat.slug}`}
                  className={`group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                    activeCategory === cat.slug
                      ? "border-accent bg-accent/10"
                      : "border-white/10 bg-dark-light hover:border-accent/30 hover:bg-dark"
                  }`}
                >
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                    {getCategoryIcon(cat.slug)}
                  </span>
                  <span
                    className={`text-xs font-medium text-center leading-5 transition-colors ${
                      activeCategory === cat.slug ? "text-accent" : "text-gray-custom group-hover:text-white"
                    }`}
                  >
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* عنوان نتایج جستجو */}
        {search && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">
              نتایج جستجو برای: <span className="text-accent">&ldquo;{search}&rdquo;</span>
              <span className="text-gray-custom text-sm font-normal mr-2">
                ({total} نتیجه)
              </span>
            </h2>
          </div>
        )}

        {activeCategory && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">
              دسته:{" "}
              <span className="text-accent">
                {categories.find((c) => c.slug === activeCategory)?.name || activeCategory}
              </span>
              <span className="text-gray-custom text-sm font-normal mr-2">
                ({total} نتیجه)
              </span>
            </h2>
          </div>
        )}

        {/* شبکه مقالات */}
        <section>
          {!search && !activeCategory && (
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-6 bg-accent rounded-full inline-block" />
              همه مقالات
            </h2>
          )}
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article._id} {...article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">🔍</span>
              <p className="text-gray-custom text-lg">
                {search
                  ? "نتیجه‌ای برای جستجوی شما یافت نشد."
                  : activeCategory
                  ? "مقاله‌ای در این دسته‌بندی یافت نشد."
                  : "هنوز مقاله‌ای در این بخش منتشر نشده است."}
              </p>
              {(search || activeCategory) && (
                <Link
                  href="/action-game"
                  className="inline-block mt-4 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors text-sm"
                >
                  مشاهده همه مقالات
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
