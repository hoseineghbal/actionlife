import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { Article } from '../types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'پیش‌نویس', color: 'bg-yellow-100 text-yellow-800' },
  pending_review: { label: 'در انتظار تایید', color: 'bg-blue-100 text-blue-800' },
  published: { label: 'منتشر شده', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'رد شده', color: 'bg-red-100 text-red-800' },
  archived: { label: 'بایگانی', color: 'bg-gray-100 text-gray-800' },
};

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [sections, setSections] = useState<{ _id: string; name: string; slug: string }[]>([]);

  const loadArticles = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'all' || !filter) {
        params.set('all', 'true');
      } else {
        params.set('status', filter);
      }
      if (search) params.set('search', search);
      if (sectionFilter) params.set('section', sectionFilter);
      if (!filter) params.set('limit', '100');
      
      const res = await api.get<{ articles: Article[]; total: number }>(`/articles?${params.toString()}`);
      setArticles(res.data.articles);
    } catch {
      setError('خطا در دریافت مقالات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get<{ _id: string; name: string; slug: string }[]>('/article-sections/active')
      .then((res) => setSections(res.data))
      .catch(() => {});
    loadArticles();
  }, [filter, search, sectionFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این مقاله اطمینان دارید؟')) return;
    try {
      await api.delete(`/articles/${id}`);
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert('خطا در حذف مقاله');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/articles/${id}/approve`);
      loadArticles();
    } catch {
      alert('خطا در تایید مقاله');
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('دلیل رد مقاله (اختیاری):');
    try {
      await api.put(`/articles/${id}/reject`, { reason });
      loadArticles();
    } catch {
      alert('خطا در رد مقاله');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  const pendingCount = articles.filter((a) => a.status === 'pending_review').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت مقالات</h1>
        <Link
          to="/articles/new"
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors"
        >
          + مقاله جدید
        </Link>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { label: 'همه', value: 'all' },
          { label: `در انتظار تایید (${pendingCount})`, value: 'pending_review' },
          { label: 'منتشر شده', value: 'published' },
          { label: 'پیش‌نویس', value: 'draft' },
          { label: 'رد شده', value: 'rejected' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === f.value
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search & Section Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            placeholder="جستجو در عنوان، خلاصه یا برچسب‌ها..."
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-white"
        >
          <option value="">همه بخش‌ها</option>
          {sections.map((s) => (
            <option key={s.slug} value={s.slug}>{s.name}</option>
          ))}
        </select>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">هیچ مقاله‌ای یافت نشد</p>
          <Link to="/articles/new" className="text-accent hover:underline mt-2 inline-block">
            اولین مقاله را ایجاد کنید
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">عنوان</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">نویسنده</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">بخش</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">وضعیت</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">بازدید</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">تاریخ</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article._id} className={`border-b hover:bg-gray-50 ${article.status === 'pending_review' ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {article.featuredImage && (
                          <img src={article.featuredImage} alt="" className="w-10 h-10 rounded object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{article.title}</p>
                          <p className="text-xs text-gray-500">{article.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {article.author?.fullName || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {sections.find((s) => s.slug === article.section)?.name || article.section}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[article.status]?.color || ''}`}>
                        {STATUS_LABELS[article.status]?.label || article.status}
                      </span>
                      {article.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1">{article.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{article.views}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Link to={`/articles/${article._id}`} className="text-accent hover:text-accent text-sm">ویرایش</Link>
                        {article.status === 'pending_review' && (
                          <>
                            <button onClick={() => handleApprove(article._id)} className="text-green-600 hover:text-green-800 text-sm font-medium">✓ تایید</button>
                            <button onClick={() => handleReject(article._id)} className="text-red-600 hover:text-red-800 text-sm">✗ رد</button>
                          </>
                        )}
                        <button onClick={() => handleDelete(article._id)} className="text-gray-600 hover:text-gray-800 text-sm">حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
