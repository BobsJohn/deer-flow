"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface User {
  id: number;
  team_id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, team_id?: number) => Promise<void>;
  logout: () => void;
}

const API_BASE = "/api/marketplace";
const AuthContext = createContext<AuthContextType | null>(null);

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    const token = localStorage.getItem("marketplace_token");
    if (token && !isTokenExpired(token)) {
      fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((user) => setState({ user, token, loading: false }))
        .catch(() => { localStorage.removeItem("marketplace_token"); setState({ user: null, token: null, loading: false }); });
    } else {
      localStorage.removeItem("marketplace_token");
      setState({ user: null, token: null, loading: false });
    }
  }, []);

  const storeAuth = useCallback((token: string, user: User) => {
    localStorage.setItem("marketplace_token", token);
    setState({ user, token, loading: false });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error((await res.json()).detail || "登录失败");
    const data = await res.json();
    storeAuth(data.token, data.user);
  }, [storeAuth]);

  const register = useCallback(async (name: string, email: string, password: string, team_id = 1) => {
    const res = await fetch(`${API_BASE}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password, team_id }) });
    if (!res.ok) throw new Error((await res.json()).detail || "注册失败");
    const data = await res.json();
    storeAuth(data.token, data.user);
  }, [storeAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem("marketplace_token");
    setState({ user: null, token: null, loading: false });
  }, []);

  return <AuthContext.Provider value={{ ...state, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useApiHeaders() {
  const { token } = useAuth();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
