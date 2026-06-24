"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register as registerApi } from "@/lib/api";

const COUNTRY_CODES = [
  { code: '+98', flag: '🇮🇷', label: 'ایران' },
  { code: '+1', flag: '🇺🇸', label: 'آمریکا' },
  { code: '+44', flag: '🇬🇧', label: 'انگلیس' },
  { code: '+971', flag: '🇦🇪', label: 'امارات' },
  { code: '+966', flag: '🇸🇦', label: 'عربستان' },
  { code: '+49', flag: '🇩🇪', label: 'آلمان' },
  { code: '+33', flag: '🇫🇷', label: 'فرانسه' },
  { code: '+93', flag: '🇦🇫', label: 'افغانستان' },
  { code: '+964', flag: '🇮🇶', label: 'عراق' },
  { code: '+90', flag: '🇹🇷', label: 'ترکیه' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+98");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیست");
      return;
    }

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    if (!mobile.trim()) {
      setError("شماره موبایل را وارد کنید");
      return;
    }

    setLoading(true);

    try {
      const res = await registerApi(fullName, mobile, password, countryCode);
      // Redirect to verification page
      router.push(`/auth/verify?mobile=${mobile}&countryCode=${countryCode}`);
    } catch {
      setError("خطا در ثبت نام. ممکن است این شماره قبلاً ثبت شده باشد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-dark-light border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">ثبت نام</h1>
            <p className="text-gray-custom text-sm">
              به جمع اکشن‌لایف‌ها بپیوندید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm text-gray-custom mb-2">
                نام و نام خانوادگی
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-custom/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="نام کامل خود را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-custom mb-2">
                شماره موبایل
              </label>
              <div className="flex gap-2" dir="ltr">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-3 bg-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  id="mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-custom/50 focus:outline-none focus:border-primary transition-colors"
                  placeholder="9123456789"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-custom mb-2">
                رمز عبور
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-custom/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="حداقل ۶ کاراکتر"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-gray-custom mb-2">
                تکرار رمز عبور
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-custom/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="رمز عبور را دوباره وارد کنید"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "در حال ثبت نام..." : "ثبت نام"}
            </button>
          </form>

          <p className="text-center text-gray-custom text-sm mt-6">
            قبلاً ثبت نام کرده‌اید؟{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              وارد شوید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
