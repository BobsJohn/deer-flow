"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { SkillCard, type SkillCardData } from "@/components/marketplace/marketplace-ui";
import { SearchBar } from "@/components/marketplace/marketplace-ui";
import { CategoryNav } from "@/components/marketplace/marketplace-ui";

const API_BASE = "/api/marketplace";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState<string | null>(null);
  const [allSkills, setAllSkills] = useState<SkillCardData[]>([]);
  const [searchResults, setSearchResults] = useState<{ resource_type: string; resource_id: number; name: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchInitiated = useRef(false);

  // 初始加载所有技能
  useEffect(() => {
    fetchJSON<SkillCardData[]>(`${API_BASE}/skills`)
      .then(setAllSkills)
      .catch(() => setError("无法加载技能列表，请确认后端服务已启动"))
      .finally(() => setLoading(false));
  }, []);

  // 防抖搜索
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setSearching(false);
      searchInitiated.current = false;
      return;
    }
    searchInitiated.current = true;
    setSearching(true);
    fetchJSON<{ results: typeof searchResults }>(`${API_BASE}/search?q=${encodeURIComponent(debouncedSearch)}`)
      .then((data) => setSearchResults(data.results ?? []))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, [debouncedSearch]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of allSkills) for (const c of s.category) map.set(c, (map.get(c) ?? 0) + 1);
    const labelMap: Record<string, string> = { ops: "运维", data: "数据", security: "安全", development: "开发", productivity: "效率", analysis: "分析", creative: "创意" };
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, label: labelMap[k] ?? k, count: v }));
  }, [allSkills]);

  const isSearchMode = searchInitiated.current;
  const displaySkills = useMemo(() => {
    return allSkills.filter((s) => {
      if (category && !s.category.includes(category)) return false;
      return true;
    });
  }, [allSkills, category]);

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-12 w-12 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-[14px] text-neutral-500">{error}</p>
          <button onClick={() => window.location.reload()} className="rounded-lg bg-neutral-800 px-4 py-2 text-[13px] text-neutral-300 hover:text-white transition-colors">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-50 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800">
              <svg className="h-4 w-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <span className="text-[14px] font-semibold tracking-tight">能力广场</span>
          </div>
          <nav className="flex items-center gap-1">
            {[
              { href: "/marketplace", label: "市场" },
              { href: "/marketplace/agents", label: "Agent" },
              { href: "/marketplace/teams", label: "团队" },
            ].map((item) => (
              <a key={item.href} href={item.href}
                className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-neutral-500 transition-all hover:bg-neutral-800/60 hover:text-neutral-200">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-[28px] font-bold tracking-tight">AI 能力市场</h1>
          <p className="text-[14px] text-neutral-500 leading-relaxed">
            发现、引入并管理你团队的高质量 AI 技能、工具和智能体
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4">
          <SearchBar value={search} onChange={setSearch} onClear={() => { setSearch(""); setCategory(null); }} />
          <CategoryNav categories={categories} active={category} onChange={setCategory} />
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-600">
              {isSearchMode ? `搜索结果 (${searchResults.length})` : `全部技能 (${allSkills.length})`}
            </h2>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-5">
                  <div className="mb-3 h-4 w-16 rounded bg-neutral-800" />
                  <div className="mb-2 h-5 w-3/4 rounded bg-neutral-800" />
                  <div className="mb-4 h-8 w-full rounded bg-neutral-800/60" />
                  <div className="flex gap-1.5"><div className="h-4 w-12 rounded bg-neutral-800" /><div className="h-4 w-16 rounded bg-neutral-800" /></div>
                </div>
              ))}
            </div>
          ) : searching ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-5">
                  <div className="mb-3 h-4 w-16 rounded bg-neutral-800" />
                  <div className="mb-2 h-5 w-3/4 rounded bg-neutral-800" />
                  <div className="mb-4 h-8 w-full rounded bg-neutral-800/60" />
                </div>
              ))}
            </div>
          ) : isSearchMode && searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 py-20">
              <svg className="mb-3 h-10 w-10 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <p className="text-[13px] text-neutral-600">没有匹配的技能</p>
              <button onClick={() => { setSearch(""); setCategory(null); }} className="mt-3 rounded-lg bg-neutral-800 px-4 py-1.5 text-[12px] text-neutral-400 hover:text-white transition-colors">清除筛选</button>
            </div>
          ) : displaySkills.length === 0 && !isSearchMode ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 py-20">
              <svg className="mb-3 h-10 w-10 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <p className="text-[13px] text-neutral-600">当前分类下没有技能</p>
              <button onClick={() => setCategory(null)} className="mt-3 rounded-lg bg-neutral-800 px-4 py-1.5 text-[12px] text-neutral-400 hover:text-white transition-colors">查看全部</button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(isSearchMode ? searchResults.map((r) => ({
                id: String(r.resource_id),
                name: r.name,
                description: r.description,
                permission_level: "public" as const,
                category: [] as string[],
                tags: [] as string[],
                version: 0,
                type: "prompt" as const,
                ...(allSkills.find((s) => s.id === String(r.resource_id)) ?? {}),
              })) : category ? displaySkills : allSkills).map((skill) => (
                <SkillCard key={skill.id} skill={skill} onUse={(id) => window.location.href = `/marketplace/skills/${id}`} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-16 border-t border-neutral-800/30">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-[12px] text-neutral-700">
          DeerFlow 能力广场 · AI 能力统一管理与分发平台
        </div>
      </footer>
    </div>
  );
}
