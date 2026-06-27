'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { purchaseTokens, getTokenConfig } from '@/lib/api';
import type { TokenConfig } from '@/types';

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
          placeholder="مثلا ۱۰۰"
        />
        {suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-custom">{suffix}</span>}
      </div>
    </div>
  );
}

export default function PurchasePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<TokenConfig | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const token = localStorage.getItem('access_token');
    if (!token) return;
    getTokenConfig(token).then(setConfig).catch(() => {});
  }, [user, router]);

  const handlePurchase = async () => {
    const tokenAmount = +amount;
    if (!tokenAmount || tokenAmount <= 0) {
      setMessage({ type: 'error', text: 'مقدار معتبر وارد کنید' });
      return;
    }
    if (config && tokenAmount < config.minPurchaseAmount) {
      setMessage({ type: 'error', text: `حداقل خرید ${config.minPurchaseAmount.toLocaleString()} توکن می‌باشد` });
      return;
    }
    if (config && tokenAmount > config.maxPurchaseAmount) {
      setMessage({ type: 'error', text: `حداکثر خرید ${config.maxPurchaseAmount.toLocaleString()} توکن می‌باشد` });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      await purchaseTokens(token, tokenAmount);
      setMessage({ type: 'success', text: `خرید ${tokenAmount.toLocaleString()} توکن با موفقیت انجام شد` });
      setTimeout(() => router.push('/wallet'), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'خطا در خرید توکن' });
    } finally { setLoading(false); }
  };

  if (!user) return null;
  const tokenAmount = +amount || 0;
  const tomanAmount = config ? tokenAmount * config.tomanPerToken : 0;

  return (
    <div className="min-h-screen pt-20 pb-16 bg-dark">
      <div className="max-w-lg mx-auto px-4">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-custom hover:text-white mb-6 transition-colors text-sm">
          <span>←</span> بازگشت
        </button>

        <div className="bg-dark-light/60 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center text-lg">🛒</div>
            <h1 className="text-xl font-bold text-white">خرید توکن ALC</h1>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-xl text-sm border ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {message.text}
            </div>
          )}

          {config && (
            <div className="mb-5 p-4 bg-accent/5 border border-accent/10 rounded-xl text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-custom">قیمت هر توکن:</span><span className="text-white font-medium">{config.tomanPerToken.toLocaleString()} تومان</span></div>
              {config.minPurchaseAmount > 0 && <div className="flex justify-between"><span className="text-gray-custom">حداقل خرید:</span><span className="text-white">{config.minPurchaseAmount.toLocaleString()} ALC</span></div>}
              {config.maxPurchaseAmount > 0 && <div className="flex justify-between"><span className="text-gray-custom">حداکثر خرید:</span><span className="text-white">{config.maxPurchaseAmount.toLocaleString()} ALC</span></div>}
            </div>
          )}

          <div className="mb-5">
            <NumInput value={amount} onChange={setAmount} label="مقدار توکن" suffix="ALC" />
          </div>

          {tomanAmount > 0 && (
            <div className="mb-5 p-4 bg-accent/10 border border-accent/20 rounded-xl text-center">
              <span className="text-sm text-gray-custom">مبلغ معادل: </span>
              <span className="font-bold text-xl text-white">{tomanAmount.toLocaleString()}</span>
              <span className="text-sm text-gray-custom mr-1">تومان</span>
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={loading || !amount}
            className="w-full bg-accent hover:bg-accent/90 text-white py-3.5 rounded-xl font-bold disabled:opacity-40 transition-all shadow-lg shadow-accent/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                در حال پردازش...
              </span>
            ) : 'خرید توکن'}
          </button>
        </div>
      </div>
    </div>
  );
}
