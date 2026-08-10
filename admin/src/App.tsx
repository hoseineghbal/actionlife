import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Tickets from './pages/Tickets';
import TicketChat from './pages/TicketChat';
import Contacts from './pages/Contacts';
import Categories from './pages/Categories';
import Articles from './pages/Articles';
import ArticleForm from './pages/ArticleForm';
import TokenSettings from './pages/TokenSettings';
import SellRequests from './pages/SellRequests';
import TransactionsAdmin from './pages/TransactionsAdmin';
import GiftCardsAdmin from './pages/GiftCardsAdmin';
import StoreProducts from './pages/StoreProducts';
import Sections from './pages/Sections';
import type { UserPermission } from './types';

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  requiredPermission?: UserPermission;
  index?: boolean;
}

const adminRoutes: RouteConfig[] = [
  { path: '/', element: <Dashboard />, requiredPermission: 'dashboard:view' },
  { path: '/users', element: <Users />, requiredPermission: 'users:view' },
  { path: '/tickets', element: <Tickets />, requiredPermission: 'tickets:view' },
  { path: '/tickets/:id', element: <TicketChat />, requiredPermission: 'tickets:view' },
  { path: '/contacts', element: <Contacts />, requiredPermission: 'contacts:view' },
  { path: '/categories', element: <Categories />, requiredPermission: 'categories:view' },
  { path: '/articles', element: <Articles />, requiredPermission: 'articles:view' },
  { path: '/articles/new', element: <ArticleForm />, requiredPermission: 'articles:create' },
  { path: '/articles/:id', element: <ArticleForm />, requiredPermission: 'articles:edit' },
  { path: '/token-settings', element: <TokenSettings />, requiredPermission: 'token_settings:view' },
  { path: '/sell-requests', element: <SellRequests />, requiredPermission: 'sell_requests:view' },
  { path: '/transactions', element: <TransactionsAdmin />, requiredPermission: 'transactions:view' },
  { path: '/gift-cards', element: <GiftCardsAdmin />, requiredPermission: 'gift_cards:view' },
  { path: '/store-products', element: <StoreProducts />, requiredPermission: 'store_products:view' },
  { path: '/sections', element: <Sections />, requiredPermission: 'sections:view' },
];

function AdminHomeRedirect() {
  const { hasPermission } = useAuth();
  const firstAccessibleRoute = adminRoutes.find(
    (r) => r.requiredPermission ? hasPermission(r.requiredPermission) : true
  );
  return <Navigate to={firstAccessibleRoute?.path || '/login'} replace />;
}

function PermissionGate({
  children,
  requiredPermission,
}: {
  children: React.ReactNode;
  requiredPermission?: UserPermission;
}) {
  const { hasPermission, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-7a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">دسترسی محدود</h3>
          <p className="text-gray-500 text-sm">
            برای دسترسی به این بخش مجوز لازم را ندارید.
          </p>
          <p className="text-gray-400 text-xs mt-1" dir="ltr">
            ({location.pathname})
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />}
      />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHomeRedirect />} />
        {adminRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path === '/' ? undefined : route.path}
            index={route.path === '/'}
            element={
              <PermissionGate requiredPermission={route.requiredPermission}>
                {route.element}
              </PermissionGate>
            }
          />
        ))}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
