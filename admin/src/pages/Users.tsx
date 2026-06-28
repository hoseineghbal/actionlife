import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { User } from '../types';

function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  const genderLabels: Record<string, string> = { male: 'مرد', female: 'زن' };

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex items-start gap-2 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-400 text-sm min-w-[120px] shrink-0">{label}:</span>
      <span className="text-gray-700 text-sm">{value || '—'}</span>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-full sm:max-w-lg bg-white z-50 shadow-2xl overflow-y-auto">
        {/* هدر */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-800">جزئیات کاربر</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* پروفایل کاربر */}
        <div className="px-6 py-5 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xl font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{user.fullName}</h3>
              <p className="text-sm text-gray-500" dir="ltr">{user.email}</p>
            </div>
          </div>
          {user.bio && (
            <p className="mt-3 text-sm text-gray-600 leading-6 bg-white rounded-lg p-3 border border-gray-100">
              {user.bio}
            </p>
          )}
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* اطلاعات پایه */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              اطلاعات پایه
            </h4>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="موبایل" value={user.mobile} />
              <InfoRow label="تاریخ تولد" value={user.birthDate} />
              <InfoRow label="جنسیت" value={user.gender ? genderLabels[user.gender] || user.gender : undefined} />
              <InfoRow label="نقش" value={user.role} />
              <InfoRow label="امتیاز" value={String(user.points)} />
              <InfoRow label="وضعیت" value={user.isActive ? 'فعال' : 'غیرفعال'} />
              <InfoRow label="تاریخ عضویت" value={new Date(user.createdAt).toLocaleDateString('fa-IR')} />
            </div>
          </div>

          {/* تحصیلات و تخصص */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
              </svg>
              تحصیلات و تخصص
            </h4>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="مقطع تحصیلی" value={user.education} />
              <InfoRow label="رشته تحصیلی" value={user.fieldOfStudy} />
              <InfoRow label="تخصص / حرفه" value={user.expertise} />
            </div>
            {user.interests && user.interests.length > 0 && (
              <div className="mt-3">
                <span className="text-sm text-gray-400 block mb-2">علایق:</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* محل زندگی */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              محل زندگی
            </h4>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="کشور" value={user.country} />
              <InfoRow label="شهر" value={user.city} />
            </div>
          </div>

          {/* شبکه‌های اجتماعی */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              شبکه‌های اجتماعی
            </h4>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="وبسایت" value={user.website} />
              <InfoRow label="اینستاگرام" value={user.instagram} />
              <InfoRow label="لینکدین" value={user.linkedin} />
              <InfoRow label="توییتر" value={user.twitter} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    api.get<User[]>('/users')
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
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
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
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
                  <th className="text-right px-5 py-3 font-medium">فروشگاه</th>
                  <th className="text-right px-5 py-3 font-medium">تاریخ عضویت</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-bold">
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
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={async () => {
                          try {
                            await api.put(`/users/${user._id}`, { hasStore: !user.hasStore });
                            setUsers((prev) =>
                              prev.map((u) =>
                                u._id === user._id ? { ...u, hasStore: !u.hasStore } : u,
                              ),
                            );
                          } catch (err: any) {
                            alert(err.response?.data?.message || 'خطا در تغییر دسترسی');
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          user.hasStore
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {user.hasStore ? 'فعال' : 'غیرفعال'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      کاربری یافت نشد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
