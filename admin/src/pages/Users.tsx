import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { User } from '../types';

const USER_ROLES = [
  { value: 'user', label: 'کاربر عادی' },
  { value: 'vip', label: 'کاربر ویژه' },
  { value: 'author', label: 'نویسنده' },
  { value: 'editor', label: 'ویراستار' },
  { value: 'instructor', label: 'مدرس' },
  { value: 'admin', label: 'ادمین' },
];

interface UserFormData {
  fullName: string;
  mobile: string;
  countryCode: string;
  email: string;
  role: string;
  username: string;
  password: string;
  bio: string;
  birthDate: string;
  gender: string;
  education: string;
  fieldOfStudy: string;
  expertise: string;
  interests: string;
  country: string;
  city: string;
  website: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  cardNumber: string;
  shebaNumber: string;
  isActive: boolean;
  hasStore: boolean;
  points: number;
}

const initialFormData: UserFormData = {
  fullName: '',
  mobile: '',
  countryCode: '+98',
  email: '',
  role: 'user',
  username: '',
  password: '',
  bio: '',
  birthDate: '',
  gender: '',
  education: '',
  fieldOfStudy: '',
  expertise: '',
  interests: '',
  country: '',
  city: '',
  website: '',
  instagram: '',
  linkedin: '',
  twitter: '',
  cardNumber: '',
  shebaNumber: '',
  isActive: true,
  hasStore: false,
  points: 0,
};

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm transition-all';

