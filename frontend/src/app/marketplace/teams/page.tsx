"use client";

import { useAuth } from "@/components/marketplace/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeamsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!loading && !token) router.push("/marketplace/login"); }, [loading, token, router]);

  if (loading || !token) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-50 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <a href="/marketplace" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-200 transition-colors text-[13px]">← 市场</a>
            <span className="text-[14px] font-semibold tracking-tight">团队管理</span>
          </div>
          <nav className="flex items-center gap-2 text-[12px] text-neutral-500">
            <span>{user?.name}</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <p className="text-neutral-500">团队管理页面（开发中）</p>
      </main>
    </div>
  );
}
