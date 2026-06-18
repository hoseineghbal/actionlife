import Link from "next/link";

const footerSections = [
  {
    title: "بخش‌ها",
    links: [
      { label: "اکشن نما", href: "/action-cinema" },
      { label: "اکشن گیم", href: "/action-game" },
      { label: "اکشن تریپ", href: "/action-trip" },
      { label: "وبلاگ", href: "/blog" },
    ],
  },
  {
    title: "لینک‌های مفید",
    links: [
      { label: "درباره ما", href: "/about" },
      { label: "تماس با ما", href: "/contact" },
      { label: "قوانین و مقررات", href: "/terms" },
      { label: "حریم خصوصی", href: "/privacy" },
    ],
  },
];

const socialLinks = [
  { label: "اینستاگرام", href: "#", icon: "instagram" },
  { label: "تلگرام", href: "#", icon: "telegram" },
  { label: "یوتیوب", href: "#", icon: "youtube" },
  { label: "آپارات", href: "#", icon: "aparat" },
];

export default function Footer() {
  return (
    <footer className="bg-dark-light border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* معرفی برند */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center font-bold text-white text-lg">
                AL
              </div>
              <span className="text-xl font-bold text-white">Action Life</span>
            </div>
            <p className="text-gray-custom text-sm leading-7">
              پلتفرم سبک زندگی اکشن - مرجع طبیعت‌گردی، بقا، ورزش، گیم و سینمای
              اکشن برای علاقه‌مندان به زندگی فعال و پرماجرا.
            </p>
          </div>

          {/* بخش‌ها */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-bold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-custom text-sm hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* شبکه‌های اجتماعی */}
          <div>
            <h3 className="text-white font-bold mb-4">شبکه‌های اجتماعی</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/5 hover:bg-primary/20 border border-white/10 rounded-lg flex items-center justify-center text-gray-custom hover:text-primary transition-all"
                  aria-label={social.label}
                >
                  <span className="text-xs">{social.label.slice(0, 2)}</span>
                </a>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="text-white text-sm font-bold mb-2">
                عضویت در خبرنامه
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="ایمیل شما..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-custom focus:outline-none focus:border-primary"
                />
                <button className="px-4 py-2 gradient-primary text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
                  عضویت
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* کپی رایت */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-custom text-sm">
            © {new Date().getFullYear()} Action Life - تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}
