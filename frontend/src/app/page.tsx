import Link from "next/link";
import SectionCard from "@/components/shared/SectionCard";
import ArticleCard from "@/components/shared/ArticleCard";
import { getLatestArticles } from "@/lib/api";
import type { Article } from "@/types";

const sections = [
  {
    title: "اکشن نما",
    description: "نقد و بررسی فیلم‌ها و سریال‌های اکشن، معرفی آثار جدید و تریلرها",
    href: "/action-cinema",
    icon: "🎬",
    color: "#e63946",
  },
  {
    title: "اکشن گیم",
    description: "نقد بازی‌ها، آموزش و راهنما، معرفی بازی‌های PC، Console و Mobile",
    href: "/action-game",
    icon: "🎮",
    color: "#457b9d",
  },
  {
    title: "اکشن تریپ",
    description: "راهنمای سفر تاکتیکال، آموزش بوشکرفت، سفرنامه‌ها و طبیعت‌گردی",
    href: "/action-trip",
    icon: "🏕️",
    color: "#2a9d8f",
  },
  {
    title: "اکشن فیت",
    description: "تمرینات بدنی، برنامه‌های تمرینی، تغذیه و چالش‌های ورزشی",
    href: "/action-fit",
    icon: "💪",
    color: "#e76f51",
  },
  {
    title: "اکشن مدیا",
    description: "ویدیوها، پادکست‌ها، مصاحبه‌ها و مستندهای اکشن",
    href: "/action-media",
    icon: "📹",
    color: "#f4a261",
  },
  {
    title: "اکشن کلاب",
    description: "جامعه کاربران، انجمن گفتگو، چالش‌ها و رقابت‌های هفتگی",
    href: "/action-club",
    icon: "👥",
    color: "#264653",
  },
];

export default async function HomePage() {
  let latestArticles: Article[] = [];
  try {
    const articles = await getLatestArticles(6);
    latestArticles = articles;
  } catch {
    // API not available, show nothing
  }

  return (
    <>
      {/* هیرو بنر */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-dark z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 animate-fade-in-up">
            زندگی یعنی <span className="text-primary">اکشن</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-custom max-w-2xl mx-auto mb-8 animate-fade-in-up">
            پلتفرم سبک زندگی اکشن - طبیعت‌گردی، بقا، ورزش، گیم، سینما و جامعه کاربران فعال
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up">
            <Link
              href="/blog"
              className="px-8 py-3 gradient-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              شروع کن
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-bold hover:bg-white/20 transition-colors"
            >
              درباره ما
            </Link>
          </div>
        </div>
      </section>

      {/* معرفی برند */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            به <span className="text-primary">Action Life</span> خوش آمدید
          </h2>
          <p className="text-gray-custom max-w-2xl mx-auto leading-7">
            ما در اکشن لایف باور داریم که زندگی فعال، زندگی واقعی است. 
            مأموریت ما الهام‌بخشیدن به شما برای کشف دنیا، چالش خودتان و زیستن با اکشن است.
          </p>
        </div>

        {/* آمارها */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "مقاله و آموزش", value: "۵۰۰+" },
            { label: "کاربر فعال", value: "۱۰,۰۰۰+" },
            { label: "ویدیو", value: "۲۰۰+" },
            { label: "چالش انجام شده", value: "۱,۰۰۰+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-dark-light border border-white/10 rounded-xl">
              <div className="text-2xl md:text-3xl font-black text-primary mb-1">{stat.value}</div>
              <div className="text-gray-custom text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* بخش‌های ویژه */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            بخش‌های <span className="text-primary">اکشن لایف</span>
          </h2>
          <p className="text-gray-custom">هر بخش یک دنیای جدید از ماجراجویی و هیجان</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <SectionCard key={section.href} {...section} />
          ))}
        </div>
      </section>

      {/* آخرین مطالب */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white">
            آخرین <span className="text-primary">مطالب</span>
          </h2>
          <Link
            href="/blog"
            className="text-primary text-sm hover:underline"
          >
            مشاهده همه ←
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestArticles.length > 0 ? (
            latestArticles.map((article) => (
              <ArticleCard key={article._id || article.slug} {...article} />
            ))
          ) : (
            <p className="text-gray-custom col-span-full text-center py-12">
              هنوز مطلبی منتشر نشده است.
            </p>
          )}
        </div>
      </section>

      {/* دعوت به عضویت */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="gradient-primary rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            به جمع اکشن‌کارها بپیوند!
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-6">
            با عضویت در اکشن لایف به محتوای اختصاصی، چالش‌های هفتگی و جامعه کاربران دسترسی پیدا کن.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-3 bg-white text-primary-dark rounded-lg font-bold hover:bg-white/90 transition-colors"
          >
            ثبت نام رایگان
          </Link>
        </div>
      </section>

      {/* JSON-LD برای SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Action Life",
            alternateName: "اکشن لایف",
            url: "https://actionlife.ir",
            description: "پلتفرم سبک زندگی اکشن",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://actionlife.ir/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
