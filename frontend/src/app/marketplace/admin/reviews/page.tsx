"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/marketplace/auth-context";
import { useApi } from "@/components/marketplace/api";

interface PendingSkill {
  id: number; name: string; description: string; version: number; status: string;
  permission_level: string; updated_at: string;
}

export default function AdminReviews() {
  const { token } = useAuth();
  const api = useApi();
  const [skills, setSkills] = useState<PendingSkill[]>([]);
  const [reason, setReason] = useState("");
  const [rejectId, setRejectId] = useState<number | null>(null);

  const load = () => {
    if (!token) return;
    api.get<PendingSkill[]>("/admin/skills/pending").then(setSkills).catch(() => {});
  };

  useEffect(() => { load(); }, [token]);

  const approve = async (id: number) => {
    await api.put(`/admin/skills/${id}/review`, { status: "published" });
    load();
  };

  const reject = async (id: number) => {
    await api.put(`/admin/skills/${id}/review`, { status: "draft" });
    setRejectId(null);
    setReason("");
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-neutral-100">资产审核</h1>
      <div className="overflow-hidden rounded-xl border border-neutral-800/40">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-neutral-800/40 bg-neutral-900/50">
              <th className="px-4 py-3 text-left font-medium text-neutral-400">名称</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-400">权限</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-400">状态</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-400">更新时间</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-400">操作</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.id} className="border-b border-neutral-800/20 last:border-0">
                <td className="px-4 py-3 text-neutral-200">{s.name}</td>
                <td className="px-4 py-3 text-neutral-500">{s.permission_level}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400">
                    {{ draft: "草稿", review: "审核中" }[s.status] ?? s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-500">{new Date(s.updated_at).toLocaleDateString("zh-CN")}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => approve(s.id)}
                      className="rounded-lg bg-emerald-600/20 px-3 py-1 text-[12px] text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition-all">
                      通过
                    </button>
                    <button onClick={() => setRejectId(rejectId === s.id ? null : s.id)}
                      className="rounded-lg bg-rose-600/20 px-3 py-1 text-[12px] text-rose-400 border border-rose-600/30 hover:bg-rose-600/30 transition-all">
                      驳回
                    </button>
                  </div>
                  {rejectId === s.id && (
                    <div className="mt-2 flex gap-2">
                      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="驳回原因"
                        className="flex-1 h-8 rounded-lg border border-neutral-800 bg-neutral-950/60 px-2 text-[12px] text-neutral-200 outline-none focus:border-neutral-600" />
                      <button onClick={() => reject(s.id)} disabled={!reason.trim()}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-[12px] text-white disabled:opacity-50 transition-all">
                        确认
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {skills.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-600">暂无待审核资产</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
