"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/types";

const sectionLabels: Record<string, string> = {
  blog: "وبلاگ",
  "action-cinema": "اکشن نما",
  "action-game": "اکشن گیم",
  "action-trip": "اکشن تریپ",
  "action-fit": "اکشن فیت",
  "action-media": "اکشن مدیا",
};

function SidebarCard({ article }: { article: Article }) {
  const href = `/${article.section === "blog" ? "blog" : article.section}/${article.slug}`;
  return (
    <Link
      href={href}
      className="group flex gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2 transition-all duration-300 hover:border-accent/40 hover:bg-white/10"
    >
      <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-white/5">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-custom">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="inline-block px-1.5 py-0.5 text-[9px] gradient-primary text-white rounded mb-1">
          {sectionLabels[article.section] || article.section}
        </span>
        <h3 className="text-white text-[11px] font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

export default function HomeShell({
  latest,
  children,
}: {
  latest: Article[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const hasLatest = latest.length > 0;

  return (
    <>
      {/* سایدبار آخرین مطالب — لبه راست */}
      {hasLatest && (
        <aside
          className={`fixed top-0 right-0 z-40 h-dvh w-[230px] md:w-[280px] transition-transform duration-500 ease-in-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* دکمه باز/بسته — بیرون از پنل، چسبیده به دیوار راست */}
          <button
            type="button"
            aria-label={open ? "بستن آخرین مطالب" : "نمایش آخرین مطالب"}
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
            <span className="text-[10px] font-bold [writing-mode:vertical-rl]">آخرین مطالب</span>
          </button>

          {/* بدنه پنل */}
          <div className="h-full flex flex-col bg-dark/70 backdrop-blur-xl border-l border-white/10">
            <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
              <span className="w-1.5 h-5 gradient-primary rounded-full inline-block" />
              <h2 className="text-white font-bold text-sm md:text-base">آخرین مطالب</h2>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-2.5">
              {latest.map((article) => (
                <SidebarCard key={article._id} article={article} />
              ))}
              <Link
                href="/blog"
                className="block text-center text-accent hover:text-white text-xs font-bold py-2.5 rounded-xl border border-white/10 hover:border-accent/40 transition-colors"
              >
                مشاهده همه مطالب
              </Link>
            </div>
          </div>
        </aside>
      )}

      {/* محتوای صفحه — با باز بودن سایدبار، در دسکتاپ کنار می‌رود */}
      <div
        className={`transition-[margin] duration-500 ease-in-out ${
          hasLatest && open ? "md:mr-[280px]" : "mr-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}
