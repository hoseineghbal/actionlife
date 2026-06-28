import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<TicketChat />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/new" element={<ArticleForm />} />
        <Route path="/articles/:id" element={<ArticleForm />} />
        <Route path="/token-settings" element={<TokenSettings />} />
        <Route path="/sell-requests" element={<SellRequests />} />
        <Route path="/transactions" element={<TransactionsAdmin />} />
        <Route path="/gift-cards" element={<GiftCardsAdmin />} />
        <Route path="/store-products" element={<StoreProducts />} />
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
