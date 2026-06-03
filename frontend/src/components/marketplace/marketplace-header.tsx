"use client";

import Link from "next/link";
import { UserMenu } from "./user-menu";

const NAV_ITEMS = [
  { href: "/marketplace", label: "市场" },
  { href: "/marketplace/teams", label: "团队" },
];

export function MarketplaceHeader({
  backTo,
  rightSlot,
}: {
  backTo?: { href: string; label: string };
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {backTo ? (
            <Link href={backTo.href}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-[13px] text-neutral-500 hover:text-neutral-200 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              {backTo.label}
            </Link>
          ) : (
            <>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800">
                <svg className="h-4 w-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
              </div>
              <span className="text-[14px] font-semibold tracking-tight">能力广场</span>
            </>
          )}
        </div>

        <nav className="flex items-center gap-1">
          {!backTo && NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}
              className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-neutral-500 transition-all hover:bg-neutral-800/60 hover:text-neutral-200">
              {item.label}
            </Link>
          ))}
          <div className="ml-2"><UserMenu /></div>
          {rightSlot}
        </nav>
      </div>
    </header>
  );
}
