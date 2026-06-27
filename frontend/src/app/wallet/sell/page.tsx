'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { requestSell, getTokenConfig, getProfile, updateProfile } from '@/lib/api';
import type { TokenConfig, User } from '@/types';

function NumInput({ value, onChange, label, suffix }: { value: string; onChange: (v: string) => void; label: string; suffix?: string }) {
  const [focused, setFocused] = useState(false);
  const num = +value;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-custom mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={focused ? value : (num ? num.toLocaleString('en-US') : '')}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, '');
            if (raw === '' || /^\d*$/.test(raw)) onChange(raw);
          }}
          className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-right text-white placeholder-gray-custom/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          placeholder="مثلا ۵۰۰"
        />
        {suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-custom">{suffix}</span>}
      </div>
    </div>
  );
}

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<TokenConfig | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [shebaNumber, setShebaNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const token = localStorage.getItem('access_token');
    if (!token) return;
    Promise.all([getTokenConfig(token), getProfile(token)])
      .then(([cfg, prof]) => {
        setConfig(cfg);
        setProfile(prof);
        setCardNumber(prof.cardNumber || '');
        setShebaNumber(prof.shebaNumber || '');
      })
      .catch(() => {});
  }, [user, router]);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setSavingProfile(true);
    try {
      await updateProfile(token, { cardNumber, shebaNumber } as any);
      setMessage({ type: 'success', text: 'اطلاعات بانکی با موفقیت ذخیره شد' });
    } catch {
      setMessage({ type: 'error', text: 'خطا در ذخیره اطلاعات بانکی' });
    } finally { setSavingProfile(false); }
  };

  const handleSell = async () => {
    const tokenAmount = +amount;
    if (!tokenAmount || tokenAmount <= 0) {
      setMessage({ type: 'error', text: 'مقدار معتبر وارد کنید' });
      return;
    }
    if (!cardNumber.trim() && !shebaNumber.trim()) {
      setMessage({ type: 'error', text: 'لطفاً شماره کارت یا شماره شبا خود را وارد کنید' });
      return;
    }
    if (config && tokenAmount < config.minSellAmount) {
      setMessage({ type: 'error', text: `حداقل فروش ${config.minSellAmount.toLocaleString()} توکن می‌باشد` });
      return;
    }
    if (config && tokenAmount > config.maxSellAmount) {
      setMessage({ type: 'error', text: `حداکثر فروش ${config.maxSellAmount.toLocaleString()} توکن می‌باشد` });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await requestSell(token, tokenAmount, cardNumber.trim() || undefined, shebaNumber.trim() || undefined);
      setMessage({ type: 'success', text: 'درخواست فروش شما ثبت شد. مبلغ از موجودی شما بلاک و پس از بررسی واریز خواهد شد.' });
      setTimeout(() => router.push('/wallet'), 2500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'خطا در ثبت درخواست فروش' });
    } finally { setLoading(false); }
  };

  if (!user) return null;
  const tokenAmount = +amount || 0;
  const tomanAmount = config ? tokenAmount * config.tomanPerToken : 0;
  const hasBankInfo = cardNumber.trim() || shebaNumber.trim();

  return (
    <div className="min-h-screen pt-20 pb-16 bg-dark">
      <div className="max-w-lg mx-auto px-4">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-custom hover:text-white mb-6 transition-colors text-sm">
          <span>←</span> بازگشت
        </button>

        <div className="bg-dark-light/60 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center text-lg">💵</div>
            <h1 className="text-xl font-bold text-white">درخواست فروش توکن</h1>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-xl text-sm border ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {message.text}
            </div>
          )}

          {config && (
            <div className="mb-5 p-4 bg-accent/5 border border-accent/10 rounded-xl text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-custom">قیمت هر توکن:</span><span className="text-white font-medium">{config.tomanPerToken.toLocaleString()} تومان</span></div>
              {config.minSellAmount > 0 && <div className="flex justify-between"><span className="text-gray-custom">حداقل فروش:</span><span className="text-white">{config.minSellAmount.toLocaleString()} ALC</span></div>}
              {config.maxSellAmount > 0 && <div className="flex justify-between"><span className="text-gray-custom">حداکثر فروش:</span><span className="text-white">{config.maxSellAmount.toLocaleString()} ALC</span></div>}
              {config.sellCooldownHours > 0 && <div className="flex justify-between"><span className="text-gray-custom">محدودیت زمانی:</span><span className="text-white">{config.sellCooldownHours} ساعت</span></div>}
            </div>
          )}

          <div className="mb-5">
            <NumInput value={amount} onChange={setAmount} label="مقدار توکن برای فروش" suffix="ALC" />
          </div>

          {tomanAmount > 0 && (
            <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <span className="text-sm text-gray-custom">مبلغ دریافتی: </span>
              <span className="font-bold text-xl text-emerald-400">{tomanAmount.toLocaleString()}</span>
              <span className="text-sm text-gray-custom mr-1">تومان</span>
            </div>
          )}

          {/* Card & Sheba Section */}
          <div className="mb-5 p-4 bg-dark/60 border border-white/5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center text-xs">🏦</span>
                اطلاعات حساب بانکی
              </h3>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                به نام {user.fullName}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-custom mb-1.5">شماره کارت</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-left text-white placeholder-gray-custom/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="۶۲۱۹-۸۶۱۹-****-****"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-custom mb-1.5">شماره شبا</label>
              <input
                type="text"
                value={shebaNumber}
                onChange={(e) => setShebaNumber(e.target.value)}
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-left text-white placeholder-gray-custom/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="IR..."
                dir="ltr"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile || (!cardNumber.trim() && !shebaNumber.trim())}
              className="w-full bg-dark-light border border-white/10 hover:border-accent/30 text-gray-custom hover:text-white py-2 rounded-lg text-xs font-medium disabled:opacity-40 transition-all"
            >
              {savingProfile ? 'در حال ذخیره...' : '💾 ذخیره در پروفایل'}
            </button>
          </div>

          <div className="mb-5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400">
            توجه: با ثبت درخواست، مبلغ توکن از موجودی شما بلاک می‌شود. در صورت تایید توسط مدیر، مبلغ به حساب بانکی شما واریز خواهد شد. در صورت رد، توکن‌ها به موجودی شما بازمی‌گردد.
          </div>

          <button
            onClick={handleSell}
            disabled={loading || !amount}
            className="w-full bg-accent hover:bg-accent/90 text-white py-3.5 rounded-xl font-bold disabled:opacity-40 transition-all shadow-lg shadow-accent/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                در حال ثبت...
              </span>
            ) : 'ثبت درخواست فروش'}
          </button>
        </div>
      </div>
    </div>
  );
}
