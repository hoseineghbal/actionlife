"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const usefulLinks = [
  { label: "خانه", href: "/" },
  { label: "فروشگاه", href: "/store" },
  { label: "زندگی اکشن", href: "/blog" },
  { label: "اکشن نما", href: "/action-cinema" },
  { label: "بازی اکشن", href: "/action-game" },
  { label: "اکشن تریپ", href: "/action-trip" },
  { label: "اکشن فیت", href: "/action-fit" },
  { label: "اکشن کلاب", href: "/action-club" },
  { label: "اکشن مدیا", href: "/action-media" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
  { label: "قوانین و مقررات", href: "/terms" },
  { label: "حریم خصوصی", href: "/privacy" },
  { label: "همکاری با ما", href: "/cooperation" },
  { label: "پرسش‌های متداول", href: "/faq" },
  { label: "راهنمای سایت", href: "/guide" },
];

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // در صفحه اصلی سایدبار نمایش داده نشود
  const isHome = pathname === "/";

  return (
    <>
      {!isHome && (
        <aside
          className={`fixed top-0 right-0 z-40 h-dvh w-[230px] md:w-[280px] transition-transform duration-500 ease-in-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* دکمه باز/بسته */}
          <button
            type="button"
            aria-label={open ? "بستن لینک‌های مفید" : "نمایش لینک‌های مفید"}
            onClick={() => setOpen(!open)}
            className="absolute top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1.5 rounded-l-xl rounded-r-none bg-dark/80 backdrop-blur-md border border-r-0 border-white/15 text-white px-1.5 py-3 hover:bg-dark hover:border-accent/40 transition-colors"
            style={{ right: "100%" }}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-500 ${open ? "" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[10px] font-bold [writing-mode:vertical-rl]">لینک‌های مفید</span>
          </button>

          {/* بدنه پنل */}
          <div className="h-full flex flex-col bg-dark/70 backdrop-blur-xl border-l border-white/10">
            <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
              <span className="w-1.5 h-5 gradient-primary rounded-full inline-block" />
              <h2 className="text-white font-bold text-sm md:text-base">لینک‌های مفید</h2>
            </div>
            <nav className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-1.5">
              {usefulLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    pathname === link.href
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "text-gray-custom hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* محتوای صفحه */}
      <div
        className={`flex flex-col flex-1 transition-[margin] duration-500 ease-in-out ${
          !isHome && open ? "md:mr-[280px]" : "mr-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}
