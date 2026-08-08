import { useEffect, useState } from 'react';
import api from '../lib/api';

interface Section {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function Sections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Section | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSections = async () => {
    try {
      const res = await api.get<Section[]>('/article-sections');
      setSections(res.data);
    } catch {
      setError('خطا در دریافت بخش‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setOrder(0);
    setIsActive(true);
    setEditing(null);
    setShowForm(false);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (section: Section) => {
    setName(section.name);
    setSlug(section.slug);
    setDescription(section.description || '');
    setOrder(section.order);
    setIsActive(section.isActive);
    setEditing(section);
    setShowForm(true);
  };

  const generateSlug = (val: string) =>
    val.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editing) {
      setSlug(generateSlug(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = { name, slug, description: description || undefined, order, isActive };

    try {
      if (editing) {
        await api.put(`/article-sections/${editing._id}`, payload);
      } else {
        await api.post('/article-sections', payload);
      }
      resetForm();
      loadSections();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'خطا در ذخیره بخش';
      alert(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این بخش اطمینان دارید؟')) return;
    try {
      await api.delete(`/article-sections/${id}`);
      setSections((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'خطا در حذف بخش');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت بخش‌های مقالات</h1>
        <button
          onClick={openCreate}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
        >
          + بخش جدید
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
            {editing ? 'ویرایش بخش' : 'بخش جدید'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام بخش</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                  placeholder="مثال: وبلاگ"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسلاگ (Slug)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                  placeholder="مثال: blog"
                  required
                  disabled={!!editing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  اسلاگ شناسه یکتای بخش در آدرس URL است. فقط حروف انگلیسی، اعداد و خط تیره مجاز است.
                  پس از ایجاد قابل تغییر نیست.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ترتیب نمایش</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                  min={0}
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">فعال</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات (اختیاری)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                placeholder="توضیح کوتاه برای این بخش..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'در حال ذخیره...' : editing ? 'بروزرسانی' : 'ایجاد'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {sections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">هیچ بخشی تعریف نشده است</p>
          <button onClick={openCreate} className="text-accent hover:underline mt-2 inline-block cursor-pointer">
            اولین بخش را ایجاد کنید
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">نام</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">اسلاگ</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">ترتیب</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">وضعیت</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">تاریخ ایجاد</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{section.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600" dir="ltr">{section.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{section.order}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      section.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {section.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(section.createdAt).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(section)} className="text-accent hover:text-accent text-sm cursor-pointer">ویرایش</button>
                      <button onClick={() => handleDelete(section._id)} className="text-red-600 hover:text-red-800 text-sm cursor-pointer">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
