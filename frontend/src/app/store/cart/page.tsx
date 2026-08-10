"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { purchaseProduct } from "@/lib/api";
import type { CartItem } from "@/types";

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    } catch {
      setCart([]);
    }
  }, []);

  const removeFromCart = (productId: string) => {
    const updated = cart.filter((i) => i.productId !== productId);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("fa-IR").format(p);

  const totalAmount = cart.reduce((sum, item) => {
    return sum + (item.discountPrice > 0 ? item.discountPrice : item.price);
  }, 0);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (cart.length === 0) return;

    setCheckingOut(true);
    const token = localStorage.getItem("access_token")!;
    let successCount = 0;
    const failedItems: string[] = [];

    for (const item of cart) {
      try {
        await purchaseProduct(token, { productId: item.productId, quantity: (item as any).quantity ?? 1 });
        successCount++;
      } catch (err: any) {
        const msg = err?.message ?? "";
        failedItems.push(`${item.title}${msg ? ` (${msg})` : ""}`);
      }
    }

    // Clear cart for successfully purchased items
    const remaining = cart.filter((i) => !failedItems.some((f) => f.startsWith(i.title)));
    setCart(remaining);
    localStorage.setItem("cart", JSON.stringify(remaining));
    window.dispatchEvent(new Event("cart-updated"));

    setCheckingOut(false);

    if (failedItems.length === 0) {
      alert("همه محصولات با موفقیت خریداری شدند!");
      router.push("/store");
    } else if (successCount > 0) {
      alert(`${successCount} محصول با موفقیت خریداری شد.\nناموفق:\n${failedItems.join("\n")}`);
    } else {
      alert(`خرید ناموفق:\n${failedItems.join("\n")}`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-dark-light mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">سبد خرید خالی است</h1>
          <p className="text-gray-custom mb-6">محصولی به سبد خرید اضافه نشده است</p>
          <Link
            href="/store"
            className="inline-flex px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl transition-colors"
          >
            رفتن به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <section className="border-b border-white/5 bg-dark-light/50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-black text-white mb-2">سبد خرید</h1>
          <p className="text-gray-custom">{cart.length} محصول در سبد خرید</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4 bg-dark-light border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
              >
                <Link href={`/store/${item.slug}`} className="shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl overflow-hidden">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-custom/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/store/${item.slug}`} className="text-white font-bold hover:text-accent transition-colors line-clamp-1">
                    {item.title}
                  </Link>
                  <p className="text-gray-custom text-sm">{item.sellerName}</p>
                  <div className="mt-1">
                    {item.discountPrice > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-accent font-bold">{formatPrice(item.discountPrice)}</span>
                        <span className="text-gray-custom text-sm line-through">{formatPrice(item.price)}</span>
                      </div>
                    ) : (
                      <span className="text-accent font-bold">{formatPrice(item.price)}</span>
                    )}
                    <span className="text-gray-custom text-xs mr-1">توکن</span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-gray-custom hover:text-red-400 transition-colors"
                  title="حذف"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-dark-light border border-white/5 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">خلاصه سفارش</h3>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-custom truncate max-w-[60%]">{item.title}</span>
                    <span className="text-white font-medium">
                      {formatPrice(item.discountPrice > 0 ? item.discountPrice : item.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-custom">جمع کل:</span>
                  <div>
                    <span className="text-2xl font-black text-accent">{formatPrice(totalAmount)}</span>
                    <span className="text-gray-custom text-sm mr-1">توکن</span>
                  </div>
                </div>
              </div>

              {!user ? (
                <Link
                  href="/auth/login"
                  className="block w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl text-center transition-colors"
                >
                  ورود به حساب برای خرید
                </Link>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut || cart.length === 0}
                  className="w-full py-4 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-accent/20"
                >
                  {checkingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      در حال پردازش...
                    </span>
                  ) : (
                    "تسویه حساب"
                  )}
                </button>
              )}

              <Link
                href="/store"
                className="block w-full py-3 text-center text-gray-custom hover:text-white text-sm mt-3 transition-colors"
              >
                ادامه خرید
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
