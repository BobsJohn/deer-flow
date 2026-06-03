"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-context";
import { AVATARS } from "./avatars";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const avatar = user.avatar || AVATARS[0];

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-all">
          <span className="text-base">{avatar}</span>
          <span className="max-w-[100px] truncate">{user.name}</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-neutral-800/60 bg-neutral-900 p-1.5 shadow-xl z-50">
            <div className="px-3 py-2 border-b border-neutral-800/40 mb-1">
              <p className="text-[12px] font-medium text-neutral-200 truncate">{user.name}</p>
              <p className="text-[11px] text-neutral-600 truncate">{user.email}</p>
            </div>
            <a href="/marketplace/profile"
              className="block w-full rounded-lg px-3 py-1.5 text-left text-[12px] text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-all">
              个人信息
            </a>
            <a href="/marketplace/profile/password"
              className="block w-full rounded-lg px-3 py-1.5 text-left text-[12px] text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-all">
              修改密码
            </a>
            <div className="border-t border-neutral-800/40 mt-1 pt-1">
              <button onClick={() => { logout(); window.location.href = "/marketplace/login"; }}
                className="w-full rounded-lg px-3 py-1.5 text-left text-[12px] text-rose-400/70 hover:bg-neutral-800 hover:text-rose-400 transition-all">
                退出登录
              </button>
            </div>
          </div>
        )}
      </div>

    </>
  );
}
