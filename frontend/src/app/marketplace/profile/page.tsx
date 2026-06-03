"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { useAuth } from "@/components/marketplace/auth-context";
import { useApi } from "@/components/marketplace/api";
import { AVATARS } from "@/components/marketplace/avatars";

export default function ProfilePage() {
  const { token, loading: authLoading, user } = useAuth();
  const api = useApi();
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) router.push("/marketplace/login");
  }, [authLoading, token, router]);

  useEffect(() => {
    if (user) { setName(user.name); setAvatar(user.avatar || AVATARS[0]); }
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/me", { name, avatar });
    } catch { /* */ }
    setSaving(false);
  };

  if (authLoading) return <div className="min-h-screen bg-neutral-950" />;
  if (!token) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <MarketplaceHeader backTo={{ href: "/marketplace", label: "市场" }} />
      <main className="mx-auto max-w-md px-6 py-10">
        <h1 className="mb-6 text-xl font-bold">个人信息</h1>

        <div className="mb-6">
          <label className="mb-2 block text-[12px] font-medium text-neutral-500">选择头像</label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button key={a} onClick={() => setAvatar(a)}
                className={`h-12 w-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                  avatar === a ? "bg-neutral-700 ring-1 ring-neutral-500" : "bg-neutral-800/60 hover:bg-neutral-800"
                }`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-[12px] font-medium text-neutral-500">用户名</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600" />
        </div>

        <div className="mb-4 rounded-lg bg-neutral-900/50 p-3 text-[13px]">
          <div className="flex justify-between py-1">
            <span className="text-neutral-500">邮箱</span>
            <span className="text-neutral-300">{user?.email}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-500">角色</span>
            <span className="text-neutral-300">{{ admin: "管理员", developer: "开发者", user: "成员" }[user?.role ?? ""] ?? user?.role}</span>
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full h-10 rounded-lg bg-neutral-200 text-[13px] font-medium text-neutral-900 hover:bg-white disabled:opacity-50 transition-all">
          {saving ? "保存中..." : "保存"}
        </button>
      </main>
    </div>
  );
}
