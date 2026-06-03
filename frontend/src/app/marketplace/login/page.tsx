"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/marketplace/auth-context";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      router.push("/marketplace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800/50 bg-neutral-900 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-neutral-100">能力广场</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            {tab === "login" ? "登录以继续" : "创建新账号"}
          </p>
        </div>

        <div className="mb-6 flex rounded-lg bg-neutral-800/50 p-0.5">
          <button onClick={() => setTab("login")}
            className={`flex-1 rounded-md py-1.5 text-[13px] font-medium transition-all ${tab === "login" ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-300"}`}>
            登录
          </button>
          <button onClick={() => setTab("register")}
            className={`flex-1 rounded-md py-1.5 text-[13px] font-medium transition-all ${tab === "register" ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-300"}`}>
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === "register" && (
            <div>
              <label className="mb-1 block text-[12px] font-medium text-neutral-500">用户名</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 placeholder-neutral-600 outline-none focus:border-neutral-600" placeholder="输入用户名" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-[12px] font-medium text-neutral-500">邮箱</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 placeholder-neutral-600 outline-none focus:border-neutral-600" placeholder="输入邮箱" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-neutral-500">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 placeholder-neutral-600 outline-none focus:border-neutral-600" placeholder="至少 6 位" />
          </div>

          {error && <p className="text-[12px] text-rose-400">{error}</p>}

          <button type="submit" disabled={busy}
            className="mt-2 h-10 w-full rounded-lg bg-neutral-200 text-[13px] font-medium text-neutral-900 transition-all hover:bg-white disabled:opacity-50">
            {busy ? "处理中..." : tab === "login" ? "登录" : "注册"}
          </button>
        </form>
      </div>
    </div>
  );
}
