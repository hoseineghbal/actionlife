import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/shared/ArticleCard";
import { getArticles } from "@/lib/api";
import type { Article } from "@/types";

export const metadata: Metadata = {
  title: "سفر اکشن | سفرنامه، راهنمای سفر، مقاصد گردشگری، آموزش بوشکرفت و طبیعت‌گردی",
  description:
    "سفرنامه‌، راهنمای سفر، مقاصد گردشگری، آموزش بوشکرفت و طبیعت‌گردی",
  keywords: ["سفرنامه", "راهنمای سفر", "گردشگری", "بوشکرفت", "طبیعت‌گردی", "سفر", "اکشن"],
};

const TRIP_CATEGORIES = [
  {
    name: "سفرنامه",
    slug: "travel-stories",
    icon: "✍️",
    color: "from-amber-500/20 to-orange-600/10",
    borderColor: "border-amber-500/30",
  },
  {
    name: "راهنمای سفر",
    slug: "travel-guides",
    icon: "📋",
    color: "from-blue-500/20 to-cyan-600/10",
    borderColor: "border-blue-500/30",
  },
  {
    name: "مقاصد گردشگری",
    slug: "destinations",
    icon: "🗺️",
    color: "from-emerald-500/20 to-teal-600/10",
    borderColor: "border-emerald-500/30",
  },
  {
    name: "آموزش بوشکرفت",
    slug: "bushcraft-training",
    icon: "🪓",
    color: "from-green-500/20 to-lime-600/10",
    borderColor: "border-green-500/30",
  },
  {
    name: "طبیعت‌گردی",
    slug: "nature",
    icon: "🏔️",
    color: "from-purple-500/20 to-violet-600/10",
    borderColor: "border-purple-500/30",
  },
];

type Props = {
  searchParams: Promise<{ category?: string; search?: string }>;
};

export default async function ActionTripPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedCategory = params.category || "";
  const searchQuery = params.search || "";

  let articles: Article[] = [];
  let latestArticle: Article | null = null;
  try {
    // Fetch all articles for this section (optionally filtered)
    const res = await getArticles({
      section: "action-trip",
      limit: 12,
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
    });
    articles = res.articles;

    // Fetch the single latest article (only when no filter is active)
    if (!selectedCategory && !searchQuery) {
      const latestRes = await getArticles({
        section: "action-trip",
        limit: 1,
      });
      if (latestRes.articles.length > 0) {
        latestArticle = latestRes.articles[0];
      }
    }
  } catch {
    articles = [];
  }

  const activeCategory = TRIP_CATEGORIES.find((c) => c.slug === selectedCategory);

  return (
    <>
      {/* هدر سکشن */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏕️</span>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              سفر <span className="text-accent">اکشن</span>
            </h1>
          </div>
          <p className="text-gray-custom max-w-2xl leading-7">
            سفرنامه‌، راهنمای سفر، مقاصد گردشگری، آموزش بوشکرفت و طبیعت‌گردی
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* جستجو */}
        <ActionTripSearch initialValue={searchQuery} />

        {/* دسته‌بندی‌ها */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1 h-5 gradient-primary rounded-full inline-block" />
            <h2 className="text-lg font-bold text-white">دسته‌بندی‌ها</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {TRIP_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              const href = `/action-trip?category=${cat.slug}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`;
              return (
                <Link
                  key={cat.slug}
                  href={href}
                  className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 group ${
                    isActive
                      ? `${cat.borderColor} bg-gradient-to-br ${cat.color} scale-[1.02]`
                      : "border-white/10 bg-dark-light hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {/* لوگوی ویژه: آیکون بزرگ در پس‌زمینه */}
                  <span className="absolute -bottom-2 -left-2 text-5xl opacity-10 select-none pointer-events-none">
                    {cat.icon}
                  </span>
                  <div className="relative z-10 flex flex-col items-center text-center gap-2">
                    <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                      {cat.icon}
                    </span>
                    <span
                      className={`text-sm font-bold transition-colors ${
                        isActive ? "text-accent" : "text-white group-hover:text-accent"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </div>
                  {isActive && (
                    <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </div>
          {selectedCategory && activeCategory && (
            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/action-trip${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}
                className="text-xs text-accent hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                حذف فیلتر «{activeCategory.name}»
              </Link>
            </div>
          )}
        </section>

        {/* جدیدترین مطلب */}
        {latestArticle && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-5 gradient-primary rounded-full inline-block" />
              <h2 className="text-lg font-bold text-white">جدیدترین مطلب</h2>
            </div>
            <Link
              href={`/action-trip/${latestArticle.slug}`}
              className="group block relative rounded-xl overflow-hidden border border-white/10 hover:border-accent/30 transition-all"
            >
              <div className="aspect-[21/9] bg-dark-light">
                {latestArticle.featuredImage ? (
                  <img
                    src={latestArticle.featuredImage}
                    alt={latestArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-custom">
                    <span className="text-6xl">🏕️</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-6">
                  <span className="inline-block px-2 py-1 text-xs gradient-primary text-white rounded-md mb-3">
                    جدیدترین
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-accent transition-colors mb-2">
                    {latestArticle.title}
                  </h3>
                  <p className="text-gray-custom text-sm line-clamp-2 max-w-2xl">
                    {latestArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-custom">
                    {latestArticle.author && (
                      <span>{latestArticle.author.fullName}</span>
                    )}
                    {latestArticle.createdAt && (
                      <>
                        <span>•</span>
                        <span>{new Date(latestArticle.createdAt).toLocaleDateString("fa-IR")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* لیست مقالات */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1 h-5 gradient-primary rounded-full inline-block" />
            <h2 className="text-lg font-bold text-white">
              {selectedCategory
                ? `مقالات دسته «${activeCategory?.name}»`
                : searchQuery
                ? `نتایج جستجو برای «${searchQuery}»`
                : "همه مقالات"}
            </h2>
            {articles.length > 0 && (
              <span className="text-xs text-gray-custom mr-auto">
                {articles.length} مقاله
              </span>
            )}
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article._id} {...article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🏕️</span>
              <p className="text-gray-custom text-lg mb-2">
                {selectedCategory || searchQuery
                  ? "مقاله‌ای با این شرایط یافت نشد."
                  : "هنوز مقاله‌ای در این بخش منتشر نشده است."}
              </p>
              {(selectedCategory || searchQuery) && (
                <Link
                  href="/action-trip"
                  className="inline-block mt-4 px-4 py-2 text-sm gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity"
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

/** کامپوننت جستجو (کلاینت) */
function ActionTripSearch({ initialValue }: { initialValue: string }) {
  return (
    <section className="mb-8">
      <form action="/action-trip" method="GET" className="relative max-w-xl mx-auto">
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-custom pointer-events-none"
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
          name="search"
          defaultValue={initialValue}
          placeholder="جستجو در مقالات سفر اکشن..."
          className="w-full bg-dark-light border border-white/10 rounded-xl py-3 pr-12 pl-12 text-white placeholder:text-gray-custom focus:outline-none focus:border-accent/50 transition-colors"
        />
        {initialValue && (
          <Link
            href="/action-trip"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-custom hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        )}
      </form>
    </section>
  );
}
