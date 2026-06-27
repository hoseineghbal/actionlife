import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "اکشن کلاب | جامعه کاربران",
  description: "جامعه کاربران اکشن لایف، انجمن گفتگو و چالش‌های هفتگی",
};

export default function ActionClubPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">👥</span>
        <h1 className="text-3xl md:text-4xl font-black text-white">
          اکشن <span className="text-accent">کلاب</span>
        </h1>
      </div>
      <p className="text-gray-custom max-w-2xl leading-7 mb-8">
        به زودی جامعه کاربران، انجمن گفتگو و چالش‌های هفتگی در این بخش فعال خواهد شد.
      </p>
      <Link href="/" className="text-accent hover:underline text-sm">بازگشت به خانه ←</Link>
    </section>
  );
}
