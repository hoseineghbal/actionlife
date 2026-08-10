import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from './api';
import type { AuthResponse, UserPermission } from '../types';

const ADMIN_VIEW_PERMISSIONS: UserPermission[] = [
  'dashboard:view',
  'users:view',
  'articles:view',
  'tickets:view',
  'contacts:view',
  'categories:view',
  'sections:view',
  'token_settings:view',
  'sell_requests:view',
  'transactions:view',
  'gift_cards:view',
  'store_products:view',
];

interface AuthContextType {
  user: AuthResponse['user'] | null;
  token: string | null;
  permissions: UserPermission[];
  hasPermission: (perm: UserPermission) => boolean;
  hasAnyPermission: (perms: UserPermission[]) => boolean;
  login: (mobile: string, password: string, countryCode?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    if (savedToken && savedUser) {
      const parsed = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsed);
      setPermissions(parsed.permissions || []);
    }
    setIsLoading(false);
  }, []);

  const hasPermission = (perm: UserPermission): boolean => {
    return permissions.includes(perm);
  };

  const hasAnyPermission = (perms: UserPermission[]): boolean => {
    return perms.some((p) => permissions.includes(p));
  };

  const login = async (mobile: string, password: string, countryCode = '+98') => {
    const res = await api.post<AuthResponse>('/auth/login', { mobile, password, countryCode });
    const { access_token, user: userData } = res.data;
    const userPerms = userData.permissions || [];
    const isAdmin = userData.role === 'admin' || userPerms.some((p) => ADMIN_VIEW_PERMISSIONS.includes(p));

    if (!isAdmin) {
      throw new Error('دسترسی ادمین ندارید');
    }

    localStorage.setItem('admin_token', access_token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    setPermissions(userPerms);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, permissions, hasPermission, hasAnyPermission, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
