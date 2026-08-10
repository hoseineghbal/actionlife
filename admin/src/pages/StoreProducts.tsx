"use client";

import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { StoreProduct, ProductCondition, ProductVariant, ProductType } from '../types';
import { PRODUCT_CONDITION_OPTIONS, PRODUCT_TYPE_OPTIONS } from '../types';

export default function StoreProducts() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [detailProduct, setDetailProduct] = useState<StoreProduct | null>(null);
  const [, setDetailLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; title: string; fileType: string } | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [sort, setSort] = useState('newest');
  const limit = 20;

  // Inventory & Condition edit state
  const [invForm, setInvForm] = useState<{
    condition: ProductCondition;
    productType: ProductType;
    stockQuantity: string;
    sku: string;
    weight: string;
    trackInventory: boolean;
  }>({ condition: 'new', productType: 'physical', stockQuantity: '0', sku: '', weight: '', trackInventory: true });
  const [savingInventory, setSavingInventory] = useState(false);
  const [inventorySaved, setInventorySaved] = useState(false);

  // Variant management state
  const [variantsDraft, setVariantsDraft] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState<{
    variantId: string;
    name: string;
    valuesStr: string;
    quantity: string;
    priceDiff: string;
    isActive: boolean;
  }>({ variantId: '', name: '', valuesStr: '', quantity: '0', priceDiff: '0', isActive: true });
  const [savingVariants, setSavingVariants] = useState(false);
  const [variantsSaved, setVariantsSaved] = useState(false);

  // Discount management state
  const [discountForm, setDiscountForm] = useState<{
    discountPrice: string;
    startDate: string;
    endDate: string;
  }>({ discountPrice: '', startDate: '', endDate: '' });
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [discountSuccess, setDiscountSuccess] = useState(false);

  // Create product state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    category: '',
    productType: 'physical' as ProductType,
    condition: 'new' as ProductCondition,
    stockQuantity: '',
    sku: '',
    weight: '',
  });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createVariants, setCreateVariants] = useState<ProductVariant[]>([]);
  const [newCreateVariant, setNewCreateVariant] = useState({
    variantId: '',
    name: '',
    valuesStr: '',
    quantity: '0',
    priceDiff: '0',
    isActive: true,
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (conditionFilter !== 'all') params.set('condition', conditionFilter);
    if (sort) params.set('sort', sort);

    api
      .get(`/store/admin/products?${params.toString()}`)
      .then((res) => {
        setProducts(res.data.products);
        setTotal(res.data.total);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, conditionFilter, sort]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/store/admin/products/${id}/status`, { status });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status } : p)),
      );
      if (detailProduct && detailProduct._id === id) {
        setDetailProduct((prev) => prev ? { ...prev, status } : null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در تغییر وضعیت');
    }
  };

  const handleViewDetail = async (id: string) => {
    setDetailLoading(true);
    setMessageText('');
    setMessageSent(false);
    setInventorySaved(false);
    setVariantsSaved(false);
    try {
      const res = await api.get(`/store/admin/products/${id}`);
      const pd: StoreProduct = res.data;
      setDetailProduct(pd);
      setInvForm({
        condition: pd.condition || 'new',
        productType: pd.productType || 'physical',
        stockQuantity: String(pd.stockQuantity ?? 0),
        sku: pd.sku ?? '',
        weight: pd.weight != null ? String(pd.weight) : '',
        trackInventory: pd.trackInventory !== false,
      });
      setVariantsDraft(Array.isArray(pd.variants) ? pd.variants.map((v) => ({ ...v })) : []);
      setNewVariant({ variantId: '', name: '', valuesStr: '', quantity: '0', priceDiff: '0', isActive: true });
    } catch {
      alert('خطا در دریافت جزییات محصول');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveInventory = async () => {
    if (!detailProduct) return;
    setSavingInventory(true);
    setInventorySaved(false);
    try {
      const stockQty = Number(invForm.stockQuantity);
      const payload = {
        condition: invForm.condition,
        productType: invForm.productType,
        stockQuantity: isNaN(stockQty) ? 0 : Math.max(0, stockQty),
        sku: invForm.sku.trim() || undefined,
        weight: invForm.weight !== '' && !isNaN(Number(invForm.weight)) ? Number(invForm.weight) : undefined,
        trackInventory: invForm.trackInventory,
      };
      const res = await api.put(`/store/products/${detailProduct._id}`, payload);
      setDetailProduct(res.data);
      setProducts((prev) => prev.map((p) => (p._id === detailProduct._id ? { ...p, ...payload } : p)));
      setInventorySaved(true);
      setTimeout(() => setInventorySaved(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در ذخیره اطلاعات محصول');
    } finally {
      setSavingInventory(false);
    }
  };

  const handleAddVariant = () => {
    if (!newVariant.variantId.trim() || !newVariant.name.trim()) {
      alert('شناسه و نام گزینه را وارد کنید');
      return;
    }
    const qty = Number(newVariant.quantity);
    const priceDiff = Number(newVariant.priceDiff);
    const variant: ProductVariant = {
      variantId: newVariant.variantId.trim(),
      name: newVariant.name.trim(),
      values: newVariant.valuesStr
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter(Boolean),
      quantity: isNaN(qty) ? 0 : Math.max(0, qty),
      priceDiff: isNaN(priceDiff) ? 0 : priceDiff,
      isActive: newVariant.isActive,
    };
    setVariantsDraft((prev) => [...prev, variant]);
    setNewVariant({ variantId: '', name: '', valuesStr: '', quantity: '0', priceDiff: '0', isActive: true });
  };

  const handleRemoveVariant = (idx: number) => {
    if (!confirm('حذف این گزینه؟')) return;
    setVariantsDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  // Create variant helpers
  const handleAddCreateVariant = () => {
    if (!newCreateVariant.variantId.trim() || !newCreateVariant.name.trim()) {
      alert('شناسه و نام گزینه را وارد کنید');
      return;
    }
    const qty = Number(newCreateVariant.quantity);
    const priceDiff = Number(newCreateVariant.priceDiff);
    const variant: ProductVariant = {
      variantId: newCreateVariant.variantId.trim(),
      name: newCreateVariant.name.trim(),
      values: newCreateVariant.valuesStr
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter(Boolean),
      quantity: isNaN(qty) ? 0 : Math.max(0, qty),
      priceDiff: isNaN(priceDiff) ? 0 : priceDiff,
      isActive: newCreateVariant.isActive,
    };
    setCreateVariants((prev) => [...prev, variant]);
    setNewCreateVariant({ variantId: '', name: '', valuesStr: '', quantity: '0', priceDiff: '0', isActive: true });
  };

  const handleRemoveCreateVariant = (idx: number) => {
    setCreateVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateVariantField = (idx: number, field: keyof ProductVariant, value: any) => {
    setVariantsDraft((prev) => {
      const next = prev.map((v, i) => (i === idx ? { ...v } : v));
      (next[idx] as any)[field] = value;
      return next;
    });
  };

  const handleSaveVariants = async () => {
    if (!detailProduct) return;
    setSavingVariants(true);
    setVariantsSaved(false);
    try {
      const variants = variantsDraft.map((v) => ({
        variantId: v.variantId,
        name: v.name,
        values: v.values,
        quantity: Number(v.quantity) || 0,
        priceDiff: Number(v.priceDiff) || 0,
        isActive: v.isActive !== false,
      }));
      const res = await api.put(`/store/products/${detailProduct._id}`, { variants });
      setDetailProduct(res.data);
      setVariantsSaved(true);
      setTimeout(() => setVariantsSaved(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در ذخیره گزینه‌ها');
    } finally {
      setSavingVariants(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending || !detailProduct) return;
    const sellerId = typeof detailProduct.seller === 'object' ? detailProduct.seller._id : null;
    if (!sellerId) return;
    setSending(true);
    try {
      await api.post('/tickets/admin/create', {
        userId: sellerId,
        subject: `پیام ادمین درباره محصول: ${detailProduct.title}`,
        message: messageText.trim(),
      });
      setMessageSent(true);
      setMessageText('');
    } catch {
      alert('خطا در ارسال پیام');
    } finally {
      setSending(false);
    }
  };

  const handleSaveDiscounts = async () => {
    if (!detailProduct) return;
    if (!discountForm.discountPrice || !discountForm.startDate || !discountForm.endDate) {
      alert('لطفا قیمت تخفیف، تاریخ شروع و تاریخ پایان را وارد کنید');
      return;
    }
    const price = Number(discountForm.discountPrice);
    if (isNaN(price) || price <= 0 || price >= detailProduct.price) {
      alert('قیمت تخفیف باید عددی مثبت و کمتر از قیمت اصلی باشد');
      return;
    }

    setSavingDiscount(true);
    setDiscountSuccess(false);
    try {
      const startDate = new Date(discountForm.startDate).toISOString();
      const endDate = new Date(discountForm.endDate).toISOString();

      const currentDiscounts = detailProduct.discounts || [];
      const newDiscounts = [
        ...currentDiscounts,
        { discountPrice: price, startDate, endDate },
      ];

      const res = await api.put(`/store/products/${detailProduct._id}/discounts`, {
        discounts: newDiscounts,
      });
      setDetailProduct(res.data);
      setDiscountSuccess(true);
      setDiscountForm({ discountPrice: '', startDate: '', endDate: '' });
      setTimeout(() => setDiscountSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در ذخیره تخفیف');
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleRemoveDiscount = async (index: number) => {
    if (!detailProduct) return;
    if (!confirm('آیا از حذف این تخفیف اطمینان دارید؟')) return;

    const updatedDiscounts = (detailProduct.discounts || []).filter((_, i) => i !== index);
    try {
      const res = await api.put(`/store/products/${detailProduct._id}/discounts`, {
        discounts: updatedDiscounts,
      });
      setDetailProduct(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در حذف تخفیف');
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await api.get(`/store/admin/products/${id}`);
      const pd: StoreProduct = res.data;
      setCreateForm({
        title: pd.title,
        slug: pd.slug,
        description: pd.description || '',
        price: String(pd.price),
        category: (typeof pd.category === 'object' && pd.category ? (pd.category as { _id: string })._id : (pd.category as string)) || '',
        productType: pd.productType || 'physical',
        condition: pd.condition || 'new',
        stockQuantity: String(pd.stockQuantity ?? 0),
        sku: pd.sku ?? '',
        weight: pd.weight != null ? String(pd.weight) : '',
      });
      setCreateVariants(Array.isArray(pd.variants) ? pd.variants.map((v) => ({ ...v })) : []);
      setNewCreateVariant({ variantId: '', name: '', valuesStr: '', quantity: '0', priceDiff: '0', isActive: true });
      setEditingId(id);
      setShowCreate(true);
    } catch {
      alert('خطا در دریافت اطلاعات محصول');
    }
  };

  const handleCreateProduct = async () => {
    if (!createForm.title.trim() || !createForm.slug.trim() || !createForm.price) {
      alert('عنوان، اسلاگ و قیمت الزامی هستند');
      return;
    }
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        title: createForm.title.trim(),
        slug: createForm.slug.trim(),
        description: createForm.description.trim() || undefined,
        price: Number(createForm.price),
        category: createForm.category || undefined,
        productType: createForm.productType,
        condition: createForm.condition,
      };
      if (!editingId) {
        payload.status = 'published';
      }
      if (createForm.productType === 'physical') {
        payload.stockQuantity = createForm.stockQuantity ? Number(createForm.stockQuantity) : 0;
        payload.sku = createForm.sku.trim() || undefined;
        payload.weight = createForm.weight ? Number(createForm.weight) : undefined;
        if (createVariants.length > 0) {
          payload.variants = createVariants.map((v) => ({
            variantId: v.variantId,
            name: v.name,
            values: v.values,
            quantity: Number(v.quantity) || 0,
            priceDiff: Number(v.priceDiff) || 0,
            isActive: v.isActive !== false,
          }));
        } else {
          payload.variants = [];
        }
      }
      if (editingId) {
        await api.put(`/store/products/${editingId}`, payload);
      } else {
        await api.post('/store/products', payload);
      }
      // Reset
      setShowCreate(false);
      setEditingId(null);
      setCreateForm({ title: '', slug: '', description: '', price: '', category: '', productType: 'physical', condition: 'new', stockQuantity: '', sku: '', weight: '' });
      setCreateVariants([]);
      setNewCreateVariant({ variantId: '', name: '', valuesStr: '', quantity: '0', priceDiff: '0', isActive: true });
      // Refresh list
      const refreshParams = new URLSearchParams();
      refreshParams.set('page', String(page));
      refreshParams.set('limit', String(limit));
      if (search) refreshParams.set('search', search);
      if (statusFilter !== 'all') refreshParams.set('status', statusFilter);
      if (conditionFilter !== 'all') refreshParams.set('condition', conditionFilter);
      if (sort) refreshParams.set('sort', sort);
      const res = await api.get(`/store/admin/products?${refreshParams.toString()}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch (err: any) {
      alert(err.response?.data?.message || (editingId ? 'خطا در ویرایش محصول' : 'خطا در ساخت محصول'));
    } finally {
      setCreating(false);
    }
  };

  const formatJalaliDateTime = (isoString: string) => {
    const d = new Date(isoString);
    const datePart = d.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timePart = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${timePart}`;
  };

  const totalPages = Math.ceil(total / limit);
  const formatPrice = (p: number) => new Intl.NumberFormat('fa-IR').format(p);

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      published: { bg: 'bg-green-100', text: 'text-green-800', label: 'منتشر شده' },
      pending: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'در انتظار تایید' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'پیش‌نویس' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'رد شده' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'آرشیو' },
    };
    const s = map[status] || map.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  const fileTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      image: '🖼️',
      video: '🎬',
      audio: '🎵',
      pdf: '📄',
    };
    return icons[type] || '📁';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">محصولات فروشگاه</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} محصول</span>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            محصول جدید
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="جستجو در عنوان، اسلاگ، توضیحات یا کد محصول..."
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-white"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="pending">در انتظار تایید</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
          <option value="rejected">رد شده</option>
          <option value="archived">آرشیو</option>
        </select>

        {/* Condition Filter */}
        <select
          value={conditionFilter}
          onChange={(e) => { setConditionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-white"
        >
          <option value="all">همه وضعیت‌های محصول</option>
          {PRODUCT_CONDITION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-white"
        >
          <option value="newest">جدیدترین</option>
          <option value="oldest">قدیمی‌ترین</option>
          <option value="price_asc">قیمت: کم به زیاد</option>
          <option value="price_desc">قیمت: زیاد به کم</option>
          <option value="sales_asc">فروش: کم به زیاد</option>
          <option value="sales_desc">فروش: زیاد به کم</option>
          <option value="title_asc">عنوان: الف تا ی</option>
          <option value="title_desc">عنوان: ی تا الف</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">محصول</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">فروشنده</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">وضعیت کالا</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">موجودی</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">قیمت</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">فروش</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">وضعیت</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const conditionMeta = PRODUCT_CONDITION_OPTIONS.find((o) => o.value === (product.condition || 'new'));
                  const variantStock = Array.isArray(product.variants) && product.variants.length > 0
                    ? product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0)
                    : null;
                  const totalStock = variantStock != null ? variantStock : (product.stockQuantity ?? 0);
                  return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                          {product.coverImage ? (
                            <img src={product.coverImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{product.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400" dir="ltr">/{product.slug}</span>
                            {product.sku && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded" dir="ltr">{product.sku}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">
                        {typeof product.seller === 'object' ? product.seller?.fullName : '---'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {conditionMeta && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${conditionMeta.bg} ${conditionMeta.color} border`}>
                          {conditionMeta.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {variantStock != null ? (
                          <div>
                            <p className={`font-medium ${totalStock === 0 ? 'text-red-500' : totalStock <= 5 ? 'text-orange-500' : 'text-gray-800'}`}>
                              {totalStock} عدد
                            </p>
                            <p className="text-[10px] text-gray-400">{Array.isArray(product.variants) ? product.variants.length : 0} گزینه</p>
                          </div>
                        ) : (
                          <p className={`font-medium ${totalStock === 0 ? 'text-red-500' : totalStock <= 5 ? 'text-orange-500' : 'text-gray-800'}`}>
                            {totalStock === 0 ? 'ناموجود' : `${totalStock} عدد`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {product.discountPrice > 0 ? (
                          <>
                            <span className="font-medium text-green-600">{formatPrice(product.discountPrice)}</span>
                            <span className="text-gray-400 line-through text-xs mr-2">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="font-medium text-gray-800">{formatPrice(product.price)}</span>
                        )}
                        <span className="text-xs text-gray-400 mr-1">توکن</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.salesCount}</td>
                    <td className="px-4 py-3">{statusBadge(product.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleEdit(product._id)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleViewDetail(product._id)}
                          className="px-3 py-1 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded-lg transition-colors"
                        >
                          جزئیات
                        </button>
                        {product.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(product._id, 'published')}
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                            >
                              تایید
                            </button>
                            <button
                              onClick={() => handleStatusChange(product._id, 'rejected')}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                            >
                              رد
                            </button>
                          </>
                        )}
                        {product.status === 'published' && (
                          <button
                            onClick={() => handleStatusChange(product._id, 'archived')}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            آرشیو
                          </button>
                        )}
                        {product.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(product._id, 'published')}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                          >
                            انتشار
                          </button>
                        )}
                        {(product.status === 'archived' || product.status === 'rejected') && (
                          <button
                            onClick={() => handleStatusChange(product._id, 'draft')}
                            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition-colors"
                          >
                            پیش‌نویس
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border rounded-lg text-sm disabled:opacity-30"
              >
                قبلی
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                صفحه {page} از {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border rounded-lg text-sm disabled:opacity-30"
              >
                بعدی
              </button>
            </div>
          )}
        </>
      )}

      {/* Product Detail Modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailProduct(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">جزئیات محصول</h2>
              <button
                onClick={() => setDetailProduct(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Cover Image */}
              {detailProduct.coverImage && (
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={detailProduct.coverImage}
                    alt={detailProduct.title}
                    className="w-full max-h-64 object-contain"
                  />
                </div>
              )}

              {/* Title & Slug */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{detailProduct.title}</h3>
                <p className="text-sm text-gray-400 dir-ltr mt-1">/{detailProduct.slug}</p>
              </div>

              {/* Status & Price Row */}
              <div className="flex items-center gap-4 flex-wrap">
                {statusBadge(detailProduct.status)}
                <div className="text-lg font-bold text-gray-800">
                  {detailProduct.discountPrice > 0 ? (
                    <span className="flex items-center gap-2">
                      <span className="text-green-600">{formatPrice(detailProduct.discountPrice)}</span>
                      <span className="text-gray-300 line-through text-base">{formatPrice(detailProduct.price)}</span>
                    </span>
                  ) : (
                    <span>{formatPrice(detailProduct.price)}</span>
                  )}
                  <span className="text-sm text-gray-400 mr-1 font-normal">توکن</span>
                </div>
              </div>

              {/* Description */}
              {detailProduct.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">توضیحات</h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{detailProduct.description}</p>
                </div>
              )}

              {/* Excerpt */}
              {detailProduct.excerpt && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">خلاصه</h4>
                  <p className="text-sm text-gray-500">{detailProduct.excerpt}</p>
                </div>
              )}

              {/* Category */}
              {detailProduct.category && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">دسته‌بندی</h4>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    {typeof detailProduct.category === 'object' ? detailProduct.category.name : detailProduct.category}
                  </span>
                </div>
              )}

              {/* Tags */}
              {detailProduct.tags && detailProduct.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">برچسب‌ها</h4>
                  <div className="flex flex-wrap gap-2">
                    {detailProduct.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-accent/5 text-accent rounded-lg text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Files with Preview */}
              {detailProduct.files && detailProduct.files.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">فایل‌ها ({detailProduct.files.length})</h4>
                  <div className="space-y-2">
                    {detailProduct.files.map((file, i) => (
                      <div key={i}>
                        <div
                          onClick={() => setPreviewFile({ url: file.url, title: file.title, fileType: file.fileType })}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-lg shrink-0">{fileTypeIcon(file.fileType)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-700 truncate">{file.title}</p>
                            {file.description && <p className="text-xs text-gray-400 truncate">{file.description}</p>}
                          </div>
                          <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-200 rounded">{file.fileType}</span>
                        </div>

                        {/* Inline Preview */}
                        {previewFile?.url === file.url && (
                          <div className="mt-2 bg-black/5 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-100">
                              <span className="text-xs font-medium text-gray-600 truncate">{file.title}</span>
                              <div className="flex gap-2">
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-accent hover:underline"
                                >
                                  باز کردن در تب جدید
                                </a>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setPreviewFile(null); }}
                                  className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                  بستن
                                </button>
                              </div>
                            </div>
                            <div className="p-2 flex justify-center">
                              {file.fileType === 'image' && (
                                <img src={file.url} alt={file.title} className="max-w-full max-h-80 object-contain rounded" />
                              )}
                              {file.fileType === 'video' && (
                                <video controls className="max-w-full max-h-80 rounded">
                                  <source src={file.url} />
                                  مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                                </video>
                              )}
                              {file.fileType === 'audio' && (
                                <audio controls className="w-full max-w-md">
                                  <source src={file.url} />
                                  مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
                                </audio>
                              )}
                              {file.fileType === 'pdf' && (
                                <iframe
                                  src={file.url}
                                  title={file.title}
                                  className="w-full h-80 rounded border border-gray-200"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory & Condition Management */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    موجودی و وضعیت محصول
                  </h4>
                  {inventorySaved && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ذخیره شد
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">وضعیت کالا</label>
                    <select
                      value={invForm.condition}
                      onChange={(e) => setInvForm((f) => ({ ...f, condition: e.target.value as ProductCondition }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                    >
                      {PRODUCT_CONDITION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">نوع محصول</label>
                    <select
                      value={invForm.productType}
                      onChange={(e) => setInvForm((f) => ({ ...f, productType: e.target.value as ProductType }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                    >
                      {PRODUCT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {invForm.productType === 'physical' && (
                  <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">موجودی کلی (عدد)</label>
                    <input
                      type="number"
                      min="0"
                      value={invForm.stockQuantity}
                      onChange={(e) => setInvForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white dir-ltr text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">کد محصول (SKU)</label>
                    <input
                      type="text"
                      value={invForm.sku}
                      onChange={(e) => setInvForm((f) => ({ ...f, sku: e.target.value }))}
                      placeholder="مثل SKU-001"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white dir-ltr text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">وزن (کیلوگرم)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={invForm.weight}
                      onChange={(e) => setInvForm((f) => ({ ...f, weight: e.target.value }))}
                      placeholder="مثل 1.5"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white dir-ltr text-left"
                    />
                  </div>
                  </>
                  )}
                </div>
                {invForm.productType === 'physical' && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={invForm.trackInventory}
                    onChange={(e) => setInvForm((f) => ({ ...f, trackInventory: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  پیگیری موجودی در سفارشات فعال باشد
                </label>
                )}
                <div className="pt-1 flex justify-start">
                  <button
                    onClick={handleSaveInventory}
                    disabled={savingInventory}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {savingInventory ? 'در حال ذخیره...' : 'ذخیره اطلاعات محصول'}
                  </button>
                </div>
              </div>

              {/* Variants Management - only for physical products */}
              {invForm.productType === 'physical' && (
              <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    گزینه‌های محصول (رنگ، سایز، مدل و...)
                  </h4>
                  {variantsSaved && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ذخیره شد
                    </span>
                  )}
                </div>

                {/* Add new variant row */}
                <div className="p-3 border border-dashed border-gray-300 rounded-lg bg-white space-y-3">
                  <p className="text-xs text-gray-500">افزودن گزینه جدید:</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">شناسه (انگلیسی)</label>
                      <input
                        type="text"
                        value={newVariant.variantId}
                        onChange={(e) => setNewVariant((v) => ({ ...v, variantId: e.target.value }))}
                        placeholder="مثل color"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-accent dir-ltr text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">نام گزینه</label>
                      <input
                        type="text"
                        value={newVariant.name}
                        onChange={(e) => setNewVariant((v) => ({ ...v, name: e.target.value }))}
                        placeholder="مثل رنگ"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">مقادیر (با ویرگول)</label>
                      <input
                        type="text"
                        value={newVariant.valuesStr}
                        onChange={(e) => setNewVariant((v) => ({ ...v, valuesStr: e.target.value }))}
                        placeholder="مثل قرمز,آبی"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">تعداد</label>
                      <input
                        type="number"
                        min="0"
                        value={newVariant.quantity}
                        onChange={(e) => setNewVariant((v) => ({ ...v, quantity: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-accent dir-ltr text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">تفاوت قیمت (توکن)</label>
                      <input
                        type="number"
                        value={newVariant.priceDiff}
                        onChange={(e) => setNewVariant((v) => ({ ...v, priceDiff: e.target.value }))}
                        placeholder="0=بدون تغییر"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-accent dir-ltr text-left"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newVariant.isActive}
                        onChange={(e) => setNewVariant((v) => ({ ...v, isActive: e.target.checked }))}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-accent focus:ring-accent"
                      />
                      فعال
                    </label>
                    <button
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded text-xs font-medium transition-colors"
                    >
                      + افزودن به لیست
                    </button>
                  </div>
                </div>

                {/* Existing variants list */}
                {variantsDraft.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400 bg-white rounded-lg border border-gray-100">
                    هنوز گزینه‌ای تعریف نشده است.
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-right text-gray-600 font-medium">شناسه / نام</th>
                          <th className="px-3 py-2 text-right text-gray-600 font-medium">مقادیر</th>
                          <th className="px-3 py-2 text-right text-gray-600 font-medium">تعداد</th>
                          <th className="px-3 py-2 text-right text-gray-600 font-medium">تفاوت قیمت</th>
                          <th className="px-3 py-2 text-right text-gray-600 font-medium">وضعیت</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {variantsDraft.map((v, idx) => (
                          <tr key={`${v.variantId}-${idx}`}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={v.variantId}
                                onChange={(e) => handleUpdateVariantField(idx, 'variantId', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-[11px] dir-ltr text-left focus:outline-none focus:border-accent"
                              />
                              <input
                                type="text"
                                value={v.name}
                                onChange={(e) => handleUpdateVariantField(idx, 'name', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-[11px] mt-1 focus:outline-none focus:border-accent"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={v.values.join(', ')}
                                onChange={(e) => handleUpdateVariantField(
                                  idx,
                                  'values',
                                  e.target.value.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
                                )}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-[11px] focus:outline-none focus:border-accent"
                              />
                            </td>
                            <td className="px-3 py-2 w-20">
                              <input
                                type="number"
                                min="0"
                                value={String(v.quantity)}
                                onChange={(e) => handleUpdateVariantField(idx, 'quantity', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-[11px] dir-ltr text-left focus:outline-none focus:border-accent"
                              />
                            </td>
                            <td className="px-3 py-2 w-24">
                              <input
                                type="number"
                                value={String(v.priceDiff ?? 0)}
                                onChange={(e) => handleUpdateVariantField(idx, 'priceDiff', Number(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-[11px] dir-ltr text-left focus:outline-none focus:border-accent"
                              />
                            </td>
                            <td className="px-3 py-2 w-20">
                              <label className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={v.isActive !== false}
                                  onChange={(e) => handleUpdateVariantField(idx, 'isActive', e.target.checked)}
                                  className="w-3.5 h-3.5 rounded border-gray-300 text-accent focus:ring-accent"
                                />
                                {v.isActive !== false ? 'فعال' : 'غیرفعال'}
                              </label>
                            </td>
                            <td className="px-3 py-2 w-12">
                              <button
                                onClick={() => handleRemoveVariant(idx)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                                title="حذف"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="pt-1 flex justify-start">
                  <button
                    onClick={handleSaveVariants}
                    disabled={savingVariants}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {savingVariants ? 'در حال ذخیره...' : 'ذخیره گزینه‌ها'}
                  </button>
                </div>
              </div>
              )}

              {/* Seller Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">فروشنده</h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {typeof detailProduct.seller === 'object' && detailProduct.seller?.avatar ? (
                    <img src={detailProduct.seller.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                      {typeof detailProduct.seller === 'object'
                        ? (detailProduct.seller?.fullName || '?')[0]
                        : '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {typeof detailProduct.seller === 'object' ? detailProduct.seller?.fullName : '---'}
                    </p>
                    {typeof detailProduct.seller === 'object' && detailProduct.seller?.mobile && (
                      <p className="text-xs text-gray-400 dir-ltr">{detailProduct.seller.mobile}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Message to Seller */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">ارسال پیام به فروشنده</h4>
                {messageSent ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    پیام با موفقیت ارسال شد.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="پیام خود را درباره این محصول به فروشنده بنویسید..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-none bg-gray-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !messageText.trim()}
                      className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {sending ? 'در حال ارسال...' : 'ارسال پیام'}
                    </button>
                  </div>
                )}
              </div>

              {/* Discount Management */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">مدیریت تخفیف‌های زمان‌دار</h4>
                
                {/* Active Discounts List */}
                {(detailProduct.discounts && detailProduct.discounts.length > 0) && (
                  <div className="mb-4 space-y-2">
                    <p className="text-xs text-gray-500">تخفیف‌های ثبت شده:</p>
                    {detailProduct.discounts.map((d, i) => {
                      const now = new Date();
                      const isActive = now >= new Date(d.startDate) && now <= new Date(d.endDate);
                      return (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-lg text-sm ${isActive ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                          <div>
                            <span className="font-bold text-green-600">{formatPrice(d.discountPrice)} توکن</span>
                            <span className="text-gray-500 mr-3 text-xs">
                              {formatJalaliDateTime(d.startDate)} تا {formatJalaliDateTime(d.endDate)}
                            </span>
                            {isActive && <span className="mr-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">فعال</span>}
                          </div>
                          <button
                            onClick={() => handleRemoveDiscount(i)}
                            className="text-red-500 hover:text-red-700 text-xs shrink-0"
                          >
                            حذف
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add New Discount Form */}
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-3">
                  <p className="text-xs font-medium text-accent mb-2">افزودن تخفیف جدید</p>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">قیمت با تخفیف (توکن)</label>
                    <input
                      type="number"
                      value={discountForm.discountPrice}
                      onChange={(e) => setDiscountForm((prev) => ({ ...prev, discountPrice: e.target.value }))}
                      placeholder={`کمتر از ${formatPrice(detailProduct.price)}`}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">تاریخ و ساعت شروع</label>
                      <input
                        type="datetime-local"
                        value={discountForm.startDate}
                        onChange={(e) => setDiscountForm((prev) => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">تاریخ و ساعت پایان</label>
                      <input
                        type="datetime-local"
                        value={discountForm.endDate}
                        onChange={(e) => setDiscountForm((prev) => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                      />
                    </div>
                  </div>

                  {discountSuccess && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 text-center">
                      تخفیف با موفقیت ثبت شد
                    </div>
                  )}

                  <button
                    onClick={handleSaveDiscounts}
                    disabled={savingDiscount}
                    className="w-full px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {savingDiscount ? 'در حال ذخیره...' : 'ثبت تخفیف'}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-1">تعداد فروش</p>
                  <p className="text-lg font-bold text-gray-800">{detailProduct.salesCount}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-1">بازدید</p>
                  <p className="text-lg font-bold text-gray-800">{detailProduct.views}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-1">تاریخ ثبت</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(detailProduct.createdAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t border-gray-100">
              <div className="flex gap-3">
                {detailProduct.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(detailProduct._id, 'published')}
                      className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                    >
                      تایید و انتشار
                    </button>
                    <button
                      onClick={() => handleStatusChange(detailProduct._id, 'rejected')}
                      className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                    >
                      رد محصول
                    </button>
                  </>
                )}
                {detailProduct.status === 'published' && (
                  <button
                    onClick={() => handleStatusChange(detailProduct._id, 'archived')}
                    className="px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                  >
                    انتقال به آرشیو
                  </button>
                )}
                {detailProduct.status === 'draft' && (
                  <button
                    onClick={() => handleStatusChange(detailProduct._id, 'published')}
                    className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                  >
                    انتشار
                  </button>
                )}
                {(detailProduct.status === 'archived' || detailProduct.status === 'rejected') && (
                  <button
                    onClick={() => handleStatusChange(detailProduct._id, 'draft')}
                    className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                  >
                    بازگشت به پیش‌نویس
                  </button>
                )}
              </div>
              <button
                onClick={() => setDetailProduct(null)}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowCreate(false); setEditingId(null); }} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? 'ویرایش محصول' : 'محصول جدید'}</h2>
              <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">عنوان *</label>
                  <input type="text" value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">اسلاگ *</label>
                  <input type="text" value={createForm.slug} onChange={(e) => setCreateForm((f) => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent dir-ltr text-left" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">توضیحات</label>
                  <textarea value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">قیمت (توکن) *</label>
                  <input type="number" value={createForm.price} onChange={(e) => setCreateForm((f) => ({ ...f, price: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent dir-ltr text-left" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">نوع محصول</label>
                  <select value={createForm.productType} onChange={(e) => setCreateForm((f) => ({ ...f, productType: e.target.value as ProductType }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white">
                    {PRODUCT_TYPE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">وضعیت کالا</label>
                  <select value={createForm.condition} onChange={(e) => setCreateForm((f) => ({ ...f, condition: e.target.value as ProductCondition }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white">
                    {PRODUCT_CONDITION_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </div>
                {createForm.productType === 'physical' && (
                  <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">موجودی</label>
                    <input type="number" value={createForm.stockQuantity} onChange={(e) => setCreateForm((f) => ({ ...f, stockQuantity: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent dir-ltr text-left" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">کد SKU</label>
                    <input type="text" value={createForm.sku} onChange={(e) => setCreateForm((f) => ({ ...f, sku: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent dir-ltr text-left" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">وزن (kg)</label>
                    <input type="number" step="0.01" value={createForm.weight} onChange={(e) => setCreateForm((f) => ({ ...f, weight: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent dir-ltr text-left" />
                  </div>
                  </>
                )}
                {/* Variant Management for physical products */}
                {createForm.productType === 'physical' && (
                <div className="col-span-2 border border-dashed border-gray-300 rounded-xl p-4 space-y-4 bg-gray-50/50 mt-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    گزینه‌های محصول (رنگ، سایز، مدل و...)
                  </h4>

                  {/* Add new variant row */}
                  <div className="p-3 border border-dashed border-gray-300 rounded-lg bg-white space-y-3">
                    <p className="text-xs text-gray-500">افزودن گزینه جدید:</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">شناسه (انگلیسی)</label>
                        <input type="text" value={newCreateVariant.variantId} onChange={(e) => setNewCreateVariant((v) => ({ ...v, variantId: e.target.value }))} placeholder="مثل color" className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-accent dir-ltr text-left" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">نام گزینه</label>
                        <input type="text" value={newCreateVariant.name} onChange={(e) => setNewCreateVariant((v) => ({ ...v, name: e.target.value }))} placeholder="مثل رنگ" className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-accent" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">مقادیر (با ویرگول)</label>
                        <input type="text" value={newCreateVariant.valuesStr} onChange={(e) => setNewCreateVariant((v) => ({ ...v, valuesStr: e.target.value }))} placeholder="مثل قرمز,آبی" className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-accent" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">تعداد</label>
                        <input type="number" min="0" value={newCreateVariant.quantity} onChange={(e) => setNewCreateVariant((v) => ({ ...v, quantity: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-accent dir-ltr text-left" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">تفاوت قیمت (توکن)</label>
                        <input type="number" value={newCreateVariant.priceDiff} onChange={(e) => setNewCreateVariant((v) => ({ ...v, priceDiff: e.target.value }))} placeholder="0=بدون تغییر" className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-accent dir-ltr text-left" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={newCreateVariant.isActive} onChange={(e) => setNewCreateVariant((v) => ({ ...v, isActive: e.target.checked }))} className="w-3.5 h-3.5 rounded border-gray-300 text-accent focus:ring-accent" />
                        فعال
                      </label>
                      <button onClick={handleAddCreateVariant} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded text-xs font-medium transition-colors">
                        + افزودن به لیست
                      </button>
                    </div>
                  </div>

                  {/* Existing variants list */}
                  {createVariants.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400 bg-white rounded-lg border border-gray-100">
                      هنوز گزینه‌ای تعریف نشده است.
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-right text-gray-600 font-medium">شناسه / نام</th>
                            <th className="px-3 py-2 text-right text-gray-600 font-medium">مقادیر</th>
                            <th className="px-3 py-2 text-right text-gray-600 font-medium">تعداد</th>
                            <th className="px-3 py-2 text-right text-gray-600 font-medium">تفاوت قیمت</th>
                            <th className="px-3 py-2 text-right text-gray-600 font-medium">وضعیت</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {createVariants.map((v, idx) => (
                            <tr key={`${v.variantId}-${idx}`}>
                              <td className="px-3 py-2">
                                <span className="text-[11px] font-medium text-gray-700 dir-ltr text-left block">{v.variantId}</span>
                                <span className="text-[11px] text-gray-500">{v.name}</span>
                              </td>
                              <td className="px-3 py-2">
                                <span className="text-[11px] text-gray-600">{v.values.join('، ')}</span>
                              </td>
                              <td className="px-3 py-2 w-20">
                                <span className="text-[11px] text-gray-600">{v.quantity}</span>
                              </td>
                              <td className="px-3 py-2 w-24">
                                <span className="text-[11px] text-gray-600">{v.priceDiff ?? 0}</span>
                              </td>
                              <td className="px-3 py-2 w-20">
                                <span className={`text-[11px] ${v.isActive !== false ? 'text-green-600' : 'text-red-500'}`}>
                                  {v.isActive !== false ? 'فعال' : 'غیرفعال'}
                                </span>
                              </td>
                              <td className="px-3 py-2 w-12">
                                <button
                                  onClick={() => handleRemoveCreateVariant(idx)}
                                  className="w-7 h-7 flex items-center justify-center rounded bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                                  title="حذف"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm transition-colors">انصراف</button>
              <button onClick={handleCreateProduct} disabled={creating} className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                {creating ? 'در حال ذخیره...' : (editingId ? 'ذخیره تغییرات' : 'ثبت محصول')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
