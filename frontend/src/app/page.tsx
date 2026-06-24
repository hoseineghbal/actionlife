import Link from "next/link";
import ArticleCard from "@/components/shared/ArticleCard";
import { getLatestArticles, getPopularArticles, getFeaturedArticles, getArticles } from "@/lib/api";
import type { Article } from "@/types";

const SECTIONS = [
  { title: "اکشن نما", slug: "action-cinema", icon: "🎬", color: "from-red-600/20 to-transparent" },
  { title: "اکشن گیم", slug: "action-game", icon: "🎮", color: "from-blue-600/20 to-transparent" },
  { title: "اکشن تریپ", slug: "action-trip", icon: "🏕️", color: "from-emerald-600/20 to-transparent" },
  { title: "اکشن فیت", slug: "action-fit", icon: "💪", color: "from-orange-600/20 to-transparent" },
  { title: "وبلاگ", slug: "blog", icon: "📝", color: "from-purple-600/20 to-transparent" },
];

export default async function HomePage() {
  const [latestArticles, featuredArticles, popularArticles, cinemaArticles, gameArticles, tripArticles, fitArticles] =
    await Promise.all([
      getLatestArticles(6).catch(() => [] as Article[]),
      getFeaturedArticles(4).catch(() => [] as Article[]),
      getPopularArticles(6).catch(() => [] as Article[]),
      getArticles({ section: "action-cinema", limit: 3 }).catch(() => ({ articles: [] as Article[], total: 0 })),
      getArticles({ section: "action-game", limit: 3 }).catch(() => ({ articles: [] as Article[], total: 0 })),
      getArticles({ section: "action-trip", limit: 3 }).catch(() => ({ articles: [] as Article[], total: 0 })),
      getArticles({ section: "action-fit", limit: 3 }).catch(() => ({ articles: [] as Article[], total: 0 })),
    ]);

  const sectionArticles: Record<string, Article[]> = {
    "action-cinema": cinemaArticles.articles,
    "action-game": gameArticles.articles,
    "action-trip": tripArticles.articles,
    "action-fit": fitArticles.articles,
  };

  return (
    <>
      {/* Hero - compact */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-dark z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 animate-fade-in-up">
            زندگی یعنی <span className="text-primary">اکشن</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in-up">
            <Link href="/blog" className="px-6 py-2.5 gradient-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity text-sm">آخرین مطالب</Link>
            <Link href="/articles/new" className="px-6 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg font-bold hover:bg-white/20 transition-colors text-sm">ارسال مقاله</Link>
          </div>
        </div>
      </section>

      {/* Featured banner */}
      {featuredArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-yellow-400 text-lg">⭐</span>
            <h2 className="text-xl font-black text-white">مقالات ویژه</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredArticles.slice(0, 4).map((article, i) => (
              <Link
                key={article._id}
                href={`/${article.section === "blog" ? "blog" : article.section}/${article.slug}`}
                className={`group relative rounded-xl overflow-hidden bg-dark-light border border-white/10 hover:border-primary/30 transition-all ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
              >
                <div className={`${i === 0 ? "aspect-video sm:aspect-[2/1]" : "aspect-video"} relative`}>
                  {article.featuredImage ? (
                    <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-dark flex items-center justify-center text-4xl">🎬</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent" />
                  <div className="absolute bottom-0 right-0 left-0 p-4">
                    <span className="inline-block px-2 py-0.5 text-xs gradient-primary text-white rounded-md mb-2">
                      {article.section === "blog" ? "وبلاگ" : article.section === "action-cinema" ? "سینمای اکشن" : article.section === "action-game" ? "بازی اکشن" : article.section === "action-trip" ? "سفر اکشن" : "تناسب اندام"}
                    </span>
                    <h3 className={`text-white font-bold ${i === 0 ? "text-xl" : "text-sm"} leading-tight`}>{article.title}</h3>
                    <p className="text-gray-custom text-xs mt-1 line-clamp-1">{article.excerpt}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Content by sections */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
        {SECTIONS.map((sec) => {
          const articles = sectionArticles[sec.slug] || [];
          const sectionPath = sec.slug === "blog" ? "/blog" : `/${sec.slug}`;
          if (articles.length === 0) return null;

          return (
            <section key={sec.slug}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{sec.icon}</span>
                  <h2 className="text-lg font-black text-white">{sec.title}</h2>
                </div>
                <Link href={sectionPath} className="text-primary text-xs hover:underline">مشاهده همه ←</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.map((article) => (
                  <ArticleCard key={article._id} {...article} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Popular / Most Read */}
      {popularArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-primary text-lg">🔥</span>
            <h2 className="text-xl font-black text-white">پر بازدیدترین</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.slice(0, 6).map((article, i) => (
              <Link
                key={article._id}
                href={`/${article.section === "blog" ? "blog" : article.section}/${article.slug}`}
                className="flex gap-3 bg-dark-light border border-white/10 rounded-xl p-3 hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-dark flex items-center justify-center text-lg">
                  {article.featuredImage ? (
                    <img src={article.featuredImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    "📄"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-primary font-bold">#{i + 1}</span>
                  <h3 className="text-sm text-white font-bold truncate group-hover:text-primary transition-colors">{article.title}</h3>
                  <p className="text-xs text-gray-custom truncate mt-0.5">{article.views} بازدید</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All latest */}
      {latestArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">جدیدترین مقالات</h2>
            <Link href="/blog" className="text-primary text-xs hover:underline">مشاهده همه ←</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestArticles.map((article) => (
              <ArticleCard key={article._id} {...article} />
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebSite",
          name: "Action Life", alternateName: "اکشن لایف",
          url: "https://actionlife.ir",
          description: "پلتفرم سبک زندگی اکشن",
        }),
      }} />
    </>
  );
}
