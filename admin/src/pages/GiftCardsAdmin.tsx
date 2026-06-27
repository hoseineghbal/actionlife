import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { GiftCard } from '../types';

const statusStyles: Record<string, { label: string; bg: string; dot: string }> = {
  active: { label: 'فعال', bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  redeemed: { label: 'استفاده شده', bg: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  expired: { label: 'منقضی شده', bg: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  cancelled: { label: 'لغو شده', bg: 'bg-gray-50 text-gray-600', dot: 'bg-gray-400' },
};

export default function GiftCardsAdmin() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [amount, setAmount] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get(`/wallet/admin/gift-cards?page=${page}`)
      .then(({ data }) => {
        setCards(data.cards);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleCreate = async () => {
    const amt = +amount;
    if (!amt || amt <= 0) {
      setFeedback({ type: 'error', text: 'مقدار معتبر وارد کنید' });
      return;
    }
    setCreating(true);
    setFeedback(null);
    try {
      await api.post('/wallet/admin/gift-card', { amount: amt, message: giftMessage || undefined });
      setFeedback({ type: 'success', text: 'کارت هدیه با موفقیت ایجاد شد' });
      setAmount('');
      setGiftMessage('');
      setShowCreate(false);
      fetchData();
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: 'error', text: 'خطا در ایجاد کارت هدیه' });
    } finally {
      setCreating(false);
    }
  };

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

  const activeCount = cards.filter((c) => c.status === 'active').length;

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary-dark flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-base">🎁</span>
            کارت‌های هدیه
          </h1>
          <p className="text-sm text-muted mt-1 mr-10">مدیریت کارت‌های هدیه و ایجاد کارت جدید</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {activeCount} کارت فعال
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-accent/20"
          >
            <span>{showCreate ? '✕' : '＋'}</span>
            {showCreate ? 'انصراف' : 'ایجاد کارت هدیه'}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 transition-all ${
            feedback.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-100'
              : 'bg-green-50 text-green-700 border border-green-100'
          }`}
        >
          <span>{feedback.type === 'error' ? '❌' : '✅'}</span>
          {feedback.text}
        </div>
      )}

      {/* Create Panel */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-xs">🎁</span>
            ایجاد کارت هدیه جدید
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">مقدار توکن</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-right focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-gray-50 hover:bg-white transition-all"
                  placeholder="۱۰۰"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">ALC</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">پیام (اختیاری)</label>
              <input
                type="text"
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 bg-gray-50 hover:bg-white transition-all"
                placeholder="متن پیام روی کارت"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreate}
                disabled={creating || !amount}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {creating ? 'در حال ایجاد...' : 'ایجاد کارت هدیه'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">کد</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ایجادکننده</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">مقدار</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">وضعیت</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">استفاده‌کننده</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">تاریخ ایجاد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cards.map((card) => {
                const ss = statusStyles[card.status] || statusStyles.active;
                const creator = typeof card.creator === 'object' ? card.creator : null;
                const redeemed = typeof card.redeemedBy === 'object' ? card.redeemedBy : null;
                return (
                  <tr key={card._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-gray-800 bg-gray-50 px-2 py-0.5 rounded-md select-all">
                          {card.code}
                        </span>
                        {card.message && (
                          <span className="text-xs text-gray-400 truncate max-w-32" title={card.message}>
                            {card.message}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{creator ? creator.fullName : '--'}</p>
                        {creator?.mobile && <p className="text-xs text-gray-400 mt-0.5">{creator.mobile}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-800">{card.amount.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 mr-1">ALC</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ss.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                        {ss.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {redeemed ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800">{redeemed.fullName}</p>
                          {card.redeemedAt && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(card.redeemedAt).toLocaleDateString('fa-IR')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">--</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(card.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                );
              })}
              {cards.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center py-12 text-gray-400">
                      <span className="text-3xl mb-2">📭</span>
                      <p className="text-sm">هیچ کارت هدیه‌ای وجود ندارد</p>
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
