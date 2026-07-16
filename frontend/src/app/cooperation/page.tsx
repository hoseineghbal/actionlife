import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "همکاری با ما",
  description: "فرصت‌های همکاری با اکشن لایف - تولید محتوا، فروش محصولات، آموزش و تدریس",
};

const opportunities = [
  {
    icon: "✍️",
    title: "تولید محتوا",
    description:
      "اگر در زمینه‌های طبیعت‌گردی، بقا، ورزش، گیم یا سینما تخصص دارید، می‌توانید مقالات و محتوای تخصصی خود را در پلتفرم ما منتشر کنید.",
  },
  {
    icon: "🛒",
    title: "فروشگاه",
    description:
      "محصولات دیجیتال خود مانند دوره‌های آموزشی، کتاب‌های الکترونیک، فایل‌های صوتی و تصویری مرتبط با سبک زندگی اکشن را در فروشگاه ما بفروشید.",
  },
  {
    icon: "🎓",
    title: "آموزش و تدریس",
    description:
      "دوره‌های آموزشی آنلاین یا حضوری در حوزه تخصصی خود برگزار کنید و دانش خود را با جامعه اکشن لایف به اشتراک بگذارید.",
  },
  {
    icon: "🤝",
    title: "سرمایه‌گذاری",
    description:
      "اگر به آینده پلتفرم‌های سبک زندگی باور دارید، فرصت‌های سرمایه‌گذاری و مشارکت در توسعه پلتفرم برای شما فراهم است.",
  },
];

const benefits = [
  "دسترسی به جامعه بزرگ کاربران علاقه‌مند به سبک زندگی اکشن",
  "کسب درآمد از فروش محصولات و محتوای دیجیتال",
  "پشتیبانی فنی و بازاریابی توسط تیم اکشن لایف",
  "امکان برندسازی شخصی و رشد حرفه‌ای",
  "همکاری با تیمی پویا و خلاق",
];

export default function CooperationPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 to-dark z-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            همکاری با <span className="text-accent">ما</span>
          </h1>
          <p className="text-lg text-gray-custom leading-8">
            اگر به سبک زندگی اکشن علاقه دارید و می‌خواهید بخشی از این جامعه باشید،
            راه‌های مختلفی برای همکاری با ما وجود دارد.
          </p>
        </div>
      </section>

      {/* Opportunities */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-12">
          فرصت‌های <span className="text-accent">همکاری</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {opportunities.map((item) => (
            <div
              key={item.title}
              className="bg-dark-light border border-white/10 rounded-xl p-6"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-white font-bold mb-2">{item.title}</h3>
              <p className="text-gray-custom text-sm leading-6">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-dark-light border border-white/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-8">
            مزایای <span className="text-accent">همکاری</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-custom">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-dark-light border border-white/10 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            آماده همکاری <span className="text-accent">هستید؟</span>
          </h2>
          <p className="text-gray-custom max-w-2xl mx-auto mb-6 leading-7">
            برای شروع همکاری، کافیست از طریق فرم تماس با ما پیام دهید.
            تیم ما در اسرع وقت با شما ارتباط خواهد گرفت.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 gradient-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            تماس با ما
          </a>
        </div>
      </section>
    </>
  );
}
