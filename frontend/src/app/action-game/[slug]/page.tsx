import type { Metadata } from "next";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | اکشن گیم`,
    description: `نقد و بررسی ${slug.replace(/-/g, " ")} در بخش اکشن گیم اکشن لایف`,
  };
}

export default async function GameArticlePage({ params }: Props) {
  const { slug } = await params;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <nav className="flex items-center gap-2 text-sm text-gray-custom mb-8">
        <Link href="/" className="hover:text-white transition-colors">خانه</Link>
        <span>/</span>
        <Link href="/action-game" className="hover:text-white transition-colors">اکشن گیم</Link>
        <span>/</span>
        <span className="text-white">{slug.replace(/-/g, " ")}</span>
      </nav>

      <header className="mb-8">
        <span className="inline-block px-3 py-1 text-xs gradient-primary text-white rounded-md mb-4">
          اکشن گیم 🎮
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          {slug.replace(/-/g, " ")}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-custom">
          <span>تیم اکشن لایف</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString("fa-IR")}</span>
        </div>
      </header>

      <div className="aspect-video bg-dark-light border border-white/10 rounded-xl mb-8 flex items-center justify-center">
        <span className="text-6xl">🎮</span>
      </div>

      <div className="text-gray-custom leading-8 space-y-4">
        <p>
          صفحه نقد و بررسی بازی. با اتصال به API بک‌اند، محتوای واقعی از دیتابیس بارگذاری خواهد شد.
        </p>

        {/* اطلاعات بازی */}
        <div className="bg-dark-light border border-white/10 rounded-xl p-6 my-8">
          <h3 className="text-lg font-bold text-white mb-4">اطلاعات بازی</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-custom">پلتفرم:</span> <span className="text-white">PC, PS5, Xbox</span></div>
            <div><span className="text-gray-custom">ژانر:</span> <span className="text-white">Action, Adventure</span></div>
            <div><span className="text-gray-custom">سازنده:</span> <span className="text-white">---</span></div>
            <div><span className="text-gray-custom">تاریخ انتشار:</span> <span className="text-white">---</span></div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">گیم‌پلی</h2>
        <p>بررسی گیم‌پلی و مکانیک‌های بازی اینجا قرار می‌گیرد.</p>
        <h2 className="text-xl font-bold text-white mt-8 mb-4">گرافیک و صدا</h2>
        <p>بررسی کیفیت گرافیک، طراحی هنری و موسیقی بازی.</p>
        <h2 className="text-xl font-bold text-white mt-8 mb-4">امتیاز نهایی</h2>
        <div className="bg-dark-light border border-white/10 rounded-xl p-6 text-center">
          <div className="text-5xl font-black text-primary mb-2">۹.۰</div>
          <div className="text-sm text-gray-custom">از ۱۰</div>
        </div>
      </div>
    </article>
  );
}