function UserFormModal({
  mode,
  user,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  user?: User;
  onClose: () => void;
  onSuccess: (user: User) => void;
}) {
  const [formData, setFormData] = useState<UserFormData>(() => {
    if (mode === 'edit' && user) {
      return {
        fullName: user.fullName,
        mobile: user.mobile,
        countryCode: user.countryCode || '+98',
        email: user.email || '',
        role: user.role,
        username: user.username || '',
        password: '',
        bio: user.bio || '',
        birthDate: user.birthDate || '',
        gender: user.gender || '',
        education: user.education || '',
        fieldOfStudy: user.fieldOfStudy || '',
        expertise: user.expertise || '',
        interests: (user.interests || []).join(', '),
        country: user.country || '',
        city: user.city || '',
        website: user.website || '',
        instagram: user.instagram || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
        cardNumber: user.cardNumber || '',
        shebaNumber: user.shebaNumber || '',
        isActive: user.isActive,
        hasStore: user.hasStore,
        points: user.points,
      };
    }
    return initialFormData;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateField = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload: any = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        countryCode: formData.countryCode || '+98',
        email: formData.email || undefined,
        role: formData.role,
        username: formData.username || undefined,
        bio: formData.bio || undefined,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender || undefined,
        education: formData.education || undefined,
        fieldOfStudy: formData.fieldOfStudy || undefined,
        expertise: formData.expertise || undefined,
        interests: formData.interests
          ? formData.interests.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        website: formData.website || undefined,
        instagram: formData.instagram || undefined,
        linkedin: formData.linkedin || undefined,
        twitter: formData.twitter || undefined,
        cardNumber: formData.cardNumber || undefined,
        shebaNumber: formData.shebaNumber || undefined,
        isActive: formData.isActive,
        hasStore: formData.hasStore,
        points: formData.points,
      };

      if (mode === 'create') {
        if (!formData.password) {
          setError('رمز عبور الزامی است');
          setSubmitting(false);
          return;
        }
        payload.password = formData.password;
      } else {
        if (formData.password) {
          payload.password = formData.password;
        }
      }

      const res =
        mode === 'create'
          ? await api.post<User>('/users', payload)
          : await api.put<User>(`/users/${user!._id}`, payload);

      onSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ذخیره اطلاعات');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-4 sm:inset-8 lg:inset-16 bg-white z-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {mode === 'create' ? 'ایجاد کاربر جدید' : `ویرایش کاربر: ${user?.fullName}`}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                اطلاعات اصلی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="نام کامل" required>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="مثال: علی رضایی"
                  />
                </Field>
                <Field label="شماره موبایل" required>
                  <input
                    type="tel"
                    dir="ltr"
                    className={inputClass}
                    value={formData.mobile}
                    onChange={(e) => updateField('mobile', e.target.value)}
                    placeholder="9121111111"
                  />
                </Field>
                <Field label="کد کشور">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.countryCode}
                    onChange={(e) => updateField('countryCode', e.target.value)}
                    placeholder="+98"
                  />
                </Field>
                <Field label="ایمیل">
                  <input
                    type="email"
                    dir="ltr"
                    className={inputClass}
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="example@email.com"
                  />
                </Field>
                <Field label="نام کاربری">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    placeholder="username"
                  />
                </Field>
                <Field label="نقش کاربر" required>
                  <select
                    className={inputClass}
                    value={formData.role}
                    onChange={(e) => updateField('role', e.target.value)}
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={`رمز عبور${mode === 'edit' ? ' (خالی بگذارید برای عدم تغییر)' : ''}`} required={mode === 'create'}>
                  <input
                    type="password"
                    dir="ltr"
                    className={inputClass}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="حداقل ۶ کاراکتر"
                    minLength={mode === 'create' ? 6 : undefined}
                  />
                </Field>
                <Field label="امتیاز کاربر">
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.points}
                    onChange={(e) => updateField('points', Number(e.target.value))}
                    min={0}
                  />
                </Field>
                <div className="md:col-span-2 lg:col-span-3 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => updateField('isActive', e.target.checked)}
                      className="w-4 h-4 text-accent rounded focus:ring-accent"
                    />
                    <span className="text-sm text-gray-700">کاربر فعال است</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasStore}
                      onChange={(e) => updateField('hasStore', e.target.checked)}
                      className="w-4 h-4 text-accent rounded focus:ring-accent"
                    />
                    <span className="text-sm text-gray-700">دسترسی فروشگاه دارد</span>
                  </label>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                اطلاعات پروفایل و شخصی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="بیوگرافی">
                  <textarea
                    className={`${inputClass} h-24 resize-none`}
                    value={formData.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="معرفی کوتاه کاربر..."
                  />
                </Field>
                <Field label="تاریخ تولد">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    placeholder="1370/01/01"
                  />
                </Field>
                <Field label="جنسیت">
                  <select
                    className={inputClass}
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="male">مرد</option>
                    <option value="female">زن</option>
                  </select>
                </Field>
                <Field label="مقطع تحصیلی">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.education}
                    onChange={(e) => updateField('education', e.target.value)}
                    placeholder="کارشناسی"
                  />
                </Field>
                <Field label="رشته تحصیلی">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.fieldOfStudy}
                    onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                    placeholder="مهندسی کامپیوتر"
                  />
                </Field>
                <Field label="تخصص / حرفه">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.expertise}
                    onChange={(e) => updateField('expertise', e.target.value)}
                    placeholder="برنامه‌نویس"
                  />
                </Field>
                <Field label="علایق (با کاما جدا کنید)">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.interests}
                    onChange={(e) => updateField('interests', e.target.value)}
                    placeholder="علمی, فرهنگی, ورزشی"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                محل زندگی و ارتباطات
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="کشور">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="ایران"
                  />
                </Field>
                <Field label="شهر">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="تهران"
                  />
                </Field>
                <Field label="وبسایت">
                  <input
                    type="url"
                    dir="ltr"
                    className={inputClass}
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="اینستاگرام">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.instagram}
                    onChange={(e) => updateField('instagram', e.target.value)}
                    placeholder="@username"
                  />
                </Field>
                <Field label="لینکدین">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.linkedin}
                    onChange={(e) => updateField('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/"
                  />
                </Field>
                <Field label="توییتر">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.twitter}
                    onChange={(e) => updateField('twitter', e.target.value)}
                    placeholder="@username"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                اطلاعات بانکی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="شماره کارت بانکی">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.cardNumber}
                    onChange={(e) => updateField('cardNumber', e.target.value)}
                    placeholder="16 رقم"
                  />
                </Field>
                <Field label="شماره شبا">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.shebaNumber}
                    onChange={(e) => updateField('shebaNumber', e.target.value)}
                    placeholder="IR..."
                  />
                </Field>
              </div>
            </section>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {mode === 'create' ? 'ایجاد کاربر' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>
    </>
  );
}

