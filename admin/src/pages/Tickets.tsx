import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { Ticket, AdminSummary } from '../types';

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [admins, setAdmins] = useState<AdminSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'closed'>('all');
  const [adminFilter, setAdminFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      api.get<Ticket[]>('/tickets'),
      api.get<AdminSummary[]>('/tickets/admin/list'),
    ])
      .then(([ticketsRes, adminsRes]) => {
        setTickets(ticketsRes.data);
        setAdmins(adminsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  let filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);
  filtered = adminFilter === 'all'
    ? filtered
    : adminFilter === 'unassigned'
      ? filtered.filter((t) => !t.assignedAdminId)
      : filtered.filter((t) => t.assignedAdminId === adminFilter);

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    open: 'باز',
    pending: 'در انتظار',
    closed: 'بسته',
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
  };

  const priorityLabels: Record<string, string> = {
    high: 'بالا',
    medium: 'متوسط',
    low: 'پایین',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تیکت‌ها</h1>
        <span className="text-sm text-gray-500">{filtered.length} تیکت</span>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'open', 'pending', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                filter === f
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {f === 'all' ? 'همه وضعیت‌ها' : statusLabels[f]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 ml-2">ارجاع به:</span>
          <select
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="all">همه ادمین‌ها</option>
            <option value="unassigned">ارجاع نشده</option>
            {admins.map((a) => (
              <option key={a._id} value={a._id}>
                {a.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <Link
              key={ticket._id}
              to={`/tickets/${ticket._id}`}
              className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-800 truncate">{ticket.subject}</h3>
                <div className="flex gap-2 shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                    {priorityLabels[ticket.priority]}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                    {statusLabels[ticket.status]}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                <span>{ticket.userName}</span>
                <span>{ticket.userEmail}</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString('fa-IR')}</span>
                <span>{ticket.messages.length} پیام</span>
                {ticket.assignedAdminName && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    ارجاع به: {ticket.assignedAdminName}
                  </span>
                )}
                {!ticket.assignedAdminName && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ارجاع نشده
                  </span>
                )}
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">تیکتی یافت نشد</div>
          )}
        </div>
      )}
    </div>
  );
}
