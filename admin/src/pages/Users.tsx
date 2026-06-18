import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { User } from '../types';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<User[]>('/users')
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.mobile && u.mobile.includes(search))
  );

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    editor: 'bg-blue-100 text-blue-700',
    author: 'bg-green-100 text-green-700',
    instructor: 'bg-purple-100 text-purple-700',
    user: 'bg-gray-100 text-gray-700',
    vip: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">کاربران</h1>
        <span className="text-sm text-gray-500">{filtered.length} کاربر</span>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="جستجو بر اساس نام، ایمیل یا موبایل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b">
                  <th className="text-right px-5 py-3 font-medium">نام</th>
                  <th className="text-right px-5 py-3 font-medium">ایمیل</th>
                  <th className="text-right px-5 py-3 font-medium">موبایل</th>
                  <th className="text-right px-5 py-3 font-medium">نقش</th>
                  <th className="text-right px-5 py-3 font-medium">امتیاز</th>
                  <th className="text-right px-5 py-3 font-medium">وضعیت</th>
                  <th className="text-right px-5 py-3 font-medium">تاریخ عضویت</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {user.fullName.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600" dir="ltr">{user.email}</td>
                    <td className="px-5 py-4 text-gray-600" dir="ltr">{user.mobile || '-'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.user}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{user.points}</td>
                    <td className="px-5 py-4">
                      <span className={`w-2 h-2 rounded-full inline-block ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="mr-2 text-gray-600">{user.isActive ? 'فعال' : 'غیرفعال'}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      کاربری یافت نشد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
