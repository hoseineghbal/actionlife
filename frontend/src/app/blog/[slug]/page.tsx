import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/api";
import ImageGallery from "@/components/shared/ImageGallery";
import VideoPlayer from "@/components/shared/VideoPlayer";
import ArticleAttachments from "@/components/shared/ArticleAttachments";

type Props = {
  params: Promise<{ slug: string }>;
};

const SECTION_LABELS: Record<string, { label: string; color: string }> = {
  blog: { label: "وبلاگ", color: "gradient-primary" },
  "action-cinema": { label: "سینمای اکشن", color: "gradient-primary" },
  "action-game": { label: "بازی اکشن", color: "gradient-primary" },
  "action-trip": { label: "سفر اکشن", color: "gradient-primary" },
  "action-fit": { label: "تناسب اندام", color: "gradient-primary" },
  "action-media": { label: "رسانه اکشن", color: "gradient-primary" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    return {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      openGraph: {
        title: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
        images: article.featuredImage ? [{ url: article.featuredImage }] : [],
      },
    };
  } catch {
    return {
      title: "مقاله",
      description: "مطالعه مقاله در اکشن لایف",
    };
  }
}

function readingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 250));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let article;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    notFound();
  }

  const sectionInfo = SECTION_LABELS[article.section] || { label: article.section, color: "gradient-primary" };
  const readTime = readingTime(article.content);

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-custom mb-8">
        <Link href="/" className="hover:text-white transition-colors">خانه</Link>
        <span>/</span>
        <Link href={`/${article.section === 'blog' ? 'blog' : article.section}`} className="hover:text-white transition-colors">
          {sectionInfo.label}
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-[200px]">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-block px-3 py-1 text-xs ${sectionInfo.color} text-white rounded-md`}>
            {sectionInfo.label}
          </span>
          {article.isFeatured && (
            <span className="inline-block px-3 py-1 text-xs bg-yellow-600/20 text-yellow-400 rounded-md">
              ویژه
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-custom">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
              {article.author?.avatar ? (
                <img src={article.author.avatar} alt={article.author.fullName} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <span>{article.author?.fullName || "اکشن لایف"}</span>
          </div>
          <span>•</span>
          <span>{new Date(article.createdAt).toLocaleDateString("fa-IR")}</span>
          <span>•</span>
          <span>{readTime} دقیقه مطالعه</span>
          <span>•</span>
          <span>{article.views} بازدید</span>
        </div>
      </header>

      {/* Featured Image */}
      {article.featuredImage ? (
        <div className="aspect-video rounded-xl overflow-hidden mb-8 border border-white/10">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video bg-dark-light border border-white/10 rounded-xl mb-8 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-invert max-w-none article-content text-gray-custom leading-8"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Image Gallery */}
      {article.gallery && article.gallery.length > 0 && (
        <div className="mt-10 pt-8 border-t border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">گالری تصاویر</h2>
          <ImageGallery images={article.gallery} />
        </div>
      )}

      {/* Videos */}
      {article.videos && article.videos.length > 0 && (
        <div className="mt-10 pt-8 border-t border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">ویدیوها</h2>
          <div className="space-y-6">
            {article.videos
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((video, index) => (
                <VideoPlayer key={index} video={video} />
              ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {article.attachments && article.attachments.length > 0 && (
        <ArticleAttachments attachments={article.attachments} />
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-white/10">
          <span className="text-sm text-gray-custom">تگ‌ها:</span>
          {article.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-gray-custom">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Categories */}
      {article.categories && article.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-gray-custom">دسته‌بندی:</span>
          {article.categories.map((cat: any) => (
            <Link
              key={cat._id}
              href={`/blog?category=${cat.slug}`}
              className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            image: article.featuredImage,
            datePublished: article.createdAt,
            dateModified: article.updatedAt,
            author: {
              "@type": "Person",
              name: article.author?.fullName || "اکشن لایف",
            },
            publisher: {
              "@type": "Organization",
              name: "Action Life",
            },
          }),
        }}
      />
    </article>
  );
}
