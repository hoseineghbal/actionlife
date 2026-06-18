import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';

const navItems = [
  { to: '/', label: 'داشبورد', icon: '📊' },
  { to: '/users', label: 'کاربران', icon: '👥' },
  { to: '/tickets', label: 'تیکت‌ها', icon: '🎫' },
  { to: '/contacts', label: 'تماس با ما', icon: '📩' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-indigo-800">
          <h1 className="text-xl font-bold">Action Life</h1>
          <p className="text-indigo-300 text-sm mt-1">پنل مدیریت</p>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-hover text-white border-l-4 border-indigo-400'
                    : 'text-indigo-200 hover:bg-sidebar-hover hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.fullName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-indigo-300">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-indigo-300 hover:text-white transition-colors text-right cursor-pointer"
          >
            خروج از حساب
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
