import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

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

export default function Login() {
  const [countryCode, setCountryCode] = useState('+98');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(mobile, password, countryCode);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="Action Life" className="h-16 w-auto mb-3" />
          <p className="text-muted">ورود به پنل مدیریت</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              شماره موبایل
            </label>
            <div className="flex gap-2" dir="ltr">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition appearance-none cursor-pointer"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
                placeholder="9123456789"
                dir="ltr"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رمز عبور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  );
}
