"use client";

import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { StoreProduct } from '../types';

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
  const [sort, setSort] = useState('newest');
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
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
  }, [page, search, statusFilter, sort]);

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
    try {
      const res = await api.get(`/store/admin/products/${id}`);
      setDetailProduct(res.data);
    } catch {
      alert('خطا در دریافت جزییات محصول');
    } finally {
      setDetailLoading(false);
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
        <span className="text-sm text-gray-500">{total} محصول</span>
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
            placeholder="جستجو در عنوان، اسلاگ یا توضیحات..."
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
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">قیمت</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">فروش</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">وضعیت</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
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
                          <p className="text-xs text-gray-400" dir="ltr">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">
                        {typeof product.seller === 'object' ? product.seller?.fullName : '---'}
                      </p>
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
                ))}
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
    </div>
  );
}
