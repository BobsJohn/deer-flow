"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/marketplace/auth-context";
import { useApi } from "@/components/marketplace/api";

export default function AdminDashboard() {
  const { token } = useAuth();
  const api = useApi();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [trends, setTrends] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!token) return;
    api.get<Record<string, number>>("/dashboard/stats").then(setStats).catch(() => {});
    api.get<Record<string, number>>("/admin/dashboard/trends").then(setTrends).catch(() => {});
  }, [token]);

  const cards = [
    { label: "用户总数", value: stats.total_users ?? 0, color: "text-blue-400", icon: "👥" },
    { label: "技能总数", value: stats.total_skills ?? 0, color: "text-emerald-400", icon: "🧩" },
    { label: "待审核", value: stats.total_skills ?? 0, color: "text-amber-400", icon: "📋", badge: true },
    { label: "执行次数", value: stats.total_executions ?? 0, color: "text-violet-400", icon: "⚡" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-neutral-100">概览</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-neutral-800/50 bg-neutral-900/40 p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg">{c.icon}</span>
              {c.badge && <span className="text-[10px] text-amber-400 bg-amber-500/10 rounded-full px-2 py-0.5">需关注</span>}
            </div>
            <p className="text-[12px] text-neutral-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-neutral-600">近 7 天趋势</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-800/40 bg-neutral-900/30 p-4">
          <p className="text-[12px] text-neutral-500">新增技能</p>
          <p className={`mt-1 text-xl font-bold ${(trends.new_skills_7d ?? 0) > 0 ? "text-emerald-400" : "text-neutral-500"}`}>
            {trends.new_skills_7d ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800/40 bg-neutral-900/30 p-4">
          <p className="text-[12px] text-neutral-500">新增用户</p>
          <p className={`mt-1 text-xl font-bold ${(trends.new_users_7d ?? 0) > 0 ? "text-blue-400" : "text-neutral-500"}`}>
            {trends.new_users_7d ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
