'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { redeemGiftCard, getMyGiftCards } from '@/lib/api';
import type { GiftCard } from '@/types';

const statusStyles: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'فعال', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  redeemed: { label: 'استفاده شده', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  expired: { label: 'منقضی شده', bg: 'bg-rose-500/10', text: 'text-rose-400' },
};

export default function GiftCardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'redeem' | 'list'>('redeem');
  const [code, setCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (tab === 'list') {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      setListLoading(true);
      getMyGiftCards(token).then(setCards).catch(() => {}).finally(() => setListLoading(false));
    }
  }, [tab, user, router]);

  const handleRedeem = async () => {
    if (!code.trim()) { setFeedback({ type: 'error', text: 'کد کارت هدیه را وارد کنید' }); return; }
    setRedeemLoading(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const card = await redeemGiftCard(token, code.trim());
      setFeedback({ type: 'success', text: `کارت هدیه به ارزش ${card.amount.toLocaleString()} توکن دریافت شد` });
      setCode('');
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'خطا در دریافت کارت هدیه' });
    } finally { setRedeemLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 pb-16 bg-dark">
      <div className="max-w-lg mx-auto px-4">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-custom hover:text-white mb-6 transition-colors text-sm">
          <span>←</span> بازگشت
        </button>

        <div className="bg-dark-light/60 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center text-lg">🎁</div>
            <h1 className="text-xl font-bold text-white">کارت هدیه ALC</h1>
          </div>

          {feedback && (
            <div className={`mb-4 p-3 rounded-xl text-sm border ${feedback.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              {feedback.text}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-dark rounded-xl p-1 border border-white/10">
            <button
              onClick={() => { setTab('redeem'); setFeedback(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'redeem' ? 'bg-accent text-white shadow-lg' : 'text-gray-custom hover:text-white'
              }`}
            >
              دریافت کارت هدیه
            </button>
            <button
              onClick={() => { setTab('list'); setFeedback(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'list' ? 'bg-accent text-white shadow-lg' : 'text-gray-custom hover:text-white'
              }`}
            >
              کارت‌های دریافتی
            </button>
          </div>

          {/* Redeem */}
          {tab === 'redeem' && (
            <div>
              <p className="text-sm text-gray-custom mb-5">اگر کد کارت هدیه دارید، آن را وارد کنید تا توکن به کیف پول شما اضافه شود.</p>
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-custom mb-1.5">کد کارت هدیه</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-dark border border-white/10 rounded-xl px-4 py-4 text-center text-white font-mono text-lg tracking-[0.3em] placeholder-gray-custom/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  placeholder="GC-XXXXXXXX"
                />
              </div>
              <button
                onClick={handleRedeem}
                disabled={redeemLoading || !code.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold disabled:opacity-40 transition-all shadow-lg shadow-emerald-600/20"
              >
                {redeemLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    در حال دریافت...
                  </span>
                ) : 'دریافت کارت هدیه'}
              </button>
            </div>
          )}

          {/* List */}
          {tab === 'list' && (
            <div>
              {listLoading ? (
                <p className="text-center text-gray-custom py-8">در حال بارگذاری...</p>
              ) : cards.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-gray-custom">
                  <span className="text-4xl mb-3">📭</span>
                  <p className="text-sm">هنوز کارت هدیه‌ای دریافت نکرده‌اید</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cards.map((card) => {
                    const ss = statusStyles[card.status] || statusStyles.active;
                    return (
                      <div key={card._id} className="p-4 bg-dark/60 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono font-bold text-sm text-foreground select-all">{card.code}</span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                            {card.amount.toLocaleString()} ALC
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-custom">
                          <span className={ss.text}>{ss.label}</span>
                          <span>{new Date(card.createdAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
