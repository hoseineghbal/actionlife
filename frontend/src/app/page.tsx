import { randomInt } from "node:crypto";
import { getLatestArticles } from "@/lib/api";
import type { Article } from "@/types";
import HeroCta from "@/components/shared/HeroCta";
import HomeShell from "@/components/shared/HomeShell";

export default async function HomePage() {
  const latestArticles = await getLatestArticles(10).catch(() => [] as Article[]);
  const heroImage = randomInt(2) === 0 ? "/hero-bg.jpg" : "/hero-bg2.jpg";

  return (
    <>
      {/* عکس فول‌اسکرین ثابت */}
      <div className="fixed inset-0 -z-10">
        <img src={heroImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/20 to-dark/70" />
      </div>

      <HomeShell latest={latestArticles}>
        {/* هیرو تمام‌صفحه — بدون هدر و فوتر */}
        <section className="relative h-dvh flex flex-col overflow-hidden">
          {/* لوگو */}
          <div className="px-4 md:px-8 pt-5">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Action Life" className="h-16 md:h-20 w-auto drop-shadow-lg" />
              <span className="text-white font-extrabold text-xl md:text-2xl drop-shadow-lg tracking-wide">
                Action Life
              </span>
            </div>
          </div>

          {/* CTA و خبرنامه */}
          <div className="flex-1 flex items-end px-4 md:px-8 pb-8">
            <HeroCta />
          </div>
        </section>
      </HomeShell>

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
