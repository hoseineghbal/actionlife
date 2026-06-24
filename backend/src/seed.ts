import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';
import { CategoriesService } from './categories/categories.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './categories/schemas/category.schema';
import { Article } from './articles/schemas/article.schema';
import {
  ArticleSection,
  ArticleStatus,
} from './articles/schemas/article.schema';
import { User } from './users/schemas/user.schema';

/**
 * Execute all seed data (admin user, categories, articles).
 * Can be called from main.ts or as a standalone CLI script.
 */
export async function runSeed(app: any) {
  // Get services
  const usersService = app.get(UsersService);
  const categoriesService = app.get(CategoriesService);

  // Get raw models via getModelToken (the correct NestJS way)
  const categoryModel = app.get(
    getModelToken(Category.name),
  ) as Model<Category>;
  const articleModel = app.get(getModelToken(Article.name)) as Model<Article>;

  // 1. Create or find admin user
  const adminEmail = 'admin@actionlife.ir';
  let admin = await usersService.findByEmail(adminEmail);
  if (admin) {
    console.log('✅ ادمین از قبل وجود دارد:', adminEmail);
  } else {
    admin = await usersService.create({
      fullName: 'مدیر سایت',
      email: adminEmail,
      password: 'Admin@1234',
    });
    admin.role = UserRole.ADMIN;
    await admin.save();
    console.log('✅ ادمین ساخته شد:', adminEmail);

    // Create additional users
    const editorUser = await usersService.create({
      fullName: 'سردبیر تیم',
      email: 'editor@actionlife.ir',
      password: 'Editor@1234',
    });
    editorUser.role = UserRole.EDITOR;
    await editorUser.save();
    console.log('✅ سردبیر ساخته شد');

    const authorUser = await usersService.create({
      fullName: 'نویسنده محتوا',
      email: 'author@actionlife.ir',
      password: 'Author@1234',
    });
    authorUser.role = UserRole.AUTHOR;
    await authorUser.save();
    console.log('✅ نویسنده ساخته شد');
  }

  const authorId = admin._id.toString();

  // 2. Define all categories
  const categoryDefs = [
    // --- Blog main categories ---
    {
      name: 'سبک زندگی اکشن',
      slug: 'action-lifestyle',
      description: 'مقالات مرتبط با سبک زندگی فعال و ماجراجویانه',
      order: 1,
    },
    {
      name: 'ترفندها و آموزش‌ها',
      slug: 'tips-tricks',
      description: 'آموزش‌ها و ترفندهای کاربردی برای زندگی اکشن',
      order: 2,
    },
    {
      name: 'دانستنی‌ها',
      slug: 'facts',
      description: 'مطالب علمی و دانستنی‌های جذاب',
      order: 3,
    },
    {
      name: 'اخبار',
      slug: 'news',
      description: 'آخرین اخبار دنیای اکشن',
      order: 4,
    },
    {
      name: 'طبیعت‌گردی',
      slug: 'nature',
      description: 'طبیعت‌گردی و ماجراجویی در دل طبیعت',
      order: 5,
    },
    {
      name: 'گیم',
      slug: 'game',
      description: 'دنیای بازی‌های کامپیوتری و کنسولی',
      order: 6,
    },
    {
      name: 'سینما',
      slug: 'cinema',
      description: 'نقد و بررسی فیلم‌ها و سریال‌ها',
      order: 7,
    },
    {
      name: 'ورزش',
      slug: 'sport',
      description: 'مقالات ورزشی و تناسب اندام',
      order: 8,
    },
    // Blog subcategories
    {
      name: 'تجهیزات کمپینگ',
      slug: 'camping-gear',
      description: 'راهنمای خرید و معرفی تجهیزات کمپینگ',
      parentSlug: 'nature',
      order: 1,
    },
    {
      name: 'مسیرهای طبیعت‌گردی',
      slug: 'hiking-trails',
      description: 'معرفی بهترین مسیرهای طبیعت‌گردی ایران و جهان',
      parentSlug: 'nature',
      order: 2,
    },
    {
      name: 'بقا در طبیعت',
      slug: 'survival',
      description: 'تکنیک‌های بقا در شرایط سخت طبیعی',
      parentSlug: 'nature',
      order: 3,
    },
    {
      name: 'بررسی بازی',
      slug: 'game-review',
      description: 'نقد و بررسی بازی‌های جدید',
      parentSlug: 'game',
      order: 1,
    },
    {
      name: 'راهنمای بازی',
      slug: 'game-guide',
      description: 'راهنماها و واک‌تروهای بازی‌ها',
      parentSlug: 'game',
      order: 2,
    },
    {
      name: 'نقد فیلم',
      slug: 'movie-review',
      description: 'نقد تخصصی فیلم‌های سینمایی',
      parentSlug: 'cinema',
      order: 1,
    },
    {
      name: 'معرفی سریال',
      slug: 'series-review',
      description: 'معرفی و بررسی سریال‌های روز دنیا',
      parentSlug: 'cinema',
      order: 2,
    },
    {
      name: 'ورزش‌های ماجراجویانه',
      slug: 'adventure-sports',
      description: 'ورزش‌های هیجان‌انگیز و ماجراجویانه',
      parentSlug: 'sport',
      order: 1,
    },
    // --- Action Cinema ---
    {
      name: 'اخبار سینما',
      slug: 'cinema-news',
      description: 'آخرین اخبار دنیای سینما',
      order: 1,
    },
    {
      name: 'نقد و بررسی',
      slug: 'cinema-reviews',
      description: 'نقد تخصصی فیلم‌های اکشن',
      order: 2,
    },
    {
      name: 'بیوگرافی',
      slug: 'biographies',
      description: 'زندگینامه بازیگران و کارگردانان',
      order: 3,
    },
    {
      name: 'فیلم‌های برتر',
      slug: 'top-movies',
      description: 'لیست بهترین فیلم‌های اکشن تاریخ',
      order: 4,
    },
    // --- Action Game ---
    {
      name: 'اخبار بازی',
      slug: 'gaming-news',
      description: 'آخرین اخبار دنیای بازی',
      order: 1,
    },
    {
      name: 'معرفی بازی',
      slug: 'game-intros',
      description: 'معرفی بازی‌های جدید و محبوب',
      order: 2,
    },
    {
      name: 'راهنما و آموزش',
      slug: 'game-guides',
      description: 'راهنماهای کامل بازی‌ها',
      order: 3,
    },
    {
      name: 'بررسی سخت‌افزار',
      slug: 'hardware-reviews',
      description: 'بررسی کنسول‌ها، کارت‌های گرافیک و تجهیزات گیمینگ',
      order: 4,
    },
    // --- Action Trip ---
    {
      name: 'مقاصد سفر',
      slug: 'destinations',
      description: 'معرفی بهترین مقاصد سفرهای ماجراجویانه',
      order: 1,
    },
    {
      name: 'راهنمای سفر',
      slug: 'travel-guides',
      description: 'راهنماهای کامل سفر به نقاط مختلف',
      order: 2,
    },
    {
      name: 'تجهیزات سفر',
      slug: 'travel-gear',
      description: 'معرفی تجهیزات ضروری سفر',
      order: 3,
    },
    {
      name: 'تجربیات سفر',
      slug: 'travel-stories',
      description: 'تجربیات واقعی مسافران ماجراجو',
      order: 4,
    },
    // --- Action Fit ---
    {
      name: 'برنامه تمرینی',
      slug: 'workout-plans',
      description: 'برنامه‌های تمرینی هدفمند',
      order: 1,
    },
    {
      name: 'تغذیه ورزشی',
      slug: 'sports-nutrition',
      description: 'راهنمای تغذیه برای ورزشکاران',
      order: 2,
    },
    {
      name: 'حرکات ورزشی',
      slug: 'exercises',
      description: 'آموزش حرکات ورزشی مختلف',
      order: 3,
    },
    {
      name: 'سلامت و روان',
      slug: 'health-mental',
      description: 'سلامت جسم و روان',
      order: 4,
    },
  ];

  // --- Create categories (parent first, then children) ---
  const slugToId = new Map<string, string>();

  // First pass: create parent categories
  for (const def of categoryDefs) {
    if (def.parentSlug) continue; // children will be handled in second pass

    try {
      // Use findOneAndUpdate with upsert to be idempotent
      const doc = await categoryModel.findOneAndUpdate(
        { slug: def.slug },
        {
          $setOnInsert: {
            name: def.name,
            slug: def.slug,
            description: def.description,
            order: def.order,
            isActive: true,
          },
        },
        { upsert: true, returnDocument: 'after' },
      );
      slugToId.set(def.slug, doc._id.toString());
      console.log(`📁 دسته‌بندی "${def.name}" آماده است`);
    } catch (err: any) {
      console.error(`❌ خطا در ایجاد دسته "${def.name}":`, err.message);
    }
  }

  // Second pass: create child categories
  for (const def of categoryDefs) {
    if (!def.parentSlug) continue;

    const parentId = slugToId.get(def.parentSlug);
    if (!parentId) {
      console.log(`⚠️ والد "${def.parentSlug}" برای "${def.name}" یافت نشد`);
      continue;
    }

    try {
      const doc = await categoryModel.findOneAndUpdate(
        { slug: def.slug },
        {
          $setOnInsert: {
            name: def.name,
            slug: def.slug,
            description: def.description,
            parent: parentId,
            order: def.order,
            isActive: true,
          },
        },
        { upsert: true, returnDocument: 'after' },
      );
      slugToId.set(def.slug, doc._id.toString());
      console.log(
        `📁 زیردسته "${def.name}" (والد: ${def.parentSlug}) آماده است`,
      );
    } catch (err: any) {
      console.error(`❌ خطا در ایجاد زیردسته "${def.name}":`, err.message);
    }
  }

  // Helper to get category IDs by slug
  const getCatIds = (...slugs: string[]): string[] => {
    return slugs.map((s) => slugToId.get(s)).filter(Boolean) as string[];
  };

  // --- 3. Define and create articles ---
  const articleDefs = [
    // ===== BLOG =====
    {
      title: 'سبک زندگی اکشن چیست و چگونه آن را شروع کنیم؟',
      slug: 'what-is-action-lifestyle',
      excerpt:
        'آشنایی با مفهوم سبک زندگی اکشن و راه‌های عملی برای شروع این مسیر هیجان‌انگیز به همراه معرفی بهترین فعالیت‌ها',
      metaTitle: 'سبک زندگی اکشن چیست؟ | راهنمای کامل شروع زندگی فعال',
      metaDescription:
        'آشنایی با مفهوم سبک زندگی اکشن، فواید آن برای سلامت جسم و روان، و راه‌های عملی برای شروع این مسیر هیجان‌انگیز با قدم‌های کوچک و ساده',
      content: `<h2>سبک زندگی اکشن چیست؟</h2>
<p>سبک زندگی اکشن (Active Lifestyle) فراتر از یک مد روز است. این یک فلسفه زندگی است که بر اساس حرکت، ماجراجویی، یادگیری مداوم و خروج از منطقه امن بنا شده است. افرادی که سبک زندگی اکشن را انتخاب می‌کنند، به دنبال تجربیات جدید، چالش‌های فیزیکی و ذهنی و زندگی پر از هیجان هستند.</p>
<h2>چرا سبک زندگی اکشن مهم است؟</h2>
<p>زندگی مدرن بسیاری از ما را به سمت کم‌تحرکی و روزمرگی سوق داده است. نشستن پشت میز کار، تماشای تلویزیون و استفاده مداوم از گوشی هوشمند، ما را از طبیعت واقعی زندگی دور کرده است. سبک زندگی اکشن راهی برای بازگشت به ذات واقعی انسان است؛ موجودی که برای حرکت، کشف و ماجراجویی خلق شده است.</p>
<h2>چگونه شروع کنیم؟</h2>
<p>شروع سبک زندگی اکشن نیازی به تجهیزات گران‌قیمت یا آمادگی بدنی بالا ندارد. کافی است با گام‌های کوچک شروع کنید:</p>
<ul>
<li>هر روز ۳۰ دقیقه پیاده‌روی سریع</li>
<li>یک ورزش جدید یاد بگیرید (کوهنوردی، دوچرخه‌سواری، شنا)</li>
<li>آخر هفته‌ها به طبیعت بروید</li>
<li>کمتر از ماشین استفاده کنید</li>
<li>با دوستانتان فعالیت‌های گروهی انجام دهید</li>
</ul>
<h2>فواید سبک زندگی اکشن</h2>
<p>تحقیقات نشان داده است که سبک زندگی فعال علاوه بر فواید جسمی مانند کاهش وزن و بهبود سلامت قلب، فواید روحی قابل توجهی نیز دارد. افزایش اعتماد به نفس، کاهش استرس و اضطراب، بهبود کیفیت خواب و افزایش خلاقیت از جمله این فواید هستند.</p>`,
      section: ArticleSection.BLOG,
      categorySlugs: ['action-lifestyle'],
      tags: ['سبک زندگی', 'اکشن', 'ماجراجویی', 'سلامت', 'ورزش'],
      isFeatured: true,
      featuredImage:
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
          alt: 'ماجراجویی در طبیعت',
          caption: 'یک روز ماجراجویانه در دل طبیعت',
          order: 0,
        },
        {
          url: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800',
          alt: 'کوهنوردی',
          caption: 'کوهنوردی یکی از بهترین فعالیت‌های اکشن',
          order: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800',
          alt: 'دوچرخه‌سواری',
          caption: 'دوچرخه‌سواری در مسیرهای طبیعی',
          order: 2,
        },
      ],
      videos: [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'معرفی سبک زندگی اکشن',
          source: 'youtube',
          order: 0,
        },
      ],
      attachments: [],
    },
    {
      title: '۱۰ عادت روزانه افراد ماجراجو',
      slug: '10-daily-habits-adventurers',
      excerpt:
        'عادت‌هایی که افراد ماجراجو هر روز تمرین می‌کنند و شما هم می‌توانید با تغییرات کوچک در زندگی خود اعمال کنید',
      metaTitle: '۱۰ عادت روزانه افراد ماجراجو | رازهای موفقیت در زندگی فعال',
      metaDescription:
        'با ۱۰ عادت کلیدی افراد ماجراجو آشنا شوید و یاد بگیرید چگونه با تغییرات کوچک در روتین روزانه، زندگی فعال‌تر و پرماجراتری داشته باشید',
      content: `<h2>عادت‌های روزانه افراد ماجراجو</h2>
<p>آیا تا به حال فکر کرده‌اید که چه چیزی افراد ماجراجو را از دیگران متمایز می‌کند؟ راز آنها در عادت‌های روزانه‌شان نهفته است. در این مقاله به ۱۰ عادت کلیدی اشاره می‌کنیم که می‌توانید از امروز شروع کنید.</p>
<ol>
<li><strong>بیدار شدن زودهنگام</strong> - افراد ماجراجو معمولاً سحرخیز هستند و از ساعات اولیه صبح برای برنامه‌ریزی و ورزش استفاده می‌کنند.</li>
<li><strong>ورزش صبحگاهی</strong> - حتی ۱۵ دقیقه ورزش صبحگاهی می‌تواند انرژی کل روز را تأمین کند.</li>
<li><strong>یادگیری روزانه</strong> - هر روز یک مطلب جدید یاد بگیرید، یک کتاب بخوانید یا یک مهارت جدید تمرین کنید.</li>
<li><strong>زمان در طبیعت</strong> - حداقل ۲۰ دقیقه در روز را در فضای باز بگذرانید.</li>
<li><strong>برنامه‌ریزی روزانه</strong> - روز خود را از شب قبل برنامه‌ریزی کنید.</li>
</ol>`,
      section: ArticleSection.BLOG,
      categorySlugs: ['action-lifestyle', 'tips-tricks'],
      tags: ['عادت', 'ماجراجویی', 'توسعه فردی', 'روتین'],
      isFeatured: false,
      featuredImage:
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
      gallery: [],
      videos: [],
      attachments: [],
    },
    {
      title: 'تجهیزات ضروری طبیعت‌گردی برای مبتدیان',
      slug: 'essential-hiking-gear-beginners',
      excerpt:
        'لیست کامل تجهیزاتی که برای اولین سفر طبیعت‌گردی خود نیاز دارید، از کفش مناسب تا کوله‌پشتی و وسایل ایمنی',
      metaTitle: 'تجهیزات ضروری طبیعت‌گردی برای مبتدیان | راهنمای خرید کامل',
      metaDescription:
        'لیست کامل تجهیزات مورد نیاز برای طبیعت‌گردی مبتدیان - از کفش و کوله‌پشتی گرفته تا لباس مناسب و وسایل ایمنی با راهنمای خرید جامع',
      content: `<h2>آماده‌سازی برای اولین سفر طبیعت‌گردی</h2>
<p>طبیعت‌گردی یکی از لذت‌بخش‌ترین فعالیت‌هایی است که می‌توانید تجربه کنید. اما برای شروع، نیاز به تجهیزات مناسب دارید. در این مقاله راهنمای کاملی از تجهیزات ضروری برای مبتدیان ارائه می‌دهیم.</p>
<h2>کفش مناسب</h2>
<p>مهم‌ترین وسیله برای طبیعت‌گردی، کفش مناسب است. کفش شما باید ضد آب، دارای کفی مناسب با عاج‌های عمیق برای جلوگیری از لغزش، و دور قوزک‌دار برای محافظت از مچ پا باشد.</p>
<h2>کوله‌پشتی</h2>
<p>یک کوله‌پشتی ۲۰-۳۰ لیتری برای پیاده‌روی‌های یک روزه مناسب است. برای سفرهای چند روزه به کوله‌پشتی ۵۰-۷۰ لیتری نیاز دارید. کوله‌پشتی باید دارای بندهای کمری و سینه‌ای برای توزیع وزن باشد.</p>
<h2>لباس مناسب</h2>
<p>اصل لایه‌بندی (Layering) را رعایت کنید: لایه اول (نزدیک پوست) از جنس الیاف مصنوعی برای دفع عرق، لایه دوم برای حفظ گرما مانند پشم یا fleece، و لایه سوم ضد آب و باد.</p>`,
      section: ArticleSection.BLOG,
      categorySlugs: ['nature', 'camping-gear'],
      tags: ['طبیعت‌گردی', 'تجهیزات', 'کمپینگ', 'مبتدی'],
      isFeatured: true,
      featuredImage:
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1559521783-1d1599583485?w=800',
          alt: 'کوله‌پشتی کوهنوردی',
          caption: 'کوله‌پشتی مناسب برای طبیعت‌گردی',
          order: 0,
        },
        {
          url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
          alt: 'کفش کوهنوردی',
          caption: 'کفش مناسب طبیعت‌گردی',
          order: 1,
        },
      ],
      videos: [
        {
          url: 'https://youtu.be/dQw4w9WgXcQ',
          title: 'راهنمای خرید تجهیزات طبیعت‌گردی',
          source: 'youtube',
          order: 0,
        },
      ],
      attachments: [
        {
          url: '#',
          filename: 'چک‌لیست تجهیزات طبیعت‌گردی.pdf',
          mimeType: 'application/pdf',
          size: 245000,
        },
        {
          url: '#',
          filename: 'نقشه مسیرهای پیشنهادی.zip',
          mimeType: 'application/zip',
          size: 1800000,
        },
      ],
    },
    {
      title: 'برترین فیلم‌های اکشن سال ۲۰۲۶',
      slug: 'top-action-movies-2026',
      excerpt:
        'معرفی و رتبه‌بندی بهترین فیلم‌های اکشن امسال که حتماً باید ببینید، از دنباله‌های مورد انتظار تا آثار جدید',
      metaTitle: 'برترین فیلم‌های اکشن سال ۲۰۲۶ | لیست کامل فیلم‌های برتر',
      metaDescription:
        'معرفی و رتبه‌بندی بهترین فیلم‌های اکشن سال ۲۰۲۶ - از John Wick 5 تا Mission Impossible و Fury Road 2، فیلم‌هایی که حتماً باید ببینید',
      content: `<h2>بهترین فیلم‌های اکشن ۲۰۲۶</h2>
<p>سال ۲۰۲۶ برای طرفداران فیلم‌های اکشن سال فوق‌العاده‌ای بوده است. از دنباله‌های مورد انتظار گرفته تا آثار جدید و بدیع، امسال فیلم‌های بی‌نظیری به اکران درآمده‌اند.</p>
<h2>۱. John Wick: Chapter 5</h2>
<p>کیانو ریوز بار دیگر در نقش جان ویک بازگشته است. این قسمت با صحنه‌های اکشن نفس‌گیر و طراحی مبارزات خلاقانه، استانداردهای جدیدی تعریف کرده است.</p>
<h2>۲. Mission: Impossible – Final Reckoning</h2>
<p>تام کروز در هشتمین قسمت مأموریت غیرممکن، بار دیگر با بدلکاری‌های خطرناک مخاطبان را شگفت‌زده کرده است.</p>
<h2>۳. Fury Road 2</h2>
<p>دنباله Mad Max: Fury Road با جلوه‌های ویژه خیره‌کننده و داستانی پرکشش، یکی از بهترین فیلم‌های اکشن سال بوده است.</p>`,
      section: ArticleSection.BLOG,
      categorySlugs: ['cinema', 'movie-review'],
      tags: ['فیلم', 'اکشن', 'سینما', '۲۰۲۶', 'برترین'],
      isFeatured: true,
      featuredImage:
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200',
      gallery: [],
      videos: [],
      attachments: [],
    },
    {
      title: 'مقایسه PS5 Pro و Xbox Series X برای گیمرهای اکشن',
      slug: 'ps5-pro-vs-xbox-series-x-action-gamers',
      excerpt:
        'بررسی تخصصی دو کنسول برتر بازار برای بازی‌های اکشن، مقایسه قدرت پردازشی و کتابخانه بازی‌ها',
      metaTitle:
        'مقایسه PS5 Pro و Xbox Series X | کدام برای بازی اکشن بهتر است؟',
      metaDescription:
        'بررسی تخصصی و مقایسه کامل PS5 Pro و Xbox Series X از نظر قدرت پردازشی، SSD، کتابخانه بازی‌ها و تجربه کاربری برای گیمرهای اکشن',
      content: `<h2>نبرد کنسول‌ها در ۲۰۲۶</h2>
<p>رقابت بین سونی و مایکروسافت در نسل نهم کنسول‌ها به اوج خود رسیده است. PS5 Pro و Xbox Series X هر دو با قدرت پردازشی بالا و قابلیت‌های منحصربه‌فرد خود، گزینه‌های جذابی برای گیمرها هستند.</p>
<h2>قدرت پردازشی</h2>
<p>Xbox Series X با ۱۲ ترافلاپس قدرت پردازشی، از نظر اعداد و ارقام قدرتمندتر است. اما PS5 Pro با معماری سفارشی و SSD فوق‌سریع خود، تجربه بارگذاری سریع‌تری ارائه می‌دهد.</p>`,
      section: ArticleSection.BLOG,
      categorySlugs: ['game', 'game-review', 'hardware-reviews'],
      tags: ['PS5', 'Xbox', 'کنسول', 'گیمینگ', 'مقایسه'],
      isFeatured: false,
      featuredImage:
        'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=1200',
      gallery: [],
      videos: [],
      attachments: [],
    },
    {
      title: 'چگونه در خانه تمرین بوشکرفت انجام دهیم؟',
      slug: 'bushcraft-practice-at-home',
      excerpt:
        'تکنیک‌ها و تمرین‌های بوشکرفت که می‌توانید بدون رفتن به طبیعت در خانه یا حیاط خلوت انجام دهید',
      metaTitle:
        'تمرین بوشکرفت در خانه | آموزش مهارت‌های بقا بدون رفتن به طبیعت',
      metaDescription:
        'آموزش تکنیک‌های بوشکرفت و مهارت‌های بقا که می‌توانید در خانه یا حیاط خلوت تمرین کنید - از کار با چاقو تا طناب‌بافی و شناسایی گیاهان',
      content: `<h2>بوشکرفت چیست؟</h2>
<p>بوشکرفت (Bushcraft) به مجموعه مهارت‌های بقا و زندگی در طبیعت گفته می‌شود. از آتش زدن بدون کبریت تا ساخت سرپناه و شناسایی گیاهان خوراکی.</p>
<h2>تمرین‌های داخل خانه</h2>
<p>۱. <strong>کار با چاقو</strong> - می‌توانید روی یک تکه چوب نرم مهارت‌های تراشیدن را تمرین کنید.<br>
۲. <strong>طناب‌بافی</strong> - یادگیری انواع گره‌های کوهنوردی<br>
۳. <strong>شناسایی گیاهان</strong> - با استفاده از کتاب‌ها و اپلیکیشن‌ها</p>`,
      section: ArticleSection.BLOG,
      categorySlugs: ['survival', 'tips-tricks'],
      tags: ['بوشکرفت', 'بقا', 'طبیعت', 'مهارت'],
      isFeatured: false,
      gallery: [],
      videos: [],
      attachments: [],
    },
    // ===== ACTION CINEMA =====
    {
      title: 'بررسی فیلم John Wick 5: بازگشت انتقام‌جو',
      slug: 'john-wick-5-review',
      excerpt:
        'نقد و بررسی کامل فیلم John Wick: Chapter 5 با تحلیل صحنه‌های اکشن، داستان و بازی کیانو ریوز',
      metaTitle:
        'نقد فیلم John Wick 5 | بررسی کامل Chapter 5 با تحلیل صحنه‌های اکشن',
      metaDescription:
        'نقد و بررسی کامل فیلم John Wick: Chapter 5 با تحلیل صحنه‌های اکشن نفس‌گیر، داستان عمیق‌تر و بازی فوق‌العاده کیانو ریوز - امتیاز ۹ از ۱۰',
      content: `<h2>جان ویک بازگشته است</h2>
<p>پس از پایان به ظاهر قطعی در قسمت چهارم، جان ویک به شکلی غیرمنتظره بازگشته است. Chapter 5 نه تنها سطح خشونت و خلاقیت در صحنه‌های اکشن را بالا برده، بلکه داستانی عمیق‌تر و شخصیت‌پردازی بهتری دارد.</p>
<h2>صحنه‌های اکشن</h2>
<p>طراحی مبارزات در این قسمت به اوج خود رسیده است. هر صحنه مبارزه یک اثر هنری واقعی است که با دقت و ظرافت طراحی شده.</p>
<h2>امتیاز: ۹/۱۰</h2>`,
      section: ArticleSection.ACTION_CINEMA,
      categorySlugs: ['cinema-reviews', 'top-movies'],
      tags: ['John Wick', 'فیلم', 'اکشن', 'کیانو ریوز', 'نقد'],
      isFeatured: true,
      featuredImage:
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200',
      gallery: [],
      videos: [],
      attachments: [],
    },
    {
      title: 'بیوگرافی تام کروز: بدلکاری که سینما را متحول کرد',
      slug: 'tom-cruise-biography',
      excerpt:
        'زندگینامه تام کروز، بازیگر و تهیه‌کننده‌ای که با بدلکاری‌های خطرناک استانداردهای جدیدی در سینمای اکشن تعریف کرد',
      metaTitle:
        'بیوگرافی تام کروز | زندگی‌نامه بدلکاری که سینمای اکشن را متحول کرد',
      metaDescription:
        'زندگینامه کامل تام کروز از کودکی تا ستاره جهانی هالیوود - روایت بدلکاری‌های افسانه‌ای در فیلم‌های Mission: Impossible و Top Gun',
      content: `<h2>از کودکی تا ستاره‌ای جهانی</h2>
<p>تام کروز متولد ۱۹۶۲ در سیراکیوز نیویورک است. او از نوجوانی به بازیگری علاقه داشت و در ۱۹ سالگی اولین نقش خود را در Endless Love ایفا کرد. شهرت جهانی او با Top Gun در ۱۹۸۶ آغاز شد.</p>
<h2>بدلکاری‌های افسانه‌ای</h2>
<p>آنچه تام کروز را متمایز می‌کند، تعهد به بدلکاری‌های واقعی است. از پرواز با F-18 در Top Gun تا آویزان شدن از هواپیمای در حال پرواز در Mission: Impossible.</p>`,
      section: ArticleSection.ACTION_CINEMA,
      categorySlugs: ['biographies', 'cinema-news'],
      tags: ['تام کروز', 'بیوگرافی', 'سینما', 'بدلکاری'],
      isFeatured: false,
      featuredImage:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      gallery: [],
      videos: [],
      attachments: [],
    },
    // ===== ACTION GAME =====
    {
      title: 'معرفی بازی GTA 6: همه چیز درباره مورد انتظارترین بازی تاریخ',
      slug: 'gta-6-everything-we-know',
      excerpt:
        'هر آنچه تاکنون از GTA 6 می‌دانیم، از داستان و شخصیت‌ها گرفته تا گرافیک و تاریخ انتشار',
      metaTitle:
        'GTA 6 | همه چیز درباره مورد انتظارترین بازی تاریخ - داستان، گرافیک، تاریخ انتشار',
      metaDescription:
        'هر آنچه تاکنون از GTA 6 می‌دانیم - داستان در وایس سیتی، شخصیت‌های لوسیا و جیسون، گرافیک با موتور RAGE و تاریخ انتشار',
      content: `<h2>بازگشت به وایس سیتی</h2>
<p>پس از سال‌ها انتظار، راکستار گیمز بالاخره از GTA 6 رونمایی کرد. این بازی در وایس سیتی خیالی جریان دارد و داستان دو شخصیت اصلی به نام‌های لوسیا و جیسون را روایت می‌کند.</p>
<h2>آنچه می‌دانیم</h2>
<p>گرافیک بازی با موتور پیشرفته RAGE بازنویسی شده و وعده واقع‌گرایانه‌ترین تجربه GTA را می‌دهد. دنیای بازی از تمام نسخه‌های قبلی بزرگ‌تر است.</p>`,
      section: ArticleSection.ACTION_GAME,
      categorySlugs: ['gaming-news', 'game-intros'],
      tags: ['GTA 6', 'بازی', 'راکستار', 'معرفی'],
      isFeatured: true,
      featuredImage:
        'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200',
      gallery: [],
      videos: [],
      attachments: [],
    },
    {
      title: 'راهنمای کامل بازی Elden Ring: Shadow of the Erdtree',
      slug: 'elden-ring-shadow-erdtree-guide',
      excerpt:
        'راهنمای جامع برای DLC جدید الدرینگ رینگ به همراه نقشه‌ها و استراتژی باس‌ها',
      metaTitle:
        'راهنمای کامل Elden Ring Shadow of the Erdtree | نقشه و استراتژی باس‌ها',
      metaDescription:
        'راهنمای جامع DLC Shadow of the Erdtree بازی Elden Ring - نقشه مناطق جدید، استراتژی شکست باس‌ها، محل آیتم‌ها و نکات کلیدی برای شروع',
      content: `<h2>سرزمین‌های سایه</h2>
<p>Shadow of the Erdtree بزرگترین DLC تاریخ فرام‌سافتور است. این گسترش‌دهنده دنیایی کاملاً جدید با مناطق متنوع و باس‌های چالش‌برانگیز را اضافه می‌کند.</p>
<h2>نکات کلیدی</h2>
<p>قبل از ورود به DLC، اطمینان حاصل کنید شخصیت شما حداقل لول ۱۵۰ است. بهترین سلاح‌ها برای این منطقه اسلحه‌های خون‌ریزی و آتش هستند.</p>`,
      section: ArticleSection.ACTION_GAME,
      categorySlugs: ['game-guides', 'game-review'],
      tags: ['Elden Ring', 'گیم', 'راهنما', 'DLC'],
      isFeatured: false,
      gallery: [],
      videos: [],
      attachments: [],
    },
    // ===== ACTION TRIP =====
    {
      title: 'راهنمای کامل سفر به دبی برای ماجراجویان',
      slug: 'dubai-adventure-travel-guide',
      excerpt:
        'دبی فقط آسمان‌خراش‌ها و خرید نیست. با فعالیت‌های ماجراجویانه دبی آشنا شوید',
      metaTitle:
        'راهنمای سفر به دبی برای ماجراجویان | فعالیت‌های هیجان‌انگیز در دبی',
      metaDescription:
        'دبی فراتر از تجمل - راهنمای کامل فعالیت‌های ماجراجویانه در دبی شامل اسکای‌دایوینگ، آفرود در صحرا، زیپ‌لاین شهری و ورزش‌های هیجانی',
      content: `<h2>دبی فراتر از تجمل</h2>
<p>بسیاری از مردم دبی را با مراکز خرید لوکس می‌شناسند، اما این شهر امکانات فوق‌العاده‌ای برای ماجراجویان دارد. از پاراگلایدر بر فراز ساحل تا آفرود در شن‌های روان.</p>
<h2>فعالیت‌های ماجراجویانه</h2>
<ul>
<li><strong>اسکای‌دایوینگ</strong> - پرش با چتر از ارتفاع ۱۳۰۰۰ پایی</li>
<li><strong>آفرود در صحرا</strong> - رانندگی با ۴×۴ در تپه‌های شنی</li>
<li><strong>زیپ‌لاین</strong> - طولانی‌ترین زیپ‌لاین شهری جهان</li>
</ul>`,
      section: ArticleSection.ACTION_TRIP,
      categorySlugs: ['destinations', 'travel-guides'],
      tags: ['دبی', 'سفر', 'ماجراجویی', 'آفرود'],
      isFeatured: true,
      featuredImage:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200',
      gallery: [],
      videos: [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'تجربه اسکای‌دایوینگ در دبی',
          source: 'youtube',
          order: 0,
        },
      ],
      attachments: [],
    },
    {
      title: 'سفر به کویر مرنجاب: ماجراجویی در قلب کویر ایران',
      slug: 'maranjab-desert-guide',
      excerpt:
        'راهنمای کامل سفر به کویر مرنجاب، از مسیر دسترسی و اقامت تا فعالیت‌های ماجراجویانه',
      metaTitle:
        'سفر به کویر مرنجاب | راهنمای کامل ماجراجویی در قلب کویر ایران',
      metaDescription:
        'راهنمای کامل سفر به کویر مرنجاب - آفرود روی تپه‌های شنی، رصد ستارگان، شترسواری و اقامت در کاروانسرای تاریخی - تجربه بی‌نظیر کویرنوردی',
      content: `<h2>کویر مرنجاب</h2>
<p>کویر مرنجاب در ۵۰ کیلومتری شمال شرق کاشان واقع شده و یکی از محبوب‌ترین مقاصد کویرنوردی ایران است. تپه‌های شنی طلایی، دریاچه نمک و کاروانسرای تاریخی مرنجاب از جاذبه‌های این منطقه هستند.</p>
<h2>فعالیت‌های ماجراجویانه</h2>
<ul>
<li><strong>آفرود</strong> - رانندگی روی تپه‌های شنی</li>
<li><strong>شترسواری</strong> - تجربه سواری با شتر در کویر</li>
<li><strong>رصد ستارگان</strong> - آسمان کویر بهترین مکان برای رصد ستارگان</li>
</ul>`,
      section: ArticleSection.ACTION_TRIP,
      categorySlugs: ['destinations', 'travel-guides', 'travel-stories'],
      tags: ['کویر', 'مرنجاب', 'سفر', 'ایران', 'ماجراجویی'],
      isFeatured: true,
      featuredImage:
        'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200',
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
          alt: 'کویر در شب',
          caption: 'شب پرستاره در کویر',
          order: 0,
        },
        {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          alt: 'تپه‌های شنی',
          caption: 'تپه‌های شنی طلایی',
          order: 1,
        },
      ],
      videos: [],
      attachments: [],
    },
    // ===== ACTION FIT =====
    {
      title: 'برنامه تمرینی ۳۰ روزه برای شروع سبک زندگی فعال',
      slug: '30-day-workout-plan-beginners',
      excerpt:
        'یک برنامه تمرینی ۳۰ روزه کامل برای مبتدیان که به تدریج شما را به یک زندگی فعال عادت می‌دهد',
      metaTitle: 'برنامه تمرینی ۳۰ روزه برای مبتدیان | شروع سبک زندگی فعال',
      metaDescription:
        'یک برنامه تمرینی ۳۰ روزه کامل برای شروع سبک زندگی فعال - هفته به هفته از پیاده‌روی تا HIIT، مناسب برای مبتدیان با هر سطح آمادگی جسمانی',
      content: `<h2>برنامه ۳۰ روزه</h2>
<p>این برنامه برای افرادی طراحی شده که می‌خواهند زندگی فعال را شروع کنند اما نمی‌دانند از کجا شروع کنند.</p>
<h2>هفته اول: عادت‌سازی</h2>
<p>روز ۱-۳: ۲۰ دقیقه پیاده‌روی سریع<br>
روز ۴-۵: ۱۵ دقیقه حرکات کششی + ۲۰ دقیقه پیاده‌روی<br>
روز ۶-۷: استراحت یا یوگای سبک</p>`,
      section: ArticleSection.ACTION_FIT,
      categorySlugs: ['workout-plans', 'exercises'],
      tags: ['تمرین', 'برنامه', 'مبتدی', 'فیتنس', 'سلامت'],
      isFeatured: true,
      featuredImage:
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200',
      gallery: [],
      videos: [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'تمرین کامل ۲۰ دقیقه‌ای',
          source: 'youtube',
          order: 0,
        },
      ],
      attachments: [
        {
          url: '#',
          filename: 'برنامه تمرینی ۳۰ روزه.pdf',
          mimeType: 'application/pdf',
          size: 520000,
        },
      ],
    },
    {
      title: 'تغذیه مناسب برای ورزشکاران ماجراجو',
      slug: 'nutrition-for-adventure-athletes',
      excerpt:
        'راهنمای تغذیه برای افرادی که سبک زندگی فعال دارند و نیاز به انرژی بالا دارند',
      metaTitle:
        'تغذیه مناسب برای ورزشکاران ماجراجو | راهنمای کامل تغذیه فعالان',
      metaDescription:
        'راهنمای تغذیه برای افراد با سبک زندگی فعال - اصول پایه تغذیه شامل کربوهیدرات‌های پیچیده، پروتئین با کیفیت، چربی‌های سالم و آبرسانی مناسب',
      content: `<h2>تغذیه در ماجراجویی</h2>
<p>تغذیه مناسب یکی از ارکان اصلی سبک زندگی فعال است. بدون مواد مغذی مناسب، بدن نمی‌تواند انرژی لازم برای فعالیت‌های طولانی را تأمین کند.</p>
<h2>اصول پایه</h2>
<p>۱. <strong>کربوهیدرات‌های پیچیده</strong> - نان سبوس‌دار، برنج قهوه‌ای، جو دوسر<br>
۲. <strong>پروتئین با کیفیت</strong> - گوشت کم چرب، مرغ، ماهی، تخم مرغ، حبوبات<br>
۳. <strong>چربی‌های سالم</strong> - آووکادو، مغزها، روغن زیتون</p>`,
      section: ArticleSection.ACTION_FIT,
      categorySlugs: ['sports-nutrition'],
      tags: ['تغذیه', 'ورزش', 'سلامت', 'انرژی'],
      isFeatured: false,
      gallery: [],
      videos: [],
      attachments: [],
    },
  ];

  // --- Create articles using upsert by slug ---
  let articleCount = 0;
  for (const def of articleDefs) {
    const categoryIds = getCatIds(...def.categorySlugs);
    const articleData: any = {
      title: def.title,
      slug: def.slug,
      excerpt: def.excerpt,
      content: def.content,
      section: def.section,
      categories: categoryIds.length > 0 ? categoryIds : undefined,
      tags: def.tags,
      status: ArticleStatus.PUBLISHED,
      isFeatured: def.isFeatured,
      featuredImage: def.featuredImage || undefined,
      metaTitle: (def as any).metaTitle || undefined,
      metaDescription: (def as any).metaDescription || undefined,
      author: authorId,
    };

    // Add optional media arrays
    if (def.gallery.length > 0) articleData.gallery = def.gallery;
    if (def.videos.length > 0) articleData.videos = def.videos;
    if (def.attachments.length > 0) articleData.attachments = def.attachments;

    try {
      await articleModel.findOneAndUpdate(
        { slug: def.slug },
        { $setOnInsert: articleData },
        { upsert: true, returnDocument: 'after' },
      );
      articleCount++;
      console.log(
        `📄 "${def.title}" ایجاد شد` +
          (def.gallery.length > 0 ? ` 🖼️${def.gallery.length}` : '') +
          (def.videos.length > 0 ? ` 🎬${def.videos.length}` : '') +
          (def.attachments.length > 0 ? ` 📎${def.attachments.length}` : ''),
      );
    } catch (err: any) {
      if (err.code === 11000) {
        console.log(`⏩ "${def.title}" از قبل وجود دارد`);
        articleCount++;
      } else {
        console.error(`❌ خطا در ایجاد "${def.title}":`, err.message);
      }
    }
  }

  console.log('\n========================================');
  console.log('🎉 سید با موفقیت کامل شد!');
  console.log(`📁 ${categoryDefs.length} دسته‌بندی`);
  console.log(`📄 ${articleCount} مقاله`);
  console.log('========================================\n');
}

/**
 * Standalone CLI entry point: `npm run seed`
 */
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await runSeed(app);
  await app.close();
}

seed().catch((err) => {
  console.error('❌ خطای غیرمنتظره:', err);
  process.exit(1);
});
