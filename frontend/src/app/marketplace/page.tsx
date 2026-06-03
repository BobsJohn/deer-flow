"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SkillCard, type SkillCardData, SearchBar, CategoryNav } from "@/components/marketplace/marketplace-ui";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { useAuth } from "@/components/marketplace/auth-context";
import { useApi, useDebounce, CATEGORY_LABELS } from "@/components/marketplace/api";

export default function MarketplacePage() {
  const { token, loading: authLoading } = useAuth();
  const api = useApi();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !token) router.push("/marketplace/login");
  }, [authLoading, token, router]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState<string | null>(null);
  const [allSkills, setAllSkills] = useState<SkillCardData[]>([]);
  const [searchResults, setSearchResults] = useState<SkillCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSearched = useRef(false);

  useEffect(() => {
    if (!token) return;
    api.get<SkillCardData[]>("/skills")
      .then((data) => setAllSkills(data ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setSearching(false);
      hasSearched.current = false;
      return;
    }
    hasSearched.current = true;
    setSearching(true);
    api.get<{ results: Array<{ resource_id: number; name: string; description: string }> }>(
      `/search?q=${encodeURIComponent(debouncedSearch)}`,
    ).then((data) => {
      const enriched = (data.results ?? []).map((r) => {
        const match = allSkills.find((s) => s.id === String(r.resource_id));
        return {
          id: String(r.resource_id),
          name: r.name,
          description: r.description,
          permission_level: (match?.permission_level ?? "public") as SkillCardData["permission_level"],
          category: match?.category ?? [],
          tags: match?.tags ?? [],
          version: match?.version ?? 0,
          type: (match?.type ?? "prompt") as SkillCardData["type"],
        };
      });
      setSearchResults(enriched);
    }).catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, [debouncedSearch, token]);

  const categories = useMemo(() => {
    if (!Array.isArray(allSkills)) return [];
    const counts = new Map<string, number>();
    for (const s of allSkills) for (const c of s.category) counts.set(c, (counts.get(c) ?? 0) + 1);
    return Array.from(counts.entries()).map(([k, v]) => ({ key: k, label: CATEGORY_LABELS[k] ?? k, count: v }));
  }, [allSkills]);

  const displaySkills = useMemo(() => {
    if (!Array.isArray(allSkills)) return [];
    return category ? allSkills.filter((s) => s.category.includes(category)) : allSkills;
  }, [allSkills, category]);

  const isEmpty = loading ? false : hasSearched.current ? searchResults.length === 0 : allSkills.length === 0;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[14px] text-neutral-500">{error}</p>
          <button onClick={() => window.location.reload()}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-[13px] text-neutral-300 hover:text-white transition-colors">重试</button>
        </div>
      </div>
    );
  }

  const visibleSkills = hasSearched.current ? searchResults : category ? displaySkills : allSkills;
  const resultCount = hasSearched.current ? searchResults.length : allSkills.length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <MarketplaceHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-[28px] font-bold tracking-tight">AI 能力市场</h1>
          <p className="text-[14px] text-neutral-500">发现、引入并管理团队的高质量 AI 技能、工具和智能体</p>
        </div>
        <div className="mb-8 flex flex-col gap-4">
          <SearchBar value={search} onChange={setSearch} onClear={() => { setSearch(""); setCategory(null); }} />
          <CategoryNav categories={categories} active={category} onChange={setCategory} />
        </div>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-600">
              {hasSearched.current ? `搜索结果 (${resultCount})` : `全部技能 (${resultCount})`}
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
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 py-20">
              <svg className="mb-3 h-10 w-10 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <p className="text-[13px] text-neutral-600">{hasSearched.current ? "没有匹配的技能" : "当前分类下没有技能"}</p>
              <button onClick={() => { setSearch(""); setCategory(null); }}
                className="mt-3 rounded-lg bg-neutral-800 px-4 py-1.5 text-[12px] text-neutral-400 hover:text-white transition-colors">
                清除筛选
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} onUse={(id) => (window.location.href = `/marketplace/skills/${id}`)} />
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
