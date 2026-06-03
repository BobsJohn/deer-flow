"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { useAuth } from "@/components/marketplace/auth-context";
import { useApi, ROLE_LABELS } from "@/components/marketplace/api";

interface TeamMember {
  id: number; name: string; email: string; role: string;
}

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const { token, loading: authLoading, user } = useAuth();
  const api = useApi();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !token) router.push("/marketplace/login"); }, [authLoading, token, router]);

  const isAdmin = user?.role === "admin";

  const loadMembers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.get<TeamMember[]>(`/teams/${teamId}/users`);
      setMembers(data ?? []);
    } catch { /* api.ts 已处理 401 */ }
    setLoading(false);
  };

  useEffect(() => { loadMembers(); }, [token, teamId]);

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/teams/${teamId}/users`, { name, email, password: email, role });
      setName(""); setEmail(""); setRole("user"); setShowForm(false);
      loadMembers();
    } catch { /* api.ts 已处理 401 */ }
  };

  const removeMember = async (userId: number) => {
    try {
      await api.del(`/teams/${teamId}/users/${userId}`);
      loadMembers();
    } catch { /* api.ts 已处理 401 */ }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-neutral-950" />;
  if (!token) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <MarketplaceHeader backTo={{ href: "/marketplace", label: "市场" }} />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">团队成员</h1>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-neutral-800 px-3.5 py-1.5 text-[13px] font-medium text-neutral-200 hover:bg-neutral-700 transition-all">
              {showForm ? "取消" : "添加成员"}
            </button>
          )}
        </div>

        {showForm && isAdmin && (
          <form onSubmit={addMember} className="mb-6 rounded-xl border border-neutral-800/40 bg-neutral-900/30 p-4 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="姓名" required
                className="h-9 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱" required
                className="h-9 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600" />
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="h-9 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600">
                <option value="user">成员</option>
                <option value="developer">开发者</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <button type="submit" className="self-end rounded-lg bg-neutral-200 px-4 py-1.5 text-[13px] font-medium text-neutral-900 hover:bg-white transition-all">添加</button>
          </form>
        )}

        <div className="rounded-xl border border-neutral-800/40 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-neutral-800/40 bg-neutral-900/50">
                <th className="px-4 py-3 text-left font-medium text-neutral-400">姓名</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-400">邮箱</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-400">角色</th>
                {isAdmin && <th className="px-4 py-3 text-right font-medium text-neutral-400">操作</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-neutral-800/20 last:border-0">
                  <td className="px-4 py-3 text-neutral-200">{m.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{m.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-neutral-800/60 px-2 py-0.5 text-[11px] text-neutral-400">
                      {ROLE_LABELS[m.role] ?? m.role}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeMember(m.id)} className="text-[12px] text-rose-500/70 hover:text-rose-400 transition-colors">移除</button>
                    </td>
                  )}
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={isAdmin ? 4 : 3} className="px-4 py-8 text-center text-neutral-600">暂无成员</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