function UserDetailModal({
  user,
  onClose,
  onEdit,
}: {
  user: User;
  onClose: () => void;
  onEdit: () => void;
}) {
  const genderLabels: Record<string, string> = { male: 'مرد', female: 'زن' };

  const InfoRow = ({ label, value }: { label: string; value?: string | null | number }) => (
    <div className="flex items-start gap-2 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-400 text-sm min-w-[120px] shrink-0">{label}:</span>
      <span className="text-gray-700 text-sm">{value || '—'}</span>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-full sm:max-w-lg bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">جزئیات کاربر</h2>
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              ویرایش
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              اطلاعات پایه
            </h4>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="نام کاربری" value={user.username} />
              <InfoRow label="موبایل" value={user.mobile} />
              <InfoRow label="تاریخ تولد" value={user.birthDate} />
              <InfoRow label="جنسیت" value={user.gender ? genderLabels[user.gender] || user.gender : undefined} />
              <InfoRow label="نقش" value={USER_ROLES.find((r) => r.value === user.role)?.label || user.role} />
              <InfoRow label="امتیاز" value={String(user.points)} />
              <InfoRow label="وضعیت" value={user.isActive ? 'فعال' : 'غیرفعال'} />
              <InfoRow label="تاریخ عضویت" value={new Date(user.createdAt).toLocaleDateString('fa-IR')} />
            </div>
          </div>

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

          {(user.cardNumber || user.shebaNumber) && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                اطلاعات بانکی
              </h4>
              <div className="bg-gray-50 rounded-lg px-4">
                <InfoRow label="شماره کارت" value={user.cardNumber} />
                <InfoRow label="شماره شبا" value={user.shebaNumber} />
              </div>
            </div>
          )}
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
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);

  const loadUsers = () => {
    setLoading(true);
    api.get<User[]>('/users')
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
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

  const handleCreateSuccess = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    setFormMode(null);
  };

  const handleEditSuccess = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
    if (selectedUser && selectedUser._id === updatedUser._id) {
      setSelectedUser(updatedUser);
    }
    setFormMode(null);
    setEditTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">کاربران</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{filtered.length} کاربر</span>
          <button
            onClick={() => setFormMode('create')}
            className="px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            ایجاد کاربر جدید
          </button>
        </div>
      </div>

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
                  <th className="text-right px-5 py-3 font-medium">درخواست فروشگاه</th>
                  <th className="text-right px-5 py-3 font-medium">تاریخ عضویت</th>
                  <th className="text-right px-5 py-3 font-medium">عملیات</th>
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
                        {USER_ROLES.find((r) => r.value === user.role)?.label || user.role}
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
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      {user.storeRequestStatus === 'pending' ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-600 text-xs">در انتظار</span>
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/users/${user._id}/store-request`, { action: 'approve' });
                                setUsers((prev) =>
                                  prev.map((u) =>
                                    u._id === user._id
                                      ? { ...u, hasStore: true, storeRequestStatus: 'approved' }
                                      : u,
                                  ),
                                );
                              } catch (err: any) {
                                alert(err.response?.data?.message || 'خطا');
                              }
                            }}
                            className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                          >
                            تایید
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/users/${user._id}/store-request`, { action: 'reject' });
                                setUsers((prev) =>
                                  prev.map((u) =>
                                    u._id === user._id
                                      ? { ...u, storeRequestStatus: 'rejected' }
                                      : u,
                                  ),
                                );
                              } catch (err: any) {
                                alert(err.response?.data?.message || 'خطا');
                              }
                            }}
                            className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                          >
                            رد
                          </button>
                        </div>
                      ) : user.storeRequestStatus === 'approved' ? (
                        <span className="text-green-600 text-xs">تایید شده</span>
                      ) : user.storeRequestStatus === 'rejected' ? (
                        <span className="text-red-500 text-xs">رد شده</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setEditTarget(user);
                          setFormMode('edit');
                        }}
                        className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="ویرایش کاربر"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-gray-400">
                      کاربری یافت نشد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && !formMode && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={() => {
            setEditTarget(selectedUser);
            setFormMode('edit');
          }}
        />
      )}

      {formMode === 'create' && (
        <UserFormModal
          mode="create"
          onClose={() => setFormMode(null)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {formMode === 'edit' && editTarget && (
        <UserFormModal
          mode="edit"
          user={editTarget}
          onClose={() => {
            setFormMode(null);
            setEditTarget(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
