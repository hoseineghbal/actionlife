'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { transferTokens, getTokenConfig } from '@/lib/api';
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
          placeholder="مثلا ۵۰"
        />
        {suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-custom">{suffix}</span>}
      </div>
    </div>
  );
}

export default function TransferPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<TokenConfig | null>(null);
  const [targetType, setTargetType] = useState<'username' | 'mobile'>('username');
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const token = localStorage.getItem('access_token');
    if (!token) return;
    getTokenConfig(token).then(setConfig).catch(() => {});
  }, [user, router]);

  const handleTransfer = async () => {
    if (!target.trim()) {
      setMessage({
        type: 'error',
        text: targetType === 'username' ? 'نام کاربری مقصد را وارد کنید' : 'شماره موبایل مقصد را وارد کنید',
      });
      return;
    }
    const tokenAmount = +amount;
    if (!tokenAmount || tokenAmount <= 0) { setMessage({ type: 'error', text: 'مقدار معتبر وارد کنید' }); return; }
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const mobile = targetType === 'mobile' ? target.trim() : '';
      const username = targetType === 'username' ? target.trim() : '';
      await transferTokens(token, mobile, username, tokenAmount, description || undefined);
      setMessage({ type: 'success', text: `انتقال ${tokenAmount.toLocaleString()} توکن با موفقیت انجام شد` });
      setTimeout(() => router.push('/wallet'), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'خطا در انتقال توکن' });
    } finally { setLoading(false); }
  };

  if (!user) return null;

  let feeText = '';
  if (config) {
    if (config.transferFee > 0) feeText = `کارمزد انتقال: ${config.transferFee.toLocaleString()} ALC (ثابت)`;
    else if (config.transferFeePercent > 0) feeText = `کارمزد انتقال: ${config.transferFeePercent}٪`;
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-dark">
      <div className="max-w-lg mx-auto px-4">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-custom hover:text-white mb-6 transition-colors text-sm">
          <span>←</span> بازگشت
        </button>

        <div className="bg-dark-light/60 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center text-lg">📤</div>
            <h1 className="text-xl font-bold text-white">انتقال توکن</h1>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-xl text-sm border ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {message.text}
            </div>
          )}

          {feeText && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">{feeText}</div>
          )}

          {/* Target Type Tabs */}
          <div className="flex gap-1 mb-5 bg-dark rounded-xl p-1 border border-white/10">
            <button
              onClick={() => { setTargetType('username'); setTarget(''); setMessage(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                targetType === 'username' ? 'bg-accent text-white shadow-lg' : 'text-gray-custom hover:text-white'
              }`}
            >
              نام کاربری
            </button>
            <button
              onClick={() => { setTargetType('mobile'); setTarget(''); setMessage(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                targetType === 'mobile' ? 'bg-accent text-white shadow-lg' : 'text-gray-custom hover:text-white'
              }`}
            >
              شماره موبایل
            </button>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-custom mb-1.5">
              {targetType === 'username' ? 'نام کاربری مقصد' : 'شماره موبایل مقصد'}
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-left text-white placeholder-gray-custom/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              placeholder={targetType === 'username' ? 'مثلاً alireza' : '+989121111111'}
              dir="ltr"
            />
          </div>

          <div className="mb-5">
            <NumInput value={amount} onChange={setAmount} label="مقدار توکن" suffix="ALC" />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-custom mb-1.5">توضیحات (اختیاری)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-right text-white placeholder-gray-custom/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              placeholder="توضیح برای گیرنده"
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={loading || !target.trim() || !amount}
            className="w-full bg-accent hover:bg-accent/90 text-white py-3.5 rounded-xl font-bold disabled:opacity-40 transition-all shadow-lg shadow-accent/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                در حال انتقال...
              </span>
            ) : 'ارسال توکن'}
          </button>
        </div>
      </div>
    </div>
  );
}
