"use client";

import { useState } from "react";
import { useAuth } from "./auth-context";
import { useApi } from "./api";
import { AVATARS } from "./avatars";

export function ProfileDialog({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const api = useApi();
  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar || AVATARS[0]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/me", { name, avatar });
      onClose();
      window.location.reload();
    } catch { /* */ }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-neutral-800/50 bg-neutral-900 p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-[16px] font-semibold text-neutral-100">个人信息</h2>

        <div className="mb-4">
          <label className="mb-1 block text-[12px] font-medium text-neutral-500">选择头像</label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button key={a} onClick={() => setAvatar(a)}
                className={`h-10 w-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                  avatar === a ? "bg-neutral-700 ring-1 ring-neutral-500" : "bg-neutral-800/60 hover:bg-neutral-800"
                }`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[12px] font-medium text-neutral-500">用户名</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-neutral-600" />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-neutral-800 px-4 py-1.5 text-[13px] text-neutral-400 hover:text-neutral-200 transition-all">取消</button>
          <button onClick={save} disabled={saving}
            className="rounded-lg bg-neutral-200 px-4 py-1.5 text-[13px] font-medium text-neutral-900 hover:bg-white disabled:opacity-50 transition-all">
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
