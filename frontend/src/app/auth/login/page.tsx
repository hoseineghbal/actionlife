"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [countryCode, setCountryCode] = useState("+98");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(mobile, password, countryCode);
      if (res.needsVerification) {
        router.push(`/auth/verify?mobile=${res.mobile}&countryCode=${res.countryCode}`);
        return;
      }
      login(res.access_token, res.user);
      router.push("/");
    } catch {
      setError("شماره موبایل یا رمز عبور اشتباه است");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-dark-light border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">ورود به حساب کاربری</h1>
            <p className="text-gray-custom text-sm">
              به Action Life خوش آمدید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

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
                placeholder="رمز عبور خود را وارد کنید"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "در حال ورود..." : "ورود"}
            </button>
          </form>

          <p className="text-center text-gray-custom text-sm mt-6">
            حساب کاربری ندارید؟{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              ثبت نام کنید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
