"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { getCategories, getArticleSections } from "@/lib/api";
import type { GalleryImage, VideoEmbed, ArticleAttachment, Category } from "@/types";

const RichTextEditor = dynamic(() => import("@/components/shared/RichTextEditor"), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function EditArticlePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<{ _id: string; name: string; slug: string }[]>([]);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [section, setSection] = useState('blog');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryUrl, setGalleryUrl] = useState('');
  const [videos, setVideos] = useState<VideoEmbed[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSource, setVideoSource] = useState<'upload' | 'youtube' | 'aparat'>('youtube');
  const [attachments, setAttachments] = useState<ArticleAttachment[]>([]);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    getCategories().then(setCategories).catch(() => {});
    getArticleSections().then(setSections).catch(() => {});
    loadArticle();
  }, [user]);

  const loadArticle = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE}/articles/by-id/${articleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Not found');
      const a = await res.json();
      setTitle(a.title); setSlug(a.slug); setSection(a.section);
      setExcerpt(a.excerpt); setContent(a.content);
      setFeaturedImage(a.featuredImage || '');
      setSelectedCategories(a.categories?.map((c: any) => c._id) || []);
      setTags((a.tags || []).join(', '));
      setGallery(a.gallery || []); setVideos(a.videos || []);
      setAttachments(a.attachments || []);
    } catch {
      setError('خطا در دریافت مقاله');
    } finally { setLoading(false); }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const formData = new FormData(); formData.append('file', file); formData.append('folder', folder);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/upload/file`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      const data = await res.json(); return data.url;
    } catch { return null; }
  };

  const handleFeaturedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await uploadFile(file, 'articles/featured'); if (url) setFeaturedImage(url);
    e.target.value = '';
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append('files', f);
    fd.append('folder', 'articles/gallery');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/upload/images`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const urls = await res.json();
      setGallery(prev => [...prev, ...urls.map((u: any) => ({ url: u.url }))]);
    } catch { /* */ }
    e.target.value = '';
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await uploadFile(file, 'articles/attachments');
    if (url) setAttachments([...attachments, { url, filename: file.name, mimeType: file.type, size: file.size }]);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    const payload = {
      title, slug, section, excerpt, content,
      featuredImage: featuredImage || undefined,
      categories: selectedCategories,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      gallery: gallery.length > 0 ? gallery : undefined,
      videos: videos.length > 0 ? videos : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/articles/${articleId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.message?.[0] || 'خطا در ویرایش');
      }
      router.push('/articles/my');
    } catch (err: any) {
      setError(err.message || 'خطا در ویرایش مقاله');
    } finally { setSaving(false); }
  };

  if (!user || loading) {
    return <section className="max-w-4xl mx-auto px-4 py-24 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto" />
    </section>;
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-8">ویرایش مقاله</h1>
      {error && <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">اطلاعات مقاله</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-custom mb-1">عنوان</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-accent/50 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-custom mb-1">بخش</label>
              <select value={section} onChange={e => setSection(e.target.value)} className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-accent/50 outline-none">
                {sections.map(s => <option key={s._id} value={s.slug}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-custom mb-1">خلاصه</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-accent/50 outline-none resize-none" required />
          </div>
        </div>

        <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">محتوای مقاله</h2>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">تصویر شاخص</h2>
          <div className="flex gap-3">
            <input type="text" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="آدرس تصویر..." className="flex-1 px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-accent/50 outline-none" />
            <label className="px-4 py-3 bg-accent/10 text-accent rounded-lg cursor-pointer hover:bg-accent/20 text-sm whitespace-nowrap">آپلود<input type="file" accept="image/*" className="hidden" onChange={handleFeaturedUpload} /></label>
          </div>
          {featuredImage && <img src={featuredImage} alt="" className="max-h-48 rounded-lg object-cover" />}
        </div>

        <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">گالری تصاویر</h2>
          <div className="flex gap-2">
            <input type="text" value={galleryUrl} onChange={e => setGalleryUrl(e.target.value)} placeholder="آدرس تصویر..." className="flex-1 px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-accent/50 outline-none" />
            <button type="button" onClick={() => { if (galleryUrl) { setGallery([...gallery, { url: galleryUrl }]); setGalleryUrl(''); }}} className="px-4 py-3 bg-accent text-white rounded-lg text-sm">+</button>
          </div>
          <label className="inline-block px-4 py-2 bg-dark border border-white/10 rounded-lg text-gray-custom cursor-pointer hover:text-white text-sm">آپلود چند تصویر<input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} /></label>
          {gallery.length > 0 && <div className="grid grid-cols-4 gap-2">{gallery.map((img, i) => <div key={i} className="relative group"><img src={img.url} alt="" className="w-full h-20 object-cover rounded-lg" /><button type="button" onClick={() => setGallery(gallery.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100">×</button></div>)}</div>}
        </div>

        <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">ویدیوها</h2>
          <div className="flex gap-2">
            <select value={videoSource} onChange={e => setVideoSource(e.target.value as any)} className="px-3 py-3 bg-dark border border-white/10 rounded-lg text-white text-sm"><option value="youtube">یوتیوب</option><option value="aparat">آپارات</option><option value="upload">آپلودی</option></select>
            <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="آدرس..." className="flex-1 px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-accent/50 outline-none" />
            <button type="button" onClick={() => { if (videoUrl) { setVideos([...videos, { url: videoUrl, title: videoTitle || undefined, source: videoSource }]); setVideoUrl(''); setVideoTitle(''); } }} className="px-4 py-3 bg-accent text-white rounded-lg text-sm">+</button>
          </div>
          {videoSource !== 'upload' && <input type="text" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="عنوان (اختیاری)" className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-accent/50 outline-none" />}
          {videos.length > 0 && <div className="space-y-2">{videos.map((v, i) => <div key={i} className="flex justify-between items-center bg-dark rounded-lg px-4 py-2"><span className="text-sm text-gray-custom truncate">{v.title || v.url}</span><button type="button" onClick={() => setVideos(videos.filter((_, j) => j !== i))} className="text-red-400 text-sm">حذف</button></div>)}</div>}
        </div>

        <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">پیوست‌ها</h2>
          <label className="inline-block px-4 py-2 bg-dark border border-white/10 rounded-lg text-gray-custom cursor-pointer hover:text-white text-sm">آپلود فایل<input type="file" className="hidden" onChange={handleAttachmentUpload} /></label>
          {attachments.length > 0 && <div className="space-y-2">{attachments.map((att, i) => <div key={i} className="flex justify-between items-center bg-dark rounded-lg px-4 py-2"><span className="text-sm text-gray-custom">{att.filename}</span><button type="button" onClick={() => setAttachments(attachments.filter((_, j) => j !== i))} className="text-red-400 text-sm">حذف</button></div>)}</div>}
        </div>

        <div className="bg-dark-light border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">دسته‌بندی و برچسب‌ها</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-custom mb-1">دسته‌بندی‌ها</label>
              <div className="max-h-48 overflow-y-auto bg-dark border border-white/10 rounded-lg p-3 space-y-2">
                {categories.map(cat => <label key={cat._id} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={selectedCategories.includes(cat._id)} onChange={e => { if (e.target.checked) setSelectedCategories([...selectedCategories, cat._id]); else setSelectedCategories(selectedCategories.filter(id => id !== cat._id)); }} className="rounded border-gray-500 bg-dark" />{cat.name}</label>)}
                {categories.length === 0 && <p className="text-gray-500 text-sm">دسته‌بندی‌ای نیست</p>}
              </div>
            </div>
            <div><label className="block text-sm text-gray-custom mb-1">برچسب‌ها (با کاما)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="مثال: اکشن, ماجراجویی" className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white focus:border-accent/50 outline-none" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full py-4 gradient-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 text-lg">
          {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
      </form>
    </section>
  );
}
