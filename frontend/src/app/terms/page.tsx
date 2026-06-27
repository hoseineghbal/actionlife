import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description:
    "قوانین و مقررات استفاده از پلتفرم اکشن لایف - شرایط استفاده، مسئولیت‌ها و تعهدات کاربران",
};

const sections = [
  {
    title: "قوانین عمومی",
    items: [
      "تمامی کاربران ملزم به رعایت قوانین جمهوری اسلامی ایران در استفاده از این پلتفرم هستند.",
      "هرگونه سوءاستفاده از محتوا، امکانات یا اطلاعات موجود در سایت پیگرد قانونی دارد.",
      "اکشن لایف این حق را دارد که در هر زمان و بدون اطلاع قبلی، قوانین را تغییر دهد.",
      "ثبت‌نام و استفاده از خدمات سایت به معنای پذیرش تمامی قوانین و مقررات است.",
    ],
  },
  {
    title: "ثبت‌نام و حساب کاربری",
    items: [
      "کاربران موظفند اطلاعات صحیح و کامل در هنگام ثبت‌نام ارائه دهند.",
      "مسئولیت حفظ امنیت حساب کاربری و رمز عبور بر عهده کاربر است.",
      "کاربران حق واگذاری حساب کاربری خود به شخص دیگری را ندارند.",
      "در صورت مشاهده هرگونه فعالیت مشکوک، حساب کاربری مسدود خواهد شد.",
      "هر کاربر فقط مجاز به داشتن یک حساب کاربری است.",
    ],
  },
  {
    title: "قوانین محتوا",
    items: [
      "کاربران مجاز به انتشار محتوای مغایر با اخلاق اسلامی و قوانین ایران نیستند.",
      "هرگونه محتوای توهین‌آمیز، خشونت‌بار یا نامناسب حذف خواهد شد.",
      "حق نشر و کپی‌رایت مطالب منتشر شده محفوظ است.",
      "نقل مطالب سایت با ذکر منبع بلامانع است.",
      "نظرات کاربران منعکس‌کننده دیدگاه شخصی آنهاست و مسئولیت آن با خود کاربر است.",
    ],
  },
  {
    title: "قوانین انجمن و نظرات",
    items: [
      "ارسال نظرات حاوی اطلاعات شخصی دیگران ممنوع است.",
      "تبلیغات غیرمجاز و ارسال لینک‌های نامرتبط مجاز نیست.",
      "احترام به نظرات دیگران و پرهیز از بحث‌های غیرسازنده الزامی است.",
      "مدیریت سایت حق ویرایش یا حذف نظرات را دارد.",
    ],
  },
  {
    title: "قوانین خرید و اشتراک",
    items: [
      "هزینه اشتراک‌ها و خدمات بر اساس تعرفه‌های اعلام شده در سایت محاسبه می‌شود.",
      "بازگشت وجه صرفاً طبق شرایط مندرج در بخش بازگشت وجه امکان‌پذیر است.",
      "تعرفه‌ها ممکن است در دوره‌های زمانی مختلف تغییر کنند.",
      "اشتراک‌های خریداری شده غیرقابل انتقال به فرد دیگر است.",
    ],
  },
  {
    title: "مسئولیت‌ها",
    items: [
      "اکشن لایف مسئولیتی در قبال قطعی یا اختلال در سرویس‌دهی ندارد.",
      "مسئولیت استفاده از اطلاعات و محتوای سایت بر عهده کاربر است.",
      "سایت تلاش می‌کند دسترسی پایدار و امن را فراهم کند اما تضمینی در این خصوص نمی‌دهد.",
      "لینک‌های موجود در سایت به معنی تایید محتوای سایت‌های مقصد نیست.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      {/* هدر */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            قوانین و <span className="text-accent">مقررات</span>
          </h1>
          <p className="text-gray-custom leading-7">
            مطالعه و رعایت قوانین و مقررات زیر برای استفاده از خدمات و محتوای
            پلتفرم اکشن لایف الزامی است.
          </p>
        </div>
      </section>

      {/* محتوا */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-10">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-dark-light border border-white/10 rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </span>
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-custom leading-7">
                    <span className="text-accent mt-1.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* اطلاعیه پایانی */}
        <div className="mt-10 bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center">
          <p className="text-gray-custom leading-7">
            آخرین به‌روزرسانی: فروردین ۱۴۰۵
          </p>
          <p className="text-gray-custom text-sm mt-2 leading-7">
            در صورت تغییر در قوانین، موارد جدید در همین صفحه اطلاع‌رسانی خواهد شد.
          </p>
        </div>
      </section>
    </>
  );
}
