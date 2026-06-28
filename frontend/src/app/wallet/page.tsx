'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getWallet, getTransactions, getTokenConfig } from '@/lib/api';
import type { WalletInfo, WalletTransaction, TokenConfig } from '@/types';

const typeStyles: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  purchase: { label: 'خرید توکن', icon: '🛒', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  transfer_sent: { label: 'انتقال (ارسال)', icon: '📤', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  transfer_received: { label: 'انتقال (دریافت)', icon: '📥', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  sell: { label: 'فروش توکن', icon: '💵', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  gift_card_create: { label: 'ایجاد کارت هدیه', icon: '🎁', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  gift_card_redeem: { label: 'دریافت کارت هدیه', icon: '🎫', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  shop_purchase: { label: 'خرید فروشگاه', icon: '🛍️', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  initial_bonus: { label: 'شارژ هدیه ثبت‌نام', icon: '🎉', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  admin_adjustment: { label: 'تنظیم توسط مدیر', icon: '⚙️', bg: 'bg-white/5', text: 'text-gray-custom', border: 'border-white/10' },
};

export default function WalletPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [config, setConfig] = useState<TokenConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const token = localStorage.getItem('access_token');
    if (!token) return;
    Promise.all([getWallet(token), getTransactions(token, page), getTokenConfig(token)])
      .then(([walletData, txData, configData]) => {
        setWallet(walletData);
        setTransactions(txData.transactions);
        setTotal(txData.total);
        setConfig(configData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, page, router]);

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const balance = wallet?.balance || 0;

  return (
    <div className="min-h-screen pt-20 pb-16 bg-dark">
      <div className="max-w-4xl mx-auto px-4 space-y-8">

        {/* Wallet Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/80 via-surface to-dark-light p-6 md:p-8 border border-white/10 shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground/80">کیف پول ALC</h2>
              <span className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-sm text-foreground">
                ۱ ALC = {config?.tomanPerToken?.toLocaleString() || '--'} تومان
              </span>
            </div>
            <div className="text-5xl md:text-6xl font-black text-white mb-1 tracking-tight">
              {balance.toLocaleString()}
              <span className="text-xl md:text-2xl font-bold text-foreground mr-2">ALC</span>
            </div>
            <p className="text-sm text-white/60">
              کل خرید: {(wallet?.totalPurchased || 0).toLocaleString()} ALC
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '➕', label: 'خرید توکن', href: '/wallet/purchase', color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20', hover: 'hover:border-emerald-500/40' },
            { icon: '📤', label: 'انتقال', href: '/wallet/transfer', color: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20', hover: 'hover:border-cyan-500/40' },
            { icon: '💵', label: 'فروش مجدد', href: '/wallet/sell', color: 'from-amber-500/20 to-amber-500/5 border-amber-500/20', hover: 'hover:border-amber-500/40' },
            { icon: '🎁', label: 'کارت هدیه', href: '/wallet/gift-card', color: 'from-purple-500/20 to-purple-500/5 border-purple-500/20', hover: 'hover:border-purple-500/40' },
          ].map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`bg-gradient-to-br ${item.color} bg-dark-light/60 backdrop-blur border ${item.hover} rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group`}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-medium text-foreground group-hover:text-white transition-colors">{item.label}</div>
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div className="bg-dark-light/60 backdrop-blur border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">تراکنش‌های اخیر</h3>
            <span className="text-xs text-gray-custom">{total.toLocaleString()} تراکنش</span>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-custom">
              <span className="text-4xl mb-3">📭</span>
              <p className="text-sm">هنوز تراکنشی انجام نشده است</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const ts = typeStyles[tx.type] || { label: tx.type, icon: '📌', bg: 'bg-white/5', text: 'text-gray-custom', border: 'border-white/10' };
                const isCredit = tx.type === 'purchase' || tx.type === 'transfer_received' || tx.type === 'initial_bonus' || tx.type === 'gift_card_redeem' || tx.type === 'admin_adjustment' || tx.type === 'shop_purchase' && tx.amount > 0;
                return (
                  <div key={tx._id} className={`flex items-center justify-between p-4 rounded-xl border ${ts.border} ${ts.bg} transition-colors hover:border-white/20`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                        {ts.icon}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${ts.text}`}>{ts.label}</p>
                        {(tx.type === 'transfer_sent' || tx.type === 'transfer_received') && tx.relatedUser && typeof tx.relatedUser === 'object' && (
                          <p className="text-xs text-gray-custom mt-0.5">
                            {tx.type === 'transfer_sent' ? 'به: ' : 'از: '}
                            {tx.relatedUser.username ? `@${tx.relatedUser.username}` : tx.relatedUser.fullName}
                          </p>
                        )}
                        {tx.type === 'sell' && tx.status === 'rejected' && (
                          <p className="text-xs text-rose-400 mt-0.5">رد شده — مبلغ بازگشت داده شد</p>
                        )}
                        {tx.type === 'sell' && tx.status === 'completed' && (
                          <p className="text-xs text-emerald-400 mt-0.5">تایید شده — مبلغ واریز شد</p>
                        )}
                        {tx.description && (
                          <p className="text-xs text-gray-custom mt-0.5">{tx.description}</p>
                        )}
                        <p className="text-xs text-gray-custom mt-0.5">{new Date(tx.createdAt).toLocaleDateString('fa-IR')}</p>
                      </div>
                    </div>
                    <div className={`text-left font-bold text-sm ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} ALC
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {total > 20 && (
            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm bg-dark-light border border-white/10 text-gray-custom rounded-xl hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors"
              >
                قبلی
              </button>
              <span className="text-sm text-gray-custom">صفحه {page} از {Math.ceil(total / 20)}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 20 >= total}
                className="px-4 py-2 text-sm bg-dark-light border border-white/10 text-gray-custom rounded-xl hover:text-white hover:border-white/20 disabled:opacity-30 transition-colors"
              >
                بعدی
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
