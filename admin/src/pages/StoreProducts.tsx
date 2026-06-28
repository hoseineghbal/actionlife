"use client";

import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { StoreProduct } from '../types';

export default function StoreProducts() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    api
      .get(`/store/admin/products?page=${page}&limit=${limit}`)
      .then((res) => {
        setProducts(res.data.products);
        setTotal(res.data.total);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/store/admin/products/${id}/status`, { status });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status } : p)),
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطا در تغییر وضعیت');
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">محصولات فروشگاه</h1>
        <span className="text-sm text-gray-500">{total} محصول</span>
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
    </div>
  );
}
