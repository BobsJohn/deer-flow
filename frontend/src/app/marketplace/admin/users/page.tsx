"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/marketplace/auth-context";
import { useApi, ROLE_LABELS } from "@/components/marketplace/api";

interface AdminUser {
  id: number; name: string; email: string; role: string; team_id: number; team_name: string;
}

export default function AdminUsers() {
  const { token } = useAuth();
  const api = useApi();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [changing, setChanging] = useState<Record<number, boolean>>({});

  const load = () => {
    if (!token) return;
    api.get<AdminUser[]>("/admin/users").then(setUsers).catch(() => {});
  };

  useEffect(() => { load(); }, [token]);

  const changeRole = async (userId: number, role: string) => {
    setChanging((p) => ({ ...p, [userId]: true }));
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      load();
    } catch { /* */ }
    setChanging((p) => ({ ...p, [userId]: false }));
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-neutral-100">用户管理</h1>
      <div className="overflow-hidden rounded-xl border border-neutral-800/40">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-neutral-800/40 bg-neutral-900/50">
              <th className="px-4 py-3 text-left font-medium text-neutral-400">姓名</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-400">邮箱</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-400">团队</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-400">角色</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-400">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-800/20 last:border-0">
                <td className="px-4 py-3 text-neutral-200">{u.name}</td>
                <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                <td className="px-4 py-3 text-neutral-500">{u.team_name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-neutral-800/60 px-2 py-0.5 text-[11px] text-neutral-400">
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={changing[u.id]}
                    className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-2 py-1 text-[12px] text-neutral-300 outline-none focus:border-neutral-600 disabled:opacity-50">
                    <option value="user">成员</option>
                    <option value="developer">开发者</option>
                    <option value="admin">管理员</option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-600">暂无用户</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
