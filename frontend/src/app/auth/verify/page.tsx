"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp, sendOtp } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const mobile = searchParams.get("mobile") || "";
  const countryCode = searchParams.get("countryCode") || "+98";

  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(120);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (value && index === 3) {
      const fullCode = newCode.join("");
      if (fullCode.length === 4) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const fullCode = otpCode || code.join("");
    if (fullCode.length !== 4) {
      setError("لطفاً کد ۴ رقمی را وارد کنید");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await verifyOtp(mobile, fullCode, countryCode);
      login(res.access_token, res.user);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "کد تأیید اشتباه است");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");

    try {
      const res = await sendOtp(mobile, countryCode);
      setTimer(120);
      setCode(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("خطا در ارسال مجدد کد");
    } finally {
      setResending(false);
    }
  };

  if (!mobile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="bg-dark-light border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-gray-custom">شماره موبایل یافت نشد.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-dark-light border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">تأیید شماره موبایل</h1>
            <p className="text-gray-custom text-sm">
              کد ۴ رقمی ارسال شده به
            </p>
            <p className="text-accent font-bold mt-1" dir="ltr">{countryCode} {mobile}</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-3" dir="ltr">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-xl font-bold bg-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                  autoFocus={index === 0}
                  inputMode="numeric"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "در حال تأیید..." : "تأیید کد"}
            </button>
          </form>

          <div className="text-center mt-6">
            {timer > 0 ? (
              <p className="text-gray-custom text-sm">
                ارسال مجدد کد تا {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")} دیگر
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-accent hover:underline text-sm disabled:opacity-50"
              >
                {resending ? "در حال ارسال..." : "ارسال مجدد کد"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
