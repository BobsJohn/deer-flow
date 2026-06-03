"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { useAuth } from "@/components/marketplace/auth-context";
import { useApi } from "@/components/marketplace/api";

export default function PasswordPage() {
  const { token, loading: authLoading } = useAuth();
  const api = useApi();
  const router = useRouter();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) router.push("/marketplace/login");
  }, [authLoading, token, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPw !== confirmPw) { setError("两次密码不一致"); return; }
    if (newPw.length < 6) { setError("新密码至少 6 位"); return; }
    setSaving(true);
    try {
      await api.put("/me/password", { old_password: oldPw, new_password: newPw });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改失败");
    }
    setSaving(false);
  };

  if (authLoading) return <div className="min-h-screen bg-neutral-950" />;
  if (!token) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <MarketplaceHeader backTo={{ href: "/marketplace", label: "市场" }} />
      <main className="mx-auto max-w-md px-6 py-10">
        <h1 className="mb-6 text-xl font-bold">修改密码</h1>

        {success ? (
          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-6 text-center">
            <p className="text-emerald-400 mb-4">密码修改成功</p>
            <button onClick={() => router.push("/marketplace")}
              className="rounded-lg bg-neutral-800 px-4 py-2 text-[13px] text-neutral-300 hover:text-white transition-all">
              返回市场
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-neutral-500">旧密码</label>
              <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required
                className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-neutral-500">新密码</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={6}
                className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-neutral-500">确认新密码</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required
                className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600" />
            </div>

            {error && <p className="text-[12px] text-rose-400">{error}</p>}

            <button type="submit" disabled={saving}
              className="h-10 rounded-lg bg-neutral-200 text-[13px] font-medium text-neutral-900 hover:bg-white disabled:opacity-50 transition-all">
              {saving ? "修改中..." : "确认修改"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
