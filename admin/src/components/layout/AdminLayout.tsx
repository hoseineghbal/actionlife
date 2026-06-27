import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';

const navItems = [
  { to: '/', label: 'داشبورد', icon: '📊' },
  { to: '/articles', label: 'مقالات', icon: '📝' },
  { to: '/categories', label: 'دسته‌بندی‌ها', icon: '📂' },
  { to: '/users', label: 'کاربران', icon: '👥' },
  { to: '/tickets', label: 'تیکت‌ها', icon: '🎫' },
  { to: '/contacts', label: 'تماس با ما', icon: '📩' },
  { to: '/token-settings', label: 'تنظیمات توکن', icon: '⚙️' },
  { to: '/sell-requests', label: 'درخواست فروش', icon: '💰' },
  { to: '/transactions', label: 'تراکنش‌ها', icon: '🔄' },
  { to: '/gift-cards', label: 'کارت‌های هدیه', icon: '🎁' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-primary/30 flex flex-col items-center">
        <img src="/logo.png" alt="Action Life" className="h-12 w-auto mb-1" />
        <p className="text-muted text-sm">پنل مدیریت</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-hover text-white border-l-4 border-accent'
                  : 'text-muted hover:bg-sidebar-hover hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-sm font-bold">
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted" dir="ltr">{user?.countryCode} {user?.mobile}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-sm text-muted hover:text-white transition-colors text-right cursor-pointer"
        >
          خروج از حساب
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 bg-sidebar text-white flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Sidebar - mobile */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-sidebar text-white flex flex-col transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 left-4 p-1 text-muted hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between lg:hidden">
          <img src="/logo.png" alt="Action Life" className="h-8 w-auto" />
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
