import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "راهنمای سایت",
  description: "راهنمای جامع استفاده از پلتفرم اکشن لایف - آشنایی با بخش‌های مختلف سایت و نحوه استفاده از خدمات",
};

const sections = [
  {
    id: "intro",
    title: "معرفی پلتفرم",
    icon: "🎯",
    description: "اکشن لایف پلتفرم جامع سبک زندگی اکشن است که شما را در هر جنبه از یک زندگی فعال همراهی می‌کند.",
    color: "from-blue-500/20 to-blue-600/10",
    items: [
      {
        title: "اکشن لایف چیست؟",
        content: "یک پلتفرم همه‌کاره برای علاقه‌مندان به سبک زندگی فعال و پرماجرا. ما حوزه‌های طبیعت‌گردی، بقا در طبیعت، آمادگی جسمانی، بازی‌های ویدیویی، سینمای اکشن و موارد دیگر را پوشش می‌دهیم. هدف ما ایجاد یک جامعه پویا و الهام‌بخش است.",
      },
      {
        title: "چرا اکشن لایف؟",
        content: "محتوای تخصصی و با کیفیت فارسی، جامعه کاربری فعال، فروشگاه محصولات دیجیتال، سیستم امتیازدهی و سطح‌بندی، و امکان مشارکت کاربران در تولید محتوا از ویژگی‌های منحصربه‌فرد ماست.",
      },
    ],
  },
  {
    id: "getting-started",
    title: "شروع کار",
    icon: "🚀",
    description: "برای شروع، ثبت‌نام کنید و پروفایل خود را تکمیل کنید تا از تمامی امکانات بهره‌مند شوید.",
    color: "from-green-500/20 to-green-600/10",
    items: [
      {
        title: "ثبت‌نام در سایت",
        content: "از طریق دکمه «ورود/ثبت‌نام» در بالای صفحه، با وارد کردن ایمیل و رمز عبور حساب خود را ایجاد کنید. پس از تایید ایمیل، حساب شما فعال می‌شود.",
      },
      {
        title: "تکمیل پروفایل",
        content: "از منوی کاربری وارد بخش «پروفایل» شوید. اطلاعات شخصی، بیوگرافی، تصویر پروفایل، شبکه‌های اجتماعی و اطلاعات بانکی خود را تکمیل کنید تا تجربه بهتری داشته باشید.",
      },
      {
        title: "تنظیمات امنیتی",
        content: "در بخش پروفایل می‌توانید رمز عبور خود را تغییر دهید و امنیت حساب را افزایش دهید. توصیه می‌کنیم از رمز عبور قوی استفاده کنید.",
      },
    ],
  },
  {
    id: "sections",
    title: "بخش‌های اصلی",
    icon: "🧭",
    description: "با بخش‌های مختلف سایت آشنا شوید و از هر کدام به بهترین شکل استفاده کنید.",
    color: "from-purple-500/20 to-purple-600/10",
    items: [
      {
        title: "زندگی اکشن",
        content: "مجموعه مقالات تخصصی در زمینه طبیعت‌گردی، بقا، ورزش، گیم و سینما. می‌توانید مقالات را بر اساس دسته‌بندی فیلتر کنید و مقاله خود را نیز ارسال کنید.",
      },
      {
        title: "فروشگاه",
        content: "محصولات دیجیتال شامل دوره‌های آموزشی، کتاب الکترونیک و فایل‌های چندرسانه‌ای. محصولات را می‌توانید بر اساس دسته‌بندی، قیمت و وضعیت فیلتر کنید.",
      },
      {
        title: "اکشن نما",
        content: "دنیای سینمای اکشن - نقد و بررسی فیلم‌ها، معرفی آثار جدید، مصاحبه با عوامل سینما و مقالات تحلیلی.",
      },
      {
        title: "اکشن گیم",
        content: "پوشش جامع بازی‌های اکشن - نقد و بررسی، راهنما، اخبار و رویدادهای دنیای گیم.",
      },
      {
        title: "اکشن تریپ",
        content: "راهنمای سفرهای ماجراجویانه، طبیعت‌گردی، کمپینگ و تجربیات واقعی از دل طبیعت.",
      },
      {
        title: "اکشن فیت",
        content: "برنامه‌های تمرینی، آموزش حرکات ورزشی، تغذیه سالم و راهنمای آمادگی جسمانی برای سبک زندگی اکشن.",
      },
      {
        title: "اکشن کلاب",
        content: "انجمن گفتگوی کاربران - بحث و تبادل نظر درباره موضوعات مختلف، اشتراک‌گذاری تجربیات و ارتباط با همفکران.",
      },
      {
        title: "اکشن مدیا",
        content: "گالری تصاویر و ویدیوهای مرتبط با سبک زندگی اکشن - اشتراک‌گذاری لحظات به یادماندنی.",
      },
    ],
  },
  {
    id: "user-levels",
    title: "سطح‌بندی کاربران",
    icon: "⭐",
    description: "با فعالیت در سایت سطح خود را ارتقا دهید و به امکانات بیشتری دسترسی پیدا کنید.",
    color: "from-amber-500/20 to-amber-600/10",
    items: [
      {
        title: "نحوه عملکرد سطح‌بندی",
        content: "سیستم سطح‌بندی ما بر اساس ۵ معیار فعالیت محاسبه می‌شود: پروفایل، همکاری، فعالیت، چالش و رشد. با تکمیل پروفایل، ارسال مقاله، مشارکت در انجمن، خرید از فروشگاه و دعوت دوستان امتیاز کسب می‌کنید.",
      },
      {
        title: "سطوح کاربری",
        content: "۵ سطح داریم: Beginner (مبتدی) → Active (فعال) → Committed (متعهد) → Mentor (مربی) → Veteran (پیشکسوت). هر سطح مزایای خاص خود را دارد.",
      },
      {
        title: "مزایای سطوح بالاتر",
        content: "دسترسی به محتوای ویژه (Level-Gated Content)، تخفیف‌های فروشگاه، اولویت در بررسی مقالات، نشان‌های ویژه و قابلیت‌های بیشتر در انجمن.",
      },
    ],
  },
  {
    id: "store-guide",
    title: "راهنمای خرید",
    icon: "💳",
    description: "راهنمای گام‌به‌گام خرید از فروشگاه و مدیریت محصولات خریداری شده.",
    color: "from-red-500/20 to-red-600/10",
    items: [
      {
        title: "جستجو و فیلتر محصولات",
        content: "در فروشگاه می‌توانید محصولات را بر اساس دسته‌بندی، محدوده قیمت، وضعیت (نو، استفاده‌شده، استوک) و ویژگی‌ها (رنگ، سایز و...) فیلتر کنید. با انتخاب یک دسته‌بندی والد، تمام زیرمجموعه‌های آن نیز در نتایج نمایش داده می‌شود.",
      },
      {
        title: "افزودن به سبد خرید",
        content: "پس از انتخاب محصول و ویژگی‌های دلخواه (در صورت وجود)، روی دکمه «افزودن به سبد خرید» کلیک کنید. می‌توانید از آیکون سبد خرید در هدر، محصولات انتخاب شده را مشاهده و مدیریت کنید.",
      },
      {
        title: "پرداخت و دانلود",
        content: "پس از نهایی کردن سبد خرید، به درگاه پرداخت هدایت می‌شوید. پس از پرداخت موفق، محصول بلافاصله در حساب کاربری شما در دسترس قرار می‌گیرد.",
      },
      {
        title: "تاریخچه خرید",
        content: "تمام خریدهای خود را می‌توانید در پروفایل کاربری مشاهده کنید. فاکتورها و لینک‌های دانلود همیشه در دسترس هستند.",
      },
    ],
  },
  {
    id: "communication",
    title: "ارتباط با ما",
    icon: "📬",
    description: "راه‌های ارتباط با تیم پشتیبانی و مدیریت اکشن لایف.",
    color: "from-teal-500/20 to-teal-600/10",
    items: [
      {
        title: "فرم تماس",
        content: "از طریق صفحه «تماس با ما» می‌توانید پیام خود را ارسال کنید. تیم پشتیبانی معمولاً در کمتر از ۲۴ ساعت پاسخ می‌دهد.",
      },
      {
        title: "شبکه‌های اجتماعی",
        content: "ما را در اینستاگرام، تلگرام، یوتیوب، آپارات و توییتر دنبال کنید تا از آخرین اخبار، مقالات و رویدادها مطلع شوید.",
      },
      {
        title: "گزارش مشکل",
        content: "اگر باگ یا مشکل فنی مشاهده کردید، لطفاً از طریق صفحه تماس با ما با ذکر جزئیات کامل گزارش دهید تا تیم فنی در اسرع وقت بررسی کند.",
      },
    ],
  },
];

