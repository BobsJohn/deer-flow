"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/marketplace/auth-context";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/marketplace/admin", label: "概览", icon: "📊" },
  { href: "/marketplace/admin/users", label: "用户管理", icon: "👥" },
  { href: "/marketplace/admin/reviews", label: "资产审核", icon: "📋" },
  { href: "/marketplace/admin/logs", label: "操作日志", icon: "📝" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && (!token || user?.role !== "admin")) router.push("/marketplace/login");
  }, [authLoading, token, user, router]);

  if (authLoading) return <div className="min-h-screen bg-neutral-950" />;
  if (!token || user?.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <aside className="w-56 shrink-0 border-r border-neutral-800/50 bg-neutral-900/30 p-4 flex flex-col">
        <div className="mb-6">
          <Link href="/marketplace" className="text-[12px] text-neutral-500 hover:text-neutral-300 transition-colors">← 返回市场</Link>
          <h1 className="mt-2 text-[15px] font-bold text-neutral-100">管理后台</h1>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                pathname === item.href ? "bg-neutral-800 text-neutral-100" : "text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300"
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
