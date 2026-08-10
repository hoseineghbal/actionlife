"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getWallet } from "@/lib/api";

const navItems = [
  { label: "خانه", href: "/" },
  { label: "فروشگاه", href: "/store" },
  { label: "اکشن نما", href: "/action-cinema" },
  { label: "بازی اکشن", href: "/action-game" },
  { label: "سفر اکشن", href: "/action-trip" },
  { label: "وبلاگ زندگی اکشن", href: "/blog" },
  { label: "درباره زندگی اکشن", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && user) {
      getWallet(token)
        .then((w) => setWalletBalance(w.balance))
        .catch(() => setWalletBalance(0));
    } else {
      setWalletBalance(null);
    }
  }, [user]);

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(cart.length);
      } catch {
        setCartCount(0);
      }
    };
    update();
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    router.push("/");
  };

  // صفحه اصلی هدر ندارد
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 bg-dark-light/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* لوگو */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img src="/logo.png" alt="Action Life" className="h-12 w-auto" />
            <span className="text-white font-extrabold text-lg tracking-wide whitespace-nowrap hidden sm:inline">
              Action Life
            </span>
          </Link>

          {/* منوی دسکتاپ */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-gray-custom hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* دکمه‌های سمت چپ */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/store/cart"
              className="relative p-2 text-gray-custom hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">
                        {user.fullName}
                      </span>
                      {walletBalance !== null && (
                        <span className="text-xs text-accent font-bold bg-accent/10 px-2 py-0.5 rounded-lg">
                          {new Intl.NumberFormat("fa-IR").format(walletBalance)} توکن
                        </span>
                      )}
                    </div>
                    <span className="block text-xs text-gray-custom" dir="ltr">
                      {user.countryCode} {user.mobile}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-custom transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-56 bg-dark-light border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm text-white font-medium">{user.fullName}</p>
                        <p className="text-xs text-gray-custom mt-0.5" dir="ltr">
                          {user.countryCode} {user.mobile}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/wallet"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-custom hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          کیف پول ALC
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-custom hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          پروفایل
                        </Link>
                        <Link
                          href="/articles/new"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-custom hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          ارسال مقاله
                        </Link>
                        <Link
                          href="/articles/my"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-custom hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          مقالات من
                        </Link>
                        {(user.hasStore || user.role === "admin") && (
                          <>
                            <Link
                              href="/studio"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              استودیو
                            </Link>
                            <Link
                              href="/store/add"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-custom hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              افزودن محصول
                            </Link>
                            <Link
                              href="/store/my-products"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-custom hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              مدیریت فروشگاه
                            </Link>
                          </>
                        )}
                        <Link
                          href="/tickets"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-custom hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          تیکت‌های پشتیبانی
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          خروج از حساب
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:block px-4 py-2 text-sm text-gray-custom hover:text-white transition-colors"
                >
                  ورود
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  ثبت نام
                </Link>
              </>
            )}

            {/* دکمه منوی موبایل */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-custom hover:text-white"
              aria-label="منو"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* منوی موبایل */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 border-t border-white/10 mt-2 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-custom hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-custom hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  پروفایل
                </Link>
                <Link
                  href="/tickets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-custom hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  تیکت‌های پشتیبانی
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="block w-full text-right px-4 py-3 text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                  خروج از حساب
                </button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
