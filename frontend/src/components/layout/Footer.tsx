"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { subscribeNewsletter } from "@/lib/api";

const footerLinks = [
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
  { label: "همکاری با ما", href: "/cooperation" },
  { label: "قوانین", href: "/terms" },
];

const socialLinks = [
  { label: "اینستاگرام", href: "#", icon: "📸" },
  { label: "تلگرام", href: "#", icon: "✈️" },
  { label: "یوتیوب", href: "#", icon: "▶️" },
  { label: "آپارات", href: "#", icon: "🎬" },
  { label: "توییتر", href: "#", icon: "🐦" },
];

export default function Footer() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await subscribeNewsletter(email);
      setMessage({ type: "success", text: res.message });
      setEmail("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message ?? "خطا در ثبت ایمیل" });
    } finally {
      setLoading(false);
    }
  };

  // صفحه اصلی فوتر ندارد
  if (pathname === "/") return null;

  return (
    <footer className="bg-dark-light border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
        {/* Top row: logo + links + social */}
        <div className="flex items-center justify-between flex-wrap gap-y-2 gap-x-4 text-sm">
          {/* لوگو و نام سایت */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 gradient-primary rounded-md flex items-center justify-center font-bold text-white text-xs">
              AL
            </div>
            <span className="font-bold text-white whitespace-nowrap text-sm">
              Action Life
            </span>
          </div>

          {/* Footer Links */}
          <div className="flex items-center gap-4 flex-wrap">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-custom hover:text-white text-xs transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* شبکه‌های اجتماعی */}
          <div className="flex items-center gap-1.5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 bg-white/5 hover:bg-accent/20 border border-white/10 rounded-md flex items-center justify-center text-xs text-gray-custom hover:text-accent transition-all"
                aria-label={social.label}
                title={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row: newsletter + copyright */}
        <div className="flex items-center justify-between flex-wrap gap-y-2 gap-x-4 text-sm">
          {/* عضویت در خبرنامه - فقط برای کاربران مهمان */}
          {!user && (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 max-w-sm min-w-0"
            >
              <span className="text-gray-custom whitespace-nowrap text-xs">
                خبرنامه:
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل خود را وارد کنید"
                className="flex-1 min-w-0 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-xs text-white placeholder:text-gray-custom focus:outline-none focus:border-accent"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 gradient-primary text-white text-xs rounded-md hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "..." : "عضویت"}
              </button>
            </form>
          )}
          {message && (
            <div
              className={`text-xs ${
                message.type === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* کپی‌رایت */}
          <div className="text-gray-custom text-xs whitespace-nowrap">
            &copy; {new Date().getFullYear()} Action Life
          </div>
        </div>
      </div>
    </footer>
  );
}
