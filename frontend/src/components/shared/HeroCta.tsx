"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { subscribeNewsletter } from "@/lib/api";

export default function HeroCta() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await subscribeNewsletter(email);
      setMessage(res.message);
      setMessageType("success");
      setEmail("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در عضویت. لطفا دوباره تلاش کنید.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-24 left-4 md:left-8 z-20 animate-fade-in-up flex flex-col gap-2">
      {/* باکس دکمه‌ها */}
      <div className="inline-flex flex-wrap items-center gap-2 bg-dark/60 backdrop-blur-md border border-white/10 rounded-xl p-2.5">
        <Link
          href="/blog"
          className="px-3 py-2 md:px-5 md:py-2.5 gradient-primary text-white rounded-lg font-bold hover:opacity-90 transition-all duration-200 text-[11px] md:text-sm shadow-lg shadow-accent/20 whitespace-nowrap"
        >
          آخرین مطالب
        </Link>
        {!user && (
          <>
            <Link
              href="/auth/login"
              className="px-3 py-2 md:px-5 md:py-2.5 bg-white/10 text-white border border-white/20 rounded-lg font-bold hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-[11px] md:text-sm whitespace-nowrap"
            >
              ورود
            </Link>
            <Link
              href="/auth/register"
              className="px-3 py-2 md:px-5 md:py-2.5 bg-white/10 text-white border border-white/20 rounded-lg font-bold hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-[11px] md:text-sm whitespace-nowrap"
            >
              ثبت نام
            </Link>
          </>
        )}
      </div>

      {/* باکس خبرنامه (زیر باکس دکمه‌ها) */}
      {!user && (
        <div className="bg-dark/60 backdrop-blur-md border border-white/10 rounded-xl p-2.5">
          <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
            <input
              type="email"
              placeholder="ایمیل خود را وارد کنید"
              className="flex-1 min-w-0 px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-[11px] md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-white/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="shrink-0 px-3 py-2 md:px-5 md:py-2.5 gradient-primary text-white rounded-lg font-bold hover:opacity-90 transition-all duration-200 text-[11px] md:text-sm shadow-lg shadow-accent/20 whitespace-nowrap"
              disabled={loading}
            >
              {loading ? "..." : "عضویت"}
            </button>
            {message && (
              <span className={`text-[10px] md:text-xs whitespace-nowrap ${messageType === "success" ? "text-green-400" : "text-red-400"}`}>
                {message}
              </span>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
