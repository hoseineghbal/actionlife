import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { SellRequest } from '../types';

const statusStyles: Record<string, { label: string; bg: string; dot: string }> = {
  pending: { label: 'در انتظار', bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  approved: { label: 'تایید شده', bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: 'رد شده', bg: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
};

export default function SellRequests() {
  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get(`/wallet/admin/sell-requests?page=${page}`)
      .then(({ data }) => {
        setRequests(data.requests);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleProcess = async (id: string, status: string) => {
    setProcessingId(id);
    try {
      await api.put(`/wallet/admin/sell-requests/${id}`, { status, adminNote: note });
      setNote('');
      fetchData();
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
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

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary-dark flex items-center gap-2">
            <span className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-base">💵</span>
            درخواست‌های فروش توکن
          </h1>
          <p className="text-sm text-muted mt-1 mr-10">
            {pendingCount > 0
              ? `${pendingCount} درخواست در انتظار بررسی`
              : 'مدیریت درخواست‌های فروش توکن توسط کاربران'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {pendingCount} در انتظار
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">کاربر</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">مقدار توکن</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">مبلغ (تومان)</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">شماره کارت / شبا</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">وضعیت</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">تاریخ</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((req) => {
                const ss = statusStyles[req.status] || statusStyles.pending;
                const user = typeof req.user === 'object' ? req.user : null;
                return (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user ? user.fullName : 'نامشخص'}</p>
                        {user?.mobile && <p className="text-xs text-gray-400 mt-0.5">{user.mobile}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-gray-700">{req.tokenAmount.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 mr-1">ALC</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-gray-700">{req.tomanAmount.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 mr-1">تومان</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-gray-600">
                        {req.cardNumber && <p className="font-mono text-xs">{req.cardNumber}</p>}
                        {req.shebaNumber && <p className="font-mono text-xs text-gray-400">{req.shebaNumber}</p>}
                        {!req.cardNumber && !req.shebaNumber && <span className="text-gray-300">--</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ss.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                        {ss.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-5 py-4">
                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="یادداشت"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-gray-50"
                          />
                          <button
                            onClick={() => handleProcess(req._id, 'approved')}
                            disabled={processingId === req._id}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors shadow-sm"
                          >
                            تایید
                          </button>
                          <button
                            onClick={() => handleProcess(req._id, 'rejected')}
                            disabled={processingId === req._id}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors shadow-sm"
                          >
                            رد
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">{req.adminNote || '--'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center py-12 text-gray-400">
                      <span className="text-3xl mb-2">📭</span>
                      <p className="text-sm">هیچ درخواست فروشی وجود ندارد</p>
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