const quickLinks = [
  { label: "ثبت‌نام", href: "/auth/register" },
  { label: "فروشگاه", href: "/store" },
  { label: "زندگی اکشن", href: "/blog" },
  { label: "تماس با ما", href: "/contact" },
  { label: "پرسش‌های متداول", href: "/faq" },
  { label: "قوانین و مقررات", href: "/terms" },
  { label: "همکاری با ما", href: "/cooperation" },
  { label: "درباره ما", href: "/about" },
];

export default function GuidePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/15 to-dark z-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            راهنمای <span className="text-accent">سایت</span>
          </h1>
          <p className="text-lg text-gray-custom leading-8">
            با بخش‌های مختلف پلتفرم اکشن لایف آشنا شوید و یاد بگیرید چطور
            از تمامی امکانات آن به بهترین شکل استفاده کنید.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-dark-light border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 gradient-primary rounded-full inline-block" />
            دسترسی سریع
          </h2>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-custom hover:text-white hover:border-accent/30 hover:bg-white/10 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Guide Content */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-2xl shrink-0`}>
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {section.title}
                  </h2>
                  <p className="text-gray-custom text-sm mt-1">{section.description}</p>
                </div>
              </div>

              {/* Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-dark-light border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
                  >
                    <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-accent/20 text-accent text-[10px] flex items-center justify-center shrink-0 font-bold">
                        {sectionIndex + 1}.{itemIndex + 1}
                      </span>
                      {item.title}
                    </h3>
                    <p className="text-gray-custom text-xs leading-6">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-dark-light border border-white/10 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            آماده شروع <span className="text-accent">ماجراجویی</span> هستید؟
          </h2>
          <p className="text-gray-custom max-w-2xl mx-auto mb-6 leading-7">
            همین حالا ثبت‌نام کنید و به جامعه اکشن لایف بپیوندید.
            دنیایی از محتوای تخصصی، آموزش و ماجراجویی منتظر شماست.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-block px-8 py-3 gradient-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              ثبت‌نام در سایت
            </Link>
            <Link
              href="/faq"
              className="inline-block px-8 py-3 bg-white/5 border border-white/10 text-gray-custom hover:text-white rounded-lg font-bold hover:border-accent/30 transition-all"
            >
              پرسش‌های متداول
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "راهنمای استفاده از پلتفرم Action Life",
            description: "راهنمای جامع آشنایی با بخش‌های مختلف و نحوه استفاده از خدمات پلتفرم اکشن لایف",
          }),
        }}
      />
    </>
  );
}
