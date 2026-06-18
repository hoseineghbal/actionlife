import type { Metadata } from "next";
import ContactForm from "@/components/shared/ContactForm";

export const metadata: Metadata = {
  title: "تماس با ما",
  description:
    "با تیم اکشن لایف در تماس باشید - ارسال پیام، پیشنهاد همکاری و سوالات خود را مطرح کنید",
};

const contactInfo = [
  {
    icon: "📧",
    title: "ایمیل",
    value: "info@actionlife.ir",
    href: "mailto:info@actionlife.ir",
  },
  {
    icon: "📱",
    title: "تلفن",
    value: "۰۲۱-XXXXXXXX",
    href: "tel:+98211234567",
  },
  {
    icon: "📍",
    title: "آدرس",
    value: "تهران، ایران",
    href: "#",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* هدر */}
      <section className="bg-dark-light border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            تماس با <span className="text-primary">ما</span>
          </h1>
          <p className="text-gray-custom max-w-2xl leading-7">
            سوالی دارید؟ پیشنهادی برای همکاری دارید؟ یا فقط می‌خواهید سلام کنید؟ 
            خوشحال می‌شویم از شما بشنویم.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* فرم تماس */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">ارسال پیام</h2>
            <ContactForm />
          </div>

          {/* اطلاعات تماس */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6">اطلاعات تماس</h2>
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="flex items-start gap-4 p-4 bg-dark-light border border-white/10 rounded-xl hover:border-primary/30 transition-colors"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="text-white font-bold text-sm">{item.title}</h3>
                    <p className="text-gray-custom text-sm mt-1" dir="ltr">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* شبکه‌های اجتماعی */}
            <div className="mt-8">
              <h3 className="text-white font-bold mb-4">ما را دنبال کنید</h3>
              <div className="flex flex-wrap gap-3">
                {["اینستاگرام", "تلگرام", "یوتیوب", "آپارات"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-custom hover:text-primary hover:border-primary/30 transition-all"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* نقشه */}
            <div className="mt-8">
              <div className="aspect-video bg-dark-light border border-white/10 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-custom">
                  <span className="text-4xl block mb-2">🗺️</span>
                  <span className="text-sm">نقشه محل دفتر</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "تماس با Action Life",
            url: "https://actionlife.ir/contact",
          }),
        }}
      />
    </>
  );
}
