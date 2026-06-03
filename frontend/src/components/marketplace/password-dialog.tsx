"use client";

import { useState } from "react";
import { useApi } from "./api";

export function PasswordDialog({ onClose }: { onClose: () => void }) {
  const api = useApi();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPw !== confirmPw) { setError("两次密码不一致"); return; }
    if (newPw.length < 6) { setError("新密码至少 6 位"); return; }
    setSaving(true);
    try {
      await api.put("/me/password", { old_password: oldPw, new_password: newPw });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改失败");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <form className="w-full max-w-sm rounded-xl border border-neutral-800/50 bg-neutral-900 p-6" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2 className="mb-4 text-[16px] font-semibold text-neutral-100">修改密码</h2>

        <div className="flex flex-col gap-3 mb-4">
          <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="旧密码" required
            className="h-10 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600" />
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="新密码（至少 6 位）" required minLength={6}
            className="h-10 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600" />
          <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="确认新密码" required
            className="h-10 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600" />
        </div>

        {error && <p className="mb-3 text-[12px] text-rose-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg bg-neutral-800 px-4 py-1.5 text-[13px] text-neutral-400 hover:text-neutral-200 transition-all">取消</button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-neutral-200 px-4 py-1.5 text-[13px] font-medium text-neutral-900 hover:bg-white disabled:opacity-50 transition-all">
            {saving ? "修改中..." : "确认修改"}
          </button>
        </div>
      </form>
    </div>
  );
}
