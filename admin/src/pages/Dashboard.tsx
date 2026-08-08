import { useEffect, useRef, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line,
} from 'recharts';
import api from '../lib/api';
import type { AdminDashboard } from '../types';

const TABS = [
  { key: 'overview' as const, label: 'نمای کلی' },
  { key: 'ecosystem' as const, label: 'اکوسیستم' },
  { key: 'store' as const, label: 'فروشگاه' },
];

type TabKey = (typeof TABS)[number]['key'];

/* ===================== Persian Date Utils ===================== */
const P_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const P_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

function isLeapYear(jy: number): boolean {
  const leaps = [1, 5, 9, 13, 17, 22, 26, 30];
  const r = jy % 33;
  return leaps.includes(r < 0 ? r + 33 : r);
}

function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  const jy1 = jy - 1;
  const jDays = 365 * jy1 + Math.floor(jy1 / 33) * 8 + Math.floor(((jy1 % 33) + 3) / 4) + 78 + jd + (jm <= 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  const gDays = jDays + 226894;
  let gy = Math.floor((gDays - 1) / 365.2425 + 1);
  let gd = gDays - Math.floor(gy * 365.2425 + 0.5);
  if (gd <= 0) { gy--; gd = gDays - Math.floor(gy * 365.2425 + 0.5); }
  const gMonths = [31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 1;
  for (let i = 0; i < 12; i++) {
    if (gd <= gMonths[i]) break;
    gd -= gMonths[i];
    gm++;
  }
  return { gy, gm, gd };
}

function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 + 365 * gy + Math.floor(gy2 / 4) - Math.floor(gy2 / 100) + Math.floor(gy2 / 400) + gd + gdm[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  let jm: number, jd: number;
  if (days < 186) { jm = 1 + Math.floor(days / 31); jd = 1 + days % 31; }
  else { const d2 = days - 186; jm = 7 + Math.floor(d2 / 30); jd = 1 + d2 % 30; }
  return { jy, jm, jd };
}

function formatJalali(jy: number, jm: number, jd: number): string {
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

function parseJalali(s: string): { jy: number; jm: number; jd: number } | null {
  const parts = s.replace(/\//g, '').match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!parts) return null;
  const jy = parseInt(parts[1]), jm = parseInt(parts[2]), jd = parseInt(parts[3]);
  if (jm < 1 || jm > 12 || jd < 1) return null;
  const maxDay = jm <= 6 ? 31 : (jm === 12 && !isLeapYear(jy) ? 29 : 30);
  if (jd > maxDay) return null;
  return { jy, jm, jd };
}

/* ===================== Shamsi Date Picker ===================== */
function ShamsiDatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const today = gregorianToJalali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
  const parsed = parseJalali(value);
  const [viewY, setViewY] = useState(parsed?.jy || today.jy);
  const [viewM, setViewM] = useState(parsed?.jm || today.jm);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const daysInMonth = viewM <= 6 ? 31 : (viewM === 12 && !isLeapYear(viewY) ? 29 : 30);
  const firstDayOfWeek = (() => { const g = jalaliToGregorian(viewY, viewM, 1); return new Date(g.gy, g.gm - 1, g.gd).getDay(); })();
  const satOffset = (firstDayOfWeek + 1) % 7;

  const prevMonth = () => {
    if (viewM === 1) { setViewY(viewY - 1); setViewM(12); }
    else setViewM(viewM - 1);
  };
  const nextMonth = () => {
    if (viewM === 12) { setViewY(viewY + 1); setViewM(1); }
    else setViewM(viewM + 1);
  };

  const selectDay = (day: number) => {
    onChange(formatJalali(viewY, viewM, day));
    setOpen(false);
  };

  const gregorian = parsed ? jalaliToGregorian(parsed.jy, parsed.jm, parsed.jd) : null;
  const gregStr = gregorian ? `${gregorian.gy}-${String(gregorian.gm).padStart(2, '0')}-${String(gregorian.gd).padStart(2, '0')}` : '';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-[155px] focus:outline-none focus:ring-2 focus:ring-accent/50 text-center hover:border-accent/50 cursor-pointer bg-white"
      >
        {value ? (
          <span dir="ltr">{value}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>
      {gregStr && (
        <p className="text-[10px] text-gray-400 text-center mt-0.5" dir="ltr">{gregStr}</p>
      )}
      {open && (
        <div className="absolute top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-[240px]">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded text-sm cursor-pointer">&lt;</button>
            <span className="text-sm font-medium">{P_MONTHS[viewM - 1]} {viewY}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded text-sm cursor-pointer">&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {P_WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: satOffset }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const isSelected = parsed && parsed.jy === viewY && parsed.jm === viewM && parsed.jd === d;
              const isToday = today.jy === viewY && today.jm === viewM && today.jd === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => selectDay(d)}
                  className={`text-center text-sm py-1 rounded cursor-pointer hover:bg-accent/10 ${
                    isSelected ? 'bg-accent text-white hover:bg-accent' : ''
                  } ${isToday && !isSelected ? 'border border-accent/40' : ''}`}
                >
                  {d.toLocaleString('fa-IR')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [shamsiFrom, setShamsiFrom] = useState('');
  const [shamsiTo, setShamsiTo] = useState('');

  const fromDate = (() => {
    const p = parseJalali(shamsiFrom);
    if (!p) return undefined;
    const g = jalaliToGregorian(p.jy, p.jm, p.jd);
    return `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
  })();
  const toDate = (() => {
    const p = parseJalali(shamsiTo);
    if (!p) return undefined;
    const g = jalaliToGregorian(p.jy, p.jm, p.jd);
    return `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
  })();

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);

    api.get<AdminDashboard>(`/analytics/admin-dashboard?${params.toString()}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('Dashboard API error:', err);
        setError(err?.response?.data?.message || 'خطا در دریافت اطلاعات داشبورد');
      })
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  const clearDateFilter = () => {
    setShamsiFrom('');
    setShamsiTo('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
        <p className="text-sm text-gray-400">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500">{error || 'خطا در دریافت اطلاعات'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/80 cursor-pointer"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const hasFilter = shamsiFrom || shamsiTo;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">داشبورد</h1>
        <div className="flex items-end gap-2 flex-wrap">
          <ShamsiDatePicker
            value={shamsiFrom}
            onChange={setShamsiFrom}
            placeholder="از تاریخ"
          />
          <span className="text-gray-400 text-sm pb-2">تا</span>
          <ShamsiDatePicker
            value={shamsiTo}
            onChange={setShamsiTo}
            placeholder="تا تاریخ"
          />
          {hasFilter && (
            <button
              onClick={clearDateFilter}
              className="text-sm text-red-500 hover:text-red-700 cursor-pointer pb-2"
            >
              حذف فیلتر
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer rounded-t-lg ${
              activeTab === tab.key
                ? 'bg-white text-accent border-b-2 border-accent'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab data={data} />}
      {activeTab === 'ecosystem' && <EcosystemTab data={data} />}
      {activeTab === 'store' && <StoreTab data={data} />}
    </div>
  );
}

/* ===================== OVERVIEW TAB ===================== */
function OverviewTab({ data }: { data: AdminDashboard }) {
  const stats = [
    { label: 'کل بازدید صفحات', value: data.totalPageViews, color: 'bg-accent' },
    { label: 'بازدید امروز', value: data.todayPageViews, color: 'bg-green-500' },
    { label: 'تعداد کاربران', value: data.totalUsers, color: 'bg-blue-500' },
    { label: 'پیام‌های تماس', value: data.totalContacts, color: 'bg-yellow-500' },
    { label: 'تیکت‌های باز', value: data.openTickets, color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-xs mb-3`}>
              {String(s.value).length > 4 ? '...' : s.value}
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value.toLocaleString('fa-IR')}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {data.dailyViews && data.dailyViews.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">بازدید روزانه</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.dailyViews}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#8B7D4A" fill="#8B7D4A33" name="بازدید" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.topPages && data.topPages.length > 0 && (
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
      )}
    </div>
  );
}

/* ===================== ECOSYSTEM TAB ===================== */
function EcosystemTab({ data }: { data: AdminDashboard }) {
  const e = data.ecosystem;

  if (!e) {
    return <p className="text-gray-400 text-center py-8">اطلاعات اکوسیستم در دسترس نیست</p>;
  }

  const stats = [
    { label: 'کل کوین خریداری شده', value: e.totalCoinsPurchased, color: 'bg-emerald-500' },
    { label: 'ارزش ریالی (تخمین)', value: e.totalRialValue, color: 'bg-amber-500', format: 'rial' as const },
    { label: 'تعداد خرید کوین', value: e.coinBuyCount, color: 'bg-blue-500' },
    { label: 'تعداد فروش کوین', value: e.coinSellCount, color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-xs mb-3`} />
            <p className="text-2xl font-bold text-gray-800">
              {s.format === 'rial'
                ? `${s.value.toLocaleString('fa-IR')} تومان`
                : s.value.toLocaleString('fa-IR')}
            </p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">دارایی اکوسیستم (ریال و کوین)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={[
              { name: 'کوین خریداری شده', value: e.totalCoinsPurchased },
              { name: 'ارزش ریالی', value: Math.round(e.totalRialValue / (e.tomanPerToken || 1)) },
            ]}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(val: number) => val.toLocaleString('fa-IR')} />
            <Bar dataKey="value" fill="#8B7D4A" name="مقدار" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-2 text-center">
          نرخ تبدیل: هر ۱ توکن = {e.tomanPerToken?.toLocaleString('fa-IR') ?? '---'} تومان
        </p>
      </div>

      {data.dailyCoinTransactions && data.dailyCoinTransactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">میزان خرید و فروش کوین</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.dailyCoinTransactions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="buy" stroke="#10b981" fill="#10b98133" name="خرید" />
              <Area type="monotone" dataKey="sell" stroke="#ef4444" fill="#ef444433" name="فروش" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-2">کل خرید کوین</p>
          <p className="text-2xl font-bold text-emerald-600">{e.coinBuyAmount.toLocaleString('fa-IR')}</p>
          <p className="text-xs text-gray-400 mt-1">{e.coinBuyCount} تراکنش خرید</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-2">کل فروش کوین</p>
          <p className="text-2xl font-bold text-red-500">{e.coinSellAmount.toLocaleString('fa-IR')}</p>
          <p className="text-xs text-gray-400 mt-1">{e.coinSellCount} تراکنش فروش</p>
        </div>
      </div>
    </div>
  );
}

/* ===================== STORE TAB ===================== */
function StoreTab({ data }: { data: AdminDashboard }) {
  const s = data.store;

  if (!s) {
    return <p className="text-gray-400 text-center py-8">اطلاعات فروشگاه در دسترس نیست</p>;
  }

  const stats = [
    { label: 'تعداد فروش فروشگاه', value: s.totalOrders, color: 'bg-violet-500' },
    { label: 'مبلغ کل فروش (توکن)', value: s.totalSalesAmount, color: 'bg-amber-500' },
    { label: 'محصولات جدید', value: s.newProductsCount, color: 'bg-cyan-500' },
    { label: 'تیکت‌های باز', value: data.openTickets, color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-white text-xs mb-3`} />
            <p className="text-2xl font-bold text-gray-800">{s.value.toLocaleString('fa-IR')}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {data.dailyStoreSales && data.dailyStoreSales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">نمودار فروش فروشگاه</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyStoreSales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" name="تعداد فروش" strokeWidth={2} />
              <Line type="monotone" dataKey="totalAmount" stroke="#f59e0b" name="مبلغ فروش (توکن)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">محصولات بر اساس میزان فروش</h2>
        {!s.productsBySales || s.productsBySales.length === 0 ? (
          <p className="text-gray-400 text-center py-8">محصولی یافت نشد</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, s.productsBySales.length * 40)}>
            <BarChart
              data={s.productsBySales.map((p) => ({ name: p.title, salesCount: p.salesCount }))}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} width={120} />
              <Tooltip formatter={(val: number) => val.toLocaleString('fa-IR')} />
              <Bar dataKey="salesCount" fill="#8B7D4A" name="تعداد فروش" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
