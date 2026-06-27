import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره ما",
  description:
    "با تیم اکشن لایف آشنا شوید - مأموریت، اهداف و چشم‌انداز ما برای ساختن بزرگ‌ترین پلتفرم سبک زندگی اکشن",
};

const values = [
  {
    icon: "🔥",
    title: "اکشن و ماجراجویی",
    description: "ما باور داریم هر روز فرصتی برای یک ماجراجویی جدید است.",
  },
  {
    icon: "🌿",
    title: "طبیعت و بقا",
    description: "ارتباط با طبیعت و یادگیری مهارت‌های بقا بخش جدایی‌ناپذیر سبک زندگی ماست.",
  },
  {
    icon: "💪",
    title: "آمادگی جسمانی",
    description: "بدن قوی پایه یک زندگی فعال و پرماجراست.",
  },
  {
    icon: "🤝",
    title: "جامعه و همکاری",
    description: "قدرت در اتحاد است. جامعه اکشن لایف محلی برای یادگیری و رشد مشترک است.",
  },
];

const team = [
  {
    name: "مدیر محتوا",
    role: "مدیریت و تولید محتوای تخصصی",
    description: "متخصص تولید محتوای دیجیتال و علاقه‌مند به طبیعت‌گردی و سبک زندگی اکشن",
  },
  {
    name: "متخصص بقا و طبیعت‌گردی",
    role: "آموزش بوشکرفت و بقا",
    description: "سال‌ها تجربه در طبیعت‌گردی و آموزش مهارت‌های بقا در ایران و جهان",
  },
  {
    name: "متخصص گیم و سینما",
    role: "نقد و بررسی بازی‌ها و فیلم‌ها",
    description: "نویسنده و منتقد بازی‌های ویدیویی و فیلم‌های اکشن",
  },
  {
    name: "مربی آمادگی جسمانی",
    role: "طراحی برنامه تمرینی",
    description: "مربی ورزش و متخصص آمادگی جسمانی با تمرکز بر فعالیت‌های اکشن",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* هیرو */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 to-dark z-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            درباره <span className="text-accent">Action Life</span>
          </h1>
          <p className="text-lg text-gray-custom leading-8">
            اکشن لایف پلتفرمی است برای کسانی که زندگی فعال و پرماجرا را انتخاب می‌کنند.
            ما اینجاییم تا با محتوای باکیفیت، آموزش‌های تخصصی و یک جامعه فعال، 
            شما را در مسیر زندگی اکشن همراهی کنیم.
          </p>
        </div>
      </section>

      {/* مأموریت */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">
              مأموریت <span className="text-accent">ما</span>
            </h2>
            <p className="text-gray-custom leading-8 mb-4">
              مأموریت ما در اکشن لایف ایجاد بزرگ‌ترین پلتفرم فارسی‌زبان برای سبک زندگی اکشن است.
              ما می‌خواهیم منبعی جامع و قابل اعتماد برای علاقه‌مندان به طبیعت‌گردی، بقا، 
              ورزش، بازی‌های اکشن و سینمای اکشن باشیم.
            </p>
            <p className="text-gray-custom leading-8">
              چشم‌انداز ما ساختن یک جامعه فعال و پویا از انسان‌هایی است که 
              زندگی را با اکشن تجربه می‌کنند و در مسیر رشد و پیشرفت، یکدیگر را همراهی می‌کنند.
            </p>
          </div>
          <div className="bg-dark-light border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">فلسفه برند</h3>
            <blockquote className="text-lg text-accent italic mb-4">
              &ldquo;زندگی کوتاه‌تر از آن است که در آن تماشاگر باشی. بازیکن باش!&rdquo;
            </blockquote>
            <p className="text-gray-custom leading-7">
              ما معتقدیم هر کسی می‌تواند زندگی فعال‌تر و هیجان‌انگیزتری داشته باشد. 
              فقط کافی است اولین قدم را بردارید.
            </p>
          </div>
        </div>
      </section>

      {/* ارزش‌ها */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-12">
          ارزش‌های <span className="text-accent">ما</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-dark-light border border-white/10 rounded-xl p-6 text-center"
            >
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-white font-bold mb-2">{value.title}</h3>
              <p className="text-gray-custom text-sm leading-6">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* تیم */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-12">
          تیم <span className="text-accent">ما</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-dark-light border border-white/10 rounded-xl p-6 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-white font-bold mb-1">{member.name}</h3>
              <p className="text-accent text-sm mb-2">{member.role}</p>
              <p className="text-gray-custom text-sm leading-6">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* همکاری */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-dark-light border border-white/10 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            همکاری با <span className="text-accent">ما</span>
          </h2>
          <p className="text-gray-custom max-w-2xl mx-auto mb-6 leading-7">
            اگر در حوزه‌های طبیعت‌گردی، ورزش، گیم، سینما یا تولید محتوا تخصص دارید
            و علاقه‌مند به همکاری هستید، خوشحال می‌شویم از شما بشنویم.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 gradient-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            ارسال درخواست همکاری
          </a>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Action Life",
            alternateName: "اکشن لایف",
            url: "https://actionlife.ir",
            description: "پلتفرم سبک زندگی اکشن",
          }),
        }}
      />
    </>
  );
}
