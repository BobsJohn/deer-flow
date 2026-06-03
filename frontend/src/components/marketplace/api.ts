"use client";

import { useState, useEffect } from "react";

import { useAuth } from "./auth-context";
import { useRouter } from "next/navigation";

const API_BASE = "/api/marketplace";

export async function apiFetch<T>(
  path: string,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useApi() {
  const { token, logout } = useAuth();
  const router = useRouter();

  const handleUnauth = (e: Error) => {
    if (e.message === "UNAUTHORIZED") {
      logout();
      router.push("/marketplace/login");
    }
    throw e;
  };

  return {
    get: <T>(path: string) => apiFetch<T>(path, token).catch(handleUnauth),
    post: <T>(path: string, body: unknown) =>
      apiFetch<T>(path, token, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(handleUnauth),
    del: <T>(path: string) => apiFetch<T>(path, token, { method: "DELETE" }).catch(handleUnauth),
    put: <T>(path: string, body: unknown) =>
      apiFetch<T>(path, token, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(handleUnauth),
  };
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "管理员", developer: "开发者", user: "成员",
};
export const STATUS_LABELS: Record<string, string> = {
  draft: "草稿", review: "审核中", published: "已发布", deprecated: "已弃用",
};
export const CATEGORY_LABELS: Record<string, string> = {
  ops: "运维", data: "数据", security: "安全",
  development: "开发", productivity: "效率", analysis: "分析", creative: "创意",
};

export function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
