import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../lib/api';
import type { Category } from '../types';

interface FlatCategory extends Category {
  parentName?: string;
  level: number;
}

function buildTreeAndFlatten(categories: Category[]): FlatCategory[] {
  const catMap = new Map<string, Category>();
  const parentId = (c: Category): string | null => {
    if (!c.parent) return null;
    return typeof c.parent === 'string' ? c.parent : c.parent._id;
  };
  categories.forEach((c) => catMap.set(c._id, c));

  const childrenMap = new Map<string | null, Category[]>();
  categories.forEach((c) => {
    const pid = parentId(c);
    const arr = childrenMap.get(pid) || [];
    arr.push(c);
    childrenMap.set(pid, arr);
  });

  const sortList = (list: Category[]) =>
    list.sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'fa'));

  const result: FlatCategory[] = [];
  const walk = (parent: string | null, level: number) => {
    const list = childrenMap.get(parent) || [];
    sortList(list).forEach((node) => {
      const pid = parentId(node);
      const parentName = pid ? catMap.get(pid)?.name : undefined;
      result.push({ ...node, parentName, level });
      walk(node._id, level + 1);
    });
  };
  walk(null, 0);
  return result;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [preselectedParent, setPreselectedParent] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParent, setFormParent] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const flatCategories: FlatCategory[] = useMemo(
    () => buildTreeAndFlatten(categories),
    [categories]
  );

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.get<Category[]>('/categories');
      setCategories(res.data);
    } catch {
      setError('خطا در دریافت دسته‌بندی‌ها');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const computeDefaultOrder = (parentId: string | null): number => {
    const siblings = categories.filter((c) => {
      const pid = !c.parent
        ? null
        : typeof c.parent === 'string'
        ? c.parent
        : c.parent._id;
      return pid === parentId;
    });
    const maxOrder = siblings.reduce((m, s) => Math.max(m, s.order || 0), -1);
    return maxOrder + 1;
  };

  const openNew = (parentId?: string) => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormParent(parentId || '');
    setPreselectedParent(parentId || null);
    setFormOrder(computeDefaultOrder(parentId || null));
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormParent(typeof cat.parent === 'string' ? cat.parent : (cat.parent as { _id: string })?._id || '');
    setPreselectedParent(null);
    setFormOrder(cat.order ?? 0);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: formName,
      slug: formSlug,
      description: formDescription || undefined,
      parent: formParent || undefined,
      order: formOrder,
    };
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const msg = error?.response?.data?.message || 'خطا در ذخیره دسته‌بندی';
      alert(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch {
      alert('خطا در حذف دسته‌بندی');
    }
  };

  const generateSlug = (name: string) => {
    if (!editingCategory) {
      setFormSlug(
        name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      );
    }
  };

  const selectableParents = categories.filter(
    (c) => !editingCategory || c._id !== editingCategory._id
  );

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
        <h1 className="text-2xl font-bold text-gray-800">مدیریت دسته‌بندی‌ها</h1>
        <button
          onClick={() => openNew()}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors"
        >
          + دسته‌بندی جدید
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">هیچ دسته‌بندی‌ای یافت نشد</p>
          <button onClick={() => openNew()} className="text-accent hover:underline mt-2 inline-block">
            اولین دسته‌بندی را ایجاد کنید
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">نام</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">اسلاگ</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">والد</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">ترتیب</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">توضیحات</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {flatCategories.map((cat) => (
                  <tr key={cat._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800"
                        style={{ paddingRight: `${16 + cat.level * 28}px` }}>
                      <div className="flex items-center gap-3">
                        {cat.level > 0 && (
                          <span className="text-gray-300 select-none" aria-hidden>
                            {'└─'}
                          </span>
                        )}
                        <span>{cat.name}</span>
                        <button
                          onClick={() => openNew(cat._id)}
                          title="افزودن زیرمجموعه"
                          className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-emerald-500 text-white text-xs hover:bg-emerald-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cat.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cat.parentName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cat.order}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => openEdit(cat)} className="text-accent hover:text-accent text-sm">
                          ویرایش
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-800 text-sm">
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingCategory
                ? 'ویرایش دسته‌بندی'
                : preselectedParent
                ? 'زیرمجموعه جدید'
                : 'دسته‌بندی جدید'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => { setFormName(e.target.value); generateSlug(e.target.value); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسلاگ</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی والد</label>
                <select
                  value={formParent}
                  onChange={(e) => {
                    setFormParent(e.target.value);
                    if (!editingCategory) {
                      setFormOrder(computeDefaultOrder(e.target.value || null));
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                >
                  <option value="">بدون والد (دسته اصلی)</option>
                  {selectableParents.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ترتیب نمایش</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-white bg-accent rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {saving ? 'در حال ذخیره...' : editingCategory ? 'بروزرسانی' : 'ایجاد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
