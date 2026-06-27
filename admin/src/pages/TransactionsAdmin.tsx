import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { WalletTransaction } from '../types';

const typeOptions = [
  { value: '', label: 'همه' },
  { value: 'purchase', label: 'خرید توکن' },
  { value: 'transfer_sent', label: 'انتقال (ارسال)' },
  { value: 'transfer_received', label: 'انتقال (دریافت)' },
  { value: 'sell', label: 'فروش توکن' },
  { value: 'gift_card_create', label: 'ایجاد کارت هدیه' },
  { value: 'gift_card_redeem', label: 'دریافت کارت هدیه' },
  { value: 'initial_bonus', label: 'شارژ اولیه' },
  { value: 'admin_adjustment', label: 'تنظیم توسط ادمین' },
];

const statusOptions = [
  { value: '', label: 'همه' },
  { value: 'completed', label: 'تکمیل شده' },
  { value: 'rejected', label: 'رد شده' },
  { value: 'pending', label: 'در انتظار' },
];

const typeStyles: Record<string, { label: string; icon: string; bg: string }> = {
  purchase: { label: 'خرید توکن', icon: '🛒', bg: 'bg-emerald-50 text-emerald-700' },
  transfer_sent: { label: 'انتقال (ارسال)', icon: '📤', bg: 'bg-rose-50 text-rose-700' },
  transfer_received: { label: 'انتقال (دریافت)', icon: '📥', bg: 'bg-emerald-50 text-emerald-700' },
  sell: { label: 'فروش توکن', icon: '💵', bg: 'bg-amber-50 text-amber-700' },
  gift_card_create: { label: 'ایجاد کارت هدیه', icon: '🎁', bg: 'bg-purple-50 text-purple-700' },
  gift_card_redeem: { label: 'دریافت کارت هدیه', icon: '🎫', bg: 'bg-cyan-50 text-cyan-700' },
  shop_purchase: { label: 'خرید فروشگاه', icon: '🛍️', bg: 'bg-blue-50 text-blue-700' },
  initial_bonus: { label: 'شارژ اولیه', icon: '🎉', bg: 'bg-indigo-50 text-indigo-700' },
  admin_adjustment: { label: 'تنظیم توسط ادمین', icon: '⚙️', bg: 'bg-gray-50 text-gray-700' },
};

export default function TransactionsAdmin() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '20');
    if (filterType) params.set('type', filterType);
    if (filterStatus) params.set('status', filterStatus);
    if (filterSearch.trim()) params.set('search', filterSearch.trim());
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);

    api.get(`/wallet/admin/transactions?${params.toString()}`)
      .then(({ data }) => {
        setTransactions(data.transactions);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchData();
  };

  const handleClearFilters = () => {
    setFilterType('');
    setFilterStatus('');
    setFilterSearch('');
    setFilterFrom('');
    setFilterTo('');
    setPage(1);
  };

  useEffect(() => {
    // Re-fetch when page changes (filters already applied)
    if (page > 1) fetchData();
  }, [page]);

  const activeFilterCount = [filterType, filterStatus, filterSearch.trim(), filterFrom, filterTo].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
          <span className="text-sm text-muted">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-primary-dark flex items-center gap-2">
            <span className="w-8 h-8 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center text-base">🔄</span>
            تراکنش‌های توکن
          </h1>
          <p className="text-sm text-muted mt-1 mr-10">مشاهده تمام تراکنش‌های مالی کاربران</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              showFilters
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-gray-600 border-gray-200 hover:border-accent'
            }`}
          >
            <span>🔍</span>
            فیلترها
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-accent/20 text-accent rounded-full text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium">
            {total.toLocaleString()} تراکنش
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">نوع تراکنش</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              >
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">وضعیت</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">از تاریخ</label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">تا تاریخ</label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">جستجو در توضیحات</label>
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="نام کاربر یا توضیحات..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyFilters}
              className="bg-accent hover:bg-accent/90 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              اعمال فیلتر
            </button>
            <button
              onClick={handleClearFilters}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm transition-colors"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">کاربر</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">نوع</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">مقدار</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">توضیحات</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => {
                const ts = typeStyles[tx.type] || { label: tx.type, icon: '📌', bg: 'bg-gray-50 text-gray-600' };
                const user = typeof tx.user === 'object' ? tx.user : null;
                return (
                  <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user ? user.fullName : '--'}</p>
                        {user?.mobile && <p className="text-xs text-gray-400 mt-0.5">{user.mobile}</p>}
                        {tx.relatedUser && typeof tx.relatedUser === 'object' && (
                          <p className="text-xs text-accent mt-0.5">
                            {tx.type === 'transfer_sent' ? '← به: ' : tx.type === 'transfer_received' ? '→ از: ' : '↔ '}
                            {tx.relatedUser.username ? `@${tx.relatedUser.username}` : tx.relatedUser.fullName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ts.bg}`}>
                        {ts.icon} {ts.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-800">{tx.amount.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 mr-1">ALC</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {tx.description || '--'}
                      {tx.type === 'sell' && tx.status === 'rejected' && (
                        <span className="inline-block text-xs text-red-500 mr-1">(رد شده)</span>
                      )}
                      {tx.type === 'sell' && tx.status === 'completed' && (
                        <span className="inline-block text-xs text-green-500 mr-1">(تایید شده)</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center py-12 text-gray-400">
                      <span className="text-3xl mb-2">📭</span>
                      <p className="text-sm">هیچ تراکنشی با این فیلترها یافت نشد</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            قبلی
          </button>
          <span className="text-sm text-gray-500 font-medium">صفحه {page} از {Math.ceil(total / 20)}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}
