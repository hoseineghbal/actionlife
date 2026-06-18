import type { Metadata } from "next";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, " "),
    description: `مطالعه مقاله ${slug.replace(/-/g, " ")} در وبلاگ اکشن لایف`,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* بردکرامب */}
      <nav className="flex items-center gap-2 text-sm text-gray-custom mb-8">
        <Link href="/" className="hover:text-white transition-colors">خانه</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">وبلاگ</Link>
        <span>/</span>
        <span className="text-white">{slug.replace(/-/g, " ")}</span>
      </nav>

      {/* هدر مقاله */}
      <header className="mb-8">
        <span className="inline-block px-3 py-1 text-xs gradient-primary text-white rounded-md mb-4">
          وبلاگ
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          {slug.replace(/-/g, " ")}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-custom">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span>تیم اکشن لایف</span>
          </div>
          <span>•</span>
          <span>{new Date().toLocaleDateString("fa-IR")}</span>
          <span>•</span>
          <span>۵ دقیقه مطالعه</span>
        </div>
      </header>

      {/* تصویر شاخص */}
      <div className="aspect-video bg-dark-light border border-white/10 rounded-xl mb-8 flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* محتوای مقاله */}
      <div className="prose prose-invert max-w-none">
        <div className="text-gray-custom leading-8 space-y-4">
          <p>
            این یک محتوای نمونه برای صفحه مقاله است. وقتی API بک‌اند متصل شود،
            محتوای واقعی مقالات از دیتابیس بارگذاری خواهد شد.
          </p>
          <p>
            محتوای این مقاله شامل موضوعات مختلف مرتبط با سبک زندگی اکشن از جمله
            طبیعت‌گردی، بقا، ورزش، گیم و سینما می‌باشد. اکشن لایف پلتفرمی جامع
            برای علاقه‌مندان به زندگی فعال و پرماجراست.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">مقدمه</h2>
          <p>
            در دنیای امروز، سبک زندگی فعال و پرماجرا اهمیت بیشتری پیدا کرده است.
            بسیاری از افراد به دنبال راه‌هایی برای خروج از روزمرگی و تجربه هیجان
            و ماجراجویی هستند.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">نتیجه‌گیری</h2>
          <p>
            سبک زندگی اکشن فقط یک سرگرمی نیست، بلکه یک فلسفه زندگی است که به شما
            کمک می‌کند با انرژی بیشتر، سلامتی بهتر و دید وسیع‌تری زندگی کنید.
          </p>
        </div>
      </div>

      {/* تگ‌ها */}
      <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-white/10">
        <span className="text-sm text-gray-custom">تگ‌ها:</span>
        {["سبک زندگی", "اکشن", "طبیعت‌گردی"].map((tag) => (
          <span key={tag} className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-gray-custom">
            {tag}
          </span>
        ))}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: slug.replace(/-/g, " "),
            author: { "@type": "Person", name: "تیم اکشن لایف" },
            publisher: {
              "@type": "Organization",
              name: "Action Life",
            },
          }),
        }}
      />
    </article>
  );
}
