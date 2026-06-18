import type { Metadata } from "next";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | اکشن تریپ`,
    description: `${slug.replace(/-/g, " ")} - آموزش و راهنمای طبیعت‌گردی و بقا در اکشن لایف`,
  };
}

export default async function TripArticlePage({ params }: Props) {
  const { slug } = await params;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-custom mb-8">
        <Link href="/" className="hover:text-white transition-colors">خانه</Link>
        <span>/</span>
        <Link href="/action-trip" className="hover:text-white transition-colors">اکشن تریپ</Link>
        <span>/</span>
        <span className="text-white">{slug.replace(/-/g, " ")}</span>
      </nav>

      <header className="mb-8">
        <span className="inline-block px-3 py-1 text-xs gradient-primary text-white rounded-md mb-4">
          اکشن تریپ 🏕️
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
        <span className="text-6xl">🏕️</span>
      </div>

      <div className="text-gray-custom leading-8 space-y-4">
        <p>
          صفحه مقاله/آموزش طبیعت‌گردی و بقا. با اتصال به API بک‌اند، محتوای واقعی بارگذاری خواهد شد.
        </p>

        {/* اطلاعات سفر/آموزش */}
        <div className="bg-dark-light border border-white/10 rounded-xl p-6 my-8">
          <h3 className="text-lg font-bold text-white mb-4">اطلاعات</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-custom">نوع:</span> <span className="text-white">آموزش بقا</span></div>
            <div><span className="text-gray-custom">سطح:</span> <span className="text-white">مبتدی تا متوسط</span></div>
            <div><span className="text-gray-custom">منطقه:</span> <span className="text-white">ایران</span></div>
            <div><span className="text-gray-custom">مدت:</span> <span className="text-white">۱۰ دقیقه مطالعه</span></div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">مقدمه</h2>
        <p>محتوای مقاله طبیعت‌گردی و بقا اینجا قرار می‌گیرد.</p>
        <h2 className="text-xl font-bold text-white mt-8 mb-4">نکات مهم</h2>
        <p>نکات و ترفندهای مهم برای بقا و طبیعت‌گردی.</p>
      </div>

      <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-white/10">
        <span className="text-sm text-gray-custom">تگ‌ها:</span>
        {["بقا", "طبیعت‌گردی", "بوشکرفت", "کمپینگ"].map((tag) => (
          <span key={tag} className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-gray-custom">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
