"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { label: "خانه", href: "/" },
  { label: "اکشن نما", href: "/action-cinema" },
  { label: "اکشن گیم", href: "/action-game" },
  { label: "اکشن تریپ", href: "/action-trip" },
  { label: "وبلاگ", href: "/blog" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-light/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* لوگو */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center font-bold text-white text-lg">
              AL
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
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
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-sm text-white">
                    {user.fullName}
                  </span>
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
                        <p className="text-xs text-gray-custom mt-0.5">{user.email}</p>
                      </div>
                      <div className="py-1">
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
