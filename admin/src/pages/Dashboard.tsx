import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import type { AnalyticsOverview } from '../types';

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AnalyticsOverview>('/analytics/overview')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-gray-500">خطا در دریافت اطلاعات</p>;
  }

  const stats = [
    { label: 'کل بازدید صفحات', value: data.totalPageViews, color: 'bg-indigo-500' },
    { label: 'بازدید امروز', value: data.todayPageViews, color: 'bg-green-500' },
    { label: 'تعداد کاربران', value: data.totalUsers, color: 'bg-blue-500' },
    { label: 'پیام‌های تماس', value: data.totalContacts, color: 'bg-yellow-500' },
    { label: 'تیکت‌های باز', value: data.openTickets, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">داشبورد</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>
              {s.value}
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value.toLocaleString('fa-IR')}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">بازدید روزانه</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.dailyViews}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              fill="#c7d2fe"
              name="بازدید"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">صفحات پربازدید</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-right pb-3 font-medium">صفحه</th>
                <th className="text-right pb-3 font-medium">تعداد بازدید</th>
              </tr>
            </thead>
            <tbody>
              {data.topPages.map((page, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 text-gray-700">{page.path}</td>
                  <td className="py-3 text-gray-700">{page.count.toLocaleString('fa-IR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
