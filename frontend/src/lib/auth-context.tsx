"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const handleLogin = useCallback((token: string, userData: User) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext value={{ user, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
