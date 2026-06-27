import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import type { TokenConfig } from '../types';

function formatNum(n: number | undefined | null): string {
  if (n === undefined || n === null) return '';
  return n.toLocaleString('en-US');
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  help?: string;
  suffix?: string;
}

function NumberField({ label, value, onChange, help, suffix }: NumberFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={focused ? String(value) : formatNum(value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, '');
            if (raw === '' || /^\d*$/.test(raw)) {
              onChange(+raw);
            }
          }}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-right focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all bg-gray-50 hover:bg-white"
        />
        {suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {help && <p className="text-[10px] text-gray-400 mt-1">{help}</p>}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  desc?: string;
}

function Toggle({ label, checked, onChange, desc }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {desc && <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-accent' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export default function TokenSettings() {
  const [config, setConfig] = useState<TokenConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api.get('/wallet/admin/config')
      .then(({ data }) => setConfig(data))
      .catch(() => setMessage({ type: 'error', text: 'خطا در دریافت تنظیمات' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/wallet/admin/config', config);
      setMessage({ type: 'success', text: 'تنظیمات با موفقیت ذخیره شد' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'خطا در ذخیره تنظیمات' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof TokenConfig, value: number | boolean) => {
    setConfig((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
          <span className="text-sm text-muted">در حال بارگذاری تنظیمات...</span>
        </div>
      </div>
    );
  }

  if (!config) return null;

  const numField = (field: keyof TokenConfig, label: string, suffix?: string, help?: string) => (
    <NumberField
      label={label}
      value={config[field] as number}
      onChange={(v) => handleChange(field, v)}
      suffix={suffix}
      help={help}
    />
  );

  return (
    <div className="py-6 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary-dark flex items-center gap-2">
            <span className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-lg">⚙️</span>
            تنظیمات توکن ALC
          </h1>
          <p className="text-sm text-muted mt-1 mr-10">مدیریت قیمت، محدودیت‌ها و امکانات توکن فروشگاه</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-accent/20"
        >
          {saving ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              در حال ذخیره...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ذخیره تنظیمات
            </>
          )}
        </button>
      </div>

      {/* Toast message */}
      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 transition-all ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-100'
              : 'bg-green-50 text-green-700 border border-green-100'
          }`}
        >
          <span>{message.type === 'error' ? '❌' : '✅'}</span>
          {message.text}
        </div>
      )}

      <div className="space-y-5">
        {/* --- Base Section --- */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-base">💰</div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">تنظیمات پایه</h2>
              <p className="text-xs text-gray-400">قیمت توکن و شارژ هدیه ثبت‌نام</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {numField('tomanPerToken', 'قیمت هر توکن (تومان)', 'تومان')}
            {numField('signupBonus', 'شارژ هدیه ثبت‌نام', 'ALC', 'به کاربران تازه ثبت‌نام شده اعطا می‌شود')}
          </div>
        </section>

        {/* --- Purchase Section --- */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-base">🛒</div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">تنظیمات خرید</h2>
              <p className="text-xs text-gray-400">محدودیت‌های خرید توکن توسط کاربران</p>
            </div>
          </div>
          <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50">
            <Toggle
              label="فعال بودن خرید"
              checked={config.purchaseEnabled}
              onChange={(v) => handleChange('purchaseEnabled', v)}
              desc={config.purchaseEnabled ? 'کاربران می‌توانند توکن خریداری کنند' : 'خرید توکن غیرفعال است'}
            />
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {numField('minPurchaseAmount', 'حداقل خرید', 'ALC')}
            {numField('maxPurchaseAmount', 'حداکثر خرید', 'ALC')}
          </div>
        </section>

        {/* --- Sell Section --- */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-base">💵</div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">تنظیمات فروش مجدد</h2>
              <p className="text-xs text-gray-400">کاربران می‌توانند درخواست فروش توکن ثبت کنند</p>
            </div>
          </div>
          <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50">
            <Toggle
              label="فعال بودن فروش"
              checked={config.sellEnabled}
              onChange={(v) => handleChange('sellEnabled', v)}
              desc={config.sellEnabled ? 'درخواست فروش باز است' : 'فروش توکن غیرفعال است'}
            />
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {numField('minSellAmount', 'حداقل فروش', 'ALC')}
            {numField('maxSellAmount', 'حداکثر فروش', 'ALC')}
            {numField('sellCooldownHours', 'محدودیت زمانی بین فروش', 'ساعت', 'حداقل فاصله بین دو درخواست فروش')}
          </div>
        </section>

        {/* --- Transfer Section --- */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center text-base">📤</div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">تنظیمات انتقال</h2>
              <p className="text-xs text-gray-400">انتقال توکن بین کاربران</p>
            </div>
          </div>
          <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50">
            <Toggle
              label="فعال بودن انتقال"
              checked={config.transferEnabled}
              onChange={(v) => handleChange('transferEnabled', v)}
              desc={config.transferEnabled ? 'کاربران می‌توانند توکن انتقال دهند' : 'انتقال توکن غیرفعال است'}
            />
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {numField('transferFee', 'کارمزد ثابت انتقال', 'ALC', 'مبلغ ثابت کسر شده از فرستنده')}
            {numField('transferFeePercent', 'کارمزد درصدی انتقال', '%', 'درصدی از مبلغ انتقال')}
          </div>
        </section>

        {/* --- Gift Card Section --- */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-base">🎁</div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">تنظیمات کارت هدیه</h2>
              <p className="text-xs text-gray-400">ایجاد و استفاده از کارت‌های هدیه</p>
            </div>
          </div>
          <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50">
            <Toggle
              label="فعال بودن کارت هدیه"
              checked={config.giftCardEnabled}
              onChange={(v) => handleChange('giftCardEnabled', v)}
              desc={config.giftCardEnabled ? 'کاربران می‌توانند کارت هدیه ایجاد کنند' : 'کارت هدیه غیرفعال است'}
            />
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {numField('minGiftCardAmount', 'حداقل مبلغ کارت هدیه', 'ALC')}
            {numField('maxGiftCardAmount', 'حداکثر مبلغ کارت هدیه', 'ALC')}
            {numField('maxGiftCardsPerUser', 'حداکثر کارت هدیه فعال هر کاربر', 'عدد')}
            {numField('giftCardExpiryDays', 'مدت اعتبار کارت هدیه', 'روز', 'کارت‌ها بعد از این مدت منقضی می‌شوند')}
          </div>
        </section>
      </div>
    </div>
  );
}
