import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from './api';
import type { AuthResponse } from '../types';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  token: string | null;
  login: (mobile: string, password: string, countryCode?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (mobile: string, password: string, countryCode = '+98') => {
    const res = await api.post<AuthResponse>('/auth/login', { mobile, password, countryCode });
    const { access_token, user: userData } = res.data;
    if (userData.role !== 'admin') {
      throw new Error('دسترسی ادمین ندارید');
    }
    localStorage.setItem('admin_token', access_token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
