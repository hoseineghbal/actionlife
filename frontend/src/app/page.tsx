import Link from "next/link";
import { randomInt } from "node:crypto";
import { getLatestArticles } from "@/lib/api";
import type { Article } from "@/types";
import HeroCta from "@/components/shared/HeroCta";
import Footer from "@/components/layout/Footer";

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomPositions(count: number): { top: string; left: string }[] {
  // Wide gaps ensure cards never overlap — each row at least 15% apart vertically
  const cols = ["2%", "38%", "72%"];
  // 3 rows max — wide vertical gap (~16–18%) prevents any overlap
  const rows = ["3%", "20%", "38%"];
  const positions = rows.slice(0, count).map((top) => ({
    top,
    left: cols[Math.floor(Math.random() * cols.length)],
  }));
  return positions.sort(() => Math.random() - 0.5);
}

function FloatingArticleCard({ article, className }: { article: Article; className?: string }) {
  const href = `/${article.section === "blog" ? "blog" : article.section}/${article.slug}`;
  return (
    <Link
      href={href}
      className={`group block max-w-[200px] md:max-w-[260px] h-[90px] md:h-[110px] rounded-xl border border-white/10 bg-dark/60 backdrop-blur-md p-2 md:p-3 transition-all duration-300 hover:border-accent/40 hover:bg-dark/80 hover:-translate-y-1 ${className ?? ""}`}
    >
      <span className="inline-block px-1.5 py-0.5 text-[9px] md:text-[10px] gradient-primary text-white rounded-md mb-1">
        {article.section === "blog" ? "وبلاگ" : article.section === "action-cinema" ? "سینمای اکشن" : article.section === "action-game" ? "بازی اکشن" : article.section === "action-trip" ? "سفر اکشن" : "تناسب اندام"}
      </span>
      <h3 className="text-[11px] md:text-sm font-bold text-white leading-snug group-hover:text-accent transition-colors line-clamp-2">
        {article.title}
      </h3>

    </Link>
  );
}

export default async function HomePage() {
  const latestArticles = await getLatestArticles(8).catch(() => [] as Article[]);
  const pool = latestArticles.filter((a) => a.title?.trim());
  const randomOverlay = pickRandom(pool, 3);
  const positions = randomPositions(randomOverlay.length);
  const heroImage = randomInt(2) === 0 ? "/hero-bg.jpg" : "/hero-bg2.jpg";

  return (
    <>
      {/* Prevent scroll on this page only */}
      <style>{`
        body { overflow: hidden; }
      `}</style>

      {/* Full-screen landing — image fully visible */}
      <section className="relative h-screen w-screen overflow-hidden bg-dark">
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-contain mx-auto"
        />

        {/* Gentle dark gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/25 via-transparent to-dark/10 pointer-events-none" />

        {/* Floating random articles */}
        {randomOverlay.length > 0 && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {randomOverlay.map((article, i) => (
              <div
                key={article._id}
                className="absolute pointer-events-auto animate-fade-in-up"
                style={{ top: positions[i]?.top, left: positions[i]?.left, animationDelay: `${i * 0.1}s` }}
              >
                <FloatingArticleCard article={article} />
              </div>
            ))}
          </div>
        )}

        {/* CTA buttons — client component handles auth state */}
        <HeroCta />

        {/* Thin footer bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <Footer />
        </div>
      </section>

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
