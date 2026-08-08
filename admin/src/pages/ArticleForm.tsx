import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import RichTextEditor from '../components/RichTextEditor';
import CategorySelector from '../components/CategorySelector';
import type { Article, GalleryImage, VideoEmbed, ArticleAttachment } from '../types';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Section {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [slugManual, setSlugManual] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [section, setSection] = useState('blog');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredImage, setFeaturedImage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Gallery
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryAlt, setGalleryAlt] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');

  // Videos
  const [videos, setVideos] = useState<VideoEmbed[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSource, setVideoSource] = useState<'upload' | 'youtube' | 'aparat'>('youtube');
  const [videoId, setVideoId] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState<ArticleAttachment[]>([]);

  useEffect(() => {
    api.get<Category[]>('/categories').then((res) => setCategories(res.data)).catch(() => {});
    api.get<Section[]>('/article-sections/active').then((res) => {
      setSections(res.data);
      if (res.data.length > 0 && !id) setSection(res.data[0].slug);
    }).catch(() => {});
    if (id) {
      setLoading(true);
      api.get<Article>(`/articles/by-id/${id}`).then((res) => {
        const a = res.data;
        setTitle(a.title);
        setSlug(a.slug);
        setSection(a.section);
        setExcerpt(a.excerpt);
        setContent(a.content);
        setStatus(a.status as 'draft' | 'published');
        setIsFeatured(a.isFeatured);
        setFeaturedImage(a.featuredImage || '');
        setSelectedCategories(a.categories?.map((c: any) => c._id) || []);
        setTags((a.tags || []).join(', '));
        setMetaTitle(a.metaTitle || '');
        setMetaDescription(a.metaDescription || '');
        setGallery(a.gallery || []);
        setVideos(a.videos || []);
        setAttachments(a.attachments || []);
        setSlugManual(true);
      }).catch(() => {
        alert('خطا در دریافت اطلاعات مقاله');
        navigate('/articles');
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      setSlug(generateSlug(val));
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/file`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, 'articles/featured');
    if (url) setFeaturedImage(url);
    e.target.value = '';
  };

  const addGalleryImage = async () => {
    if (galleryUrl) {
      setGallery([...gallery, { url: galleryUrl, alt: galleryAlt, caption: galleryCaption }]);
      setGalleryUrl('');
      setGalleryAlt('');
      setGalleryCaption('');
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append('files', file);
    }
    formData.append('folder', 'articles/gallery');

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const urls = await res.json();
      const newImages = urls.map((u: any) => ({
        url: u.url,
        alt: '',
        caption: '',
        order: gallery.length,
      }));
      setGallery([...gallery, ...newImages]);
    } catch (err) {
      console.error('Gallery upload failed:', err);
    }
    e.target.value = '';
  };

  const addVideo = () => {
    if (!videoUrl) return;
    const video: VideoEmbed = {
      url: videoUrl,
      title: videoTitle || undefined,
      source: videoSource,
      videoId: videoId || undefined,
    };
    setVideos([...videos, video]);
    setVideoUrl('');
    setVideoTitle('');
    setVideoId('');
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const getEmbedUrl = (video: VideoEmbed): string => {
    if (video.source === 'youtube') {
      const v = video.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (v) return `https://www.youtube.com/embed/${v[1]}`;
    }
    if (video.source === 'aparat') {
      const a = video.url.match(/aparat\.com\/v\/([a-zA-Z0-9_-]+)/);
      if (a) return `https://www.aparat.com/video/video/embed/videohash/${a[1]}/vt/frame`;
    }
    return video.url;
  };

  const handleFileAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, 'articles/attachments');
    if (url) {
      setAttachments([
        ...attachments,
        {
          url,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        },
      ]);
    }
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      slug,
      section,
      excerpt,
      content,
      status,
      isFeatured,
      featuredImage: featuredImage || undefined,
      categories: selectedCategories,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      gallery: gallery.length > 0 ? gallery : undefined,
      videos: videos.length > 0 ? videos : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    try {
      if (isEdit) {
        await api.put(`/articles/${id}`, payload);
      } else {
        await api.post('/articles', payload);
      }
      navigate('/articles');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'خطا در ذخیره مقاله';
      alert(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'ویرایش مقاله' : 'مقاله جدید'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">اطلاعات اصلی</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسلاگ (Slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                اسلاگ همان آدرس یکتای مقاله در مرورگر است که به صورت خودکار از عنوان ساخته می‌شود.
                مثال: my-article-title
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">بخش</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
              >
                {sections.map((s) => (
                  <option key={s._id} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشر شده</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="isFeatured" className="text-sm text-gray-700">مقاله ویژه</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">خلاصه</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">تصویر شاخص</h2>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="آدرس تصویر یا آپلود کنید..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <label className="bg-accent/10 text-accent px-4 py-2 rounded-lg cursor-pointer hover:bg-accent/20 transition-colors text-sm">
              آپلود تصویر
              <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} />
            </label>
          </div>
          {featuredImage && (
            <img src={featuredImage} alt="featured" className="max-h-48 rounded-lg object-cover" />
          )}
        </div>

        {/* Content - Rich Text Editor */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">محتوای مقاله</h2>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* Image Gallery */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">گالری تصاویر</h2>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={galleryUrl}
              onChange={(e) => setGalleryUrl(e.target.value)}
              placeholder="آدرس تصویر..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <input
              type="text"
              value={galleryAlt}
              onChange={(e) => setGalleryAlt(e.target.value)}
              placeholder="متن جایگزین"
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <button type="button" onClick={addGalleryImage} className="bg-accent text-white px-3 py-2 rounded-lg text-sm hover:bg-accent">
              افزودن
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm">
              آپلود چند تصویر
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
            </label>
          </div>

          {gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gallery.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img.url} alt={img.alt || ''} className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  {img.caption && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">ویدیوها</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <select
              value={videoSource}
              onChange={(e) => setVideoSource(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="youtube">یوتیوب</option>
              <option value="aparat">آپارات</option>
              <option value="upload">آپلود مستقیم</option>
            </select>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder={videoSource === 'youtube' ? 'آدرس ویدیوی یوتیوب...' : videoSource === 'aparat' ? 'آدرس ویدیوی آپارات...' : 'آدرس ویدیوی آپلود شده...'}
              className="md:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <button type="button" onClick={addVideo} className="bg-accent text-white px-3 py-2 rounded-lg text-sm hover:bg-accent">
              افزودن ویدیو
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="عنوان ویدیو (اختیاری)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            />
            {videoSource !== 'upload' && (
              <input
                type="text"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="شناسه ویدیو (اختیاری)"
                className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              />
            )}
          </div>

          {videos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((v, i) => (
                <div key={i} className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="aspect-video bg-black">
                    <iframe
                      src={getEmbedUrl(v)}
                      title={v.title || 'ویدیو'}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{v.title || 'بدون عنوان'}</p>
                      <span className="text-xs text-gray-500">{v.source === 'youtube' ? 'یوتیوب' : v.source === 'aparat' ? 'آپارات' : 'آپلودی'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(i)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">پیوست‌ها (فایل‌ها)</h2>

          <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm inline-block">
            آپلود فایل (PDF, ZIP, ...)
            <input type="file" className="hidden" onChange={handleFileAttachmentUpload} />
          </label>

          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((att, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">{att.filename}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(att.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories & Tags */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">دسته‌بندی و برچسب‌ها</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی‌ها</label>
              <CategorySelector
                categories={categories}
                selectedIds={selectedCategories}
                onChange={setSelectedCategories}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">برچسب‌ها (با کاما جدا کنید)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="مثال: اکشن, ماجراجویی, ورزشی"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">تنظیمات SEO</h2>
          <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
            این تنظیمات برای بهبود نمایش مقاله در موتورهای جستجو (مانند گوگل) استفاده می‌شود.
            عنوان SEO در نتایج جستجو و تب مرورگر نمایش داده می‌شود.
            توضیحات SEO خلاصه‌ای است که زیر عنوان در نتایج جستجو نشان داده می‌شود.
            اگر این فیلدها را خالی بگذارید، به صورت خودکار از عنوان و خلاصه مقاله استفاده خواهد شد.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان SEO (Meta Title)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="حداکثر ۶۰ کاراکتر توصیه می‌شود"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات SEO (Meta Description)</label>
              <input
                type="text"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="حداکثر ۱۶۰ کاراکتر توصیه می‌شود"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white px-6 py-2.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            {saving ? 'در حال ذخیره...' : isEdit ? 'بروزرسانی مقاله' : 'ایجاد مقاله'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}
