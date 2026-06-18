"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register as registerApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
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

    setLoading(true);

    try {
      const res = await registerApi(fullName, email, password);
      login(res.access_token, res.user);
      router.push("/");
    } catch {
      setError("خطا در ثبت نام. ممکن است این ایمیل قبلاً ثبت شده باشد.");
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
              <label htmlFor="email" className="block text-sm text-gray-custom mb-2">
                ایمیل
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white placeholder-gray-custom/50 focus:outline-none focus:border-primary transition-colors"
                placeholder="example@email.com"
                dir="ltr"
              />
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
