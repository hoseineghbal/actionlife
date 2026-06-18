import type { Metadata } from "next";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | اکشن نما`,
    description: `نقد و بررسی ${slug.replace(/-/g, " ")} در بخش اکشن نمای اکشن لایف`,
  };
}

export default async function CinemaArticlePage({ params }: Props) {
  const { slug } = await params;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-custom mb-8">
        <Link href="/" className="hover:text-white transition-colors">خانه</Link>
        <span>/</span>
        <Link href="/action-cinema" className="hover:text-white transition-colors">اکشن نما</Link>
        <span>/</span>
        <span className="text-white">{slug.replace(/-/g, " ")}</span>
      </nav>

      <header className="mb-8">
        <span className="inline-block px-3 py-1 text-xs gradient-primary text-white rounded-md mb-4">
          اکشن نما 🎬
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          {slug.replace(/-/g, " ")}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-custom">
          <span>تیم اکشن لایف</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString("fa-IR")}</span>
        </div>
      </header>

      <div className="aspect-video bg-dark-light border border-white/10 rounded-xl mb-8 flex items-center justify-center">
        <span className="text-6xl">🎬</span>
      </div>

      <div className="text-gray-custom leading-8 space-y-4">
        <p>
          این صفحه نقد و بررسی تخصصی فیلم/سریال را نمایش می‌دهد. 
          با اتصال به API بک‌اند، محتوای واقعی از دیتابیس بارگذاری خواهد شد.
        </p>
        <h2 className="text-xl font-bold text-white mt-8 mb-4">خلاصه داستان</h2>
        <p>محتوای خلاصه داستان فیلم/سریال اینجا قرار می‌گیرد.</p>
        <h2 className="text-xl font-bold text-white mt-8 mb-4">نقد تخصصی</h2>
        <p>نقد و بررسی تخصصی فیلم/سریال با جزئیات کامل اینجا قرار می‌گیرد.</p>
        <h2 className="text-xl font-bold text-white mt-8 mb-4">امتیاز نهایی</h2>
        <div className="bg-dark-light border border-white/10 rounded-xl p-6 text-center">
          <div className="text-5xl font-black text-primary mb-2">۸.۵</div>
          <div className="text-sm text-gray-custom">از ۱۰</div>
        </div>
      </div>
    </article>
  );
}
