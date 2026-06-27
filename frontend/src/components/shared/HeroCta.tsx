"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function HeroCta() {
  const { user } = useAuth();

  return (
    <div className="absolute bottom-24 left-4 md:left-8 z-20 animate-fade-in-up">
      <div className="inline-flex flex-wrap gap-2 bg-dark/60 backdrop-blur-md border border-white/10 rounded-xl p-2.5">
        <Link
          href="/blog"
          className="px-3 py-2 md:px-5 md:py-2.5 gradient-primary text-white rounded-lg font-bold hover:opacity-90 transition-all duration-200 text-[11px] md:text-sm shadow-lg shadow-accent/20"
        >
          آخرین مطالب
        </Link>
        {!user && (
          <>
            <Link
              href="/auth/login"
              className="px-3 py-2 md:px-5 md:py-2.5 bg-white/10 text-white border border-white/20 rounded-lg font-bold hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-[11px] md:text-sm"
            >
              ورود
            </Link>
            <Link
              href="/auth/register"
              className="px-3 py-2 md:px-5 md:py-2.5 bg-white/10 text-white border border-white/20 rounded-lg font-bold hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-[11px] md:text-sm"
            >
              ثبت نام
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
