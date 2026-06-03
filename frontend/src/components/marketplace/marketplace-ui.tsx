"use client";

import { cn } from "@/lib/utils";
import React from "react";

// ── 权限标签 ──
interface BadgeLevelProps {
  level: "public" | "team" | "commercial";
}

const levelConfig: Record<
  string,
  { label: string; class: string }
> = {
  public: { label: "公开", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  team: { label: "团队", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  commercial: { label: "商业", class: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
};

export function PermissionBadge({ level }: BadgeLevelProps) {
  const c = levelConfig[level] ?? levelConfig.public;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        c.class,
      )}
    >
      {c.label}
    </span>
  );
}

// ── 技能分类标签 ──
const categoryLabels: Record<string, string> = {
  development: "开发",
  productivity: "效率",
  analysis: "分析",
  creative: "创意",
  data: "数据",
  ops: "运维",
  security: "安全",
  other: "其他",
};

export function CategoryTag({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
      {categoryLabels[category] ?? category}
    </span>
  );
}

// ── 技能卡片 ──
export interface SkillCardData {
  id: string;
  name: string;
  description: string;
  permission_level: "public" | "team" | "commercial";
  category: string[];
  tags: string[];
  version: number;
  type: "python" | "prompt" | "mcp";
}

export function SkillCard({
  skill,
  onUse,
}: {
  skill: SkillCardData;
  onUse?: (id: string) => void;
}) {
  return (
    <article className="group relative flex flex-col gap-3 rounded-xl border border-neutral-800/60 bg-neutral-900/50 p-5 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900 hover:shadow-[0_0_30px_-6px_rgba(0,0,0,0.6)]">
      {/* 顶部：标签行 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PermissionBadge level={skill.permission_level} />
          <CategoryTag category={skill.category[0] ?? "other"} />
        </div>
        <span className="text-[11px] font-medium text-neutral-600">
          v{skill.version}
        </span>
      </div>

      {/* 名称 + 描述 */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[15px] font-semibold leading-snug text-neutral-100 group-hover:text-white transition-colors">
          {skill.name}
        </h3>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-neutral-500">
          {skill.description}
        </p>
      </div>

      {/* 标签 */}
      {skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skill.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-neutral-800/60 px-2 py-0.5 text-[11px] text-neutral-500"
            >
              {tag}
            </span>
          ))}
          {skill.tags.length > 4 && (
            <span className="text-[11px] text-neutral-600">
              +{skill.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* 类型脚标 */}
      <div className="mt-auto flex items-center justify-between border-t border-neutral-800/40 pt-3">
        <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
          {skill.type}
        </span>
        <button
          onClick={() => onUse?.(skill.id)}
          className="rounded-lg bg-neutral-800 px-3 py-1 text-[12px] font-medium text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white active:scale-[0.97]"
        >
          使用
        </button>
      </div>
    </article>
  );
}

// ── 搜索框 ──
export function SearchBar({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear?: () => void;
}) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索技能、插件包、数字员工..."
        className="h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900/60 pl-10 pr-10 text-[13px] text-neutral-200 placeholder-neutral-600 outline-none transition-all focus:border-neutral-600 focus:bg-neutral-900 focus:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ── 分类导航 ──
interface CategoryNavProps {
  categories: { key: string; label: string; count: number }[];
  active: string | null;
  onChange: (key: string | null) => void;
}

export function CategoryNav({ categories, active, onChange }: CategoryNavProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 rounded-lg px-3.5 py-1.5 text-[12px] font-medium transition-all",
          active === null
            ? "bg-neutral-800 text-neutral-100"
            : "bg-neutral-900/60 text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-300",
        )}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={cn(
            "shrink-0 rounded-lg px-3.5 py-1.5 text-[12px] font-medium transition-all",
            active === cat.key
              ? "bg-neutral-800 text-neutral-100"
              : "bg-neutral-900/60 text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-300",
          )}
        >
          {cat.label}
          <span className="ml-1.5 text-[11px] text-neutral-600">{cat.count}</span>
        </button>
      ))}
    </div>
  );
}

// ── 推荐专区卡片 ──
export interface FeaturedBundleData {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "expert";
  skillCount: number;
}

export function FeaturedBundle({ bundle }: { bundle: FeaturedBundleData }) {
  const difficultyLabel = { beginner: "入门", intermediate: "进阶", expert: "高级" };
  const difficultyColor = {
    beginner: "text-emerald-400",
    intermediate: "text-amber-400",
    expert: "text-rose-400",
  };

  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-neutral-800/40 bg-gradient-to-br from-neutral-900 via-neutral-900/80 to-neutral-950 p-5 transition-all duration-200 hover:border-neutral-700/60 hover:from-neutral-900 hover:to-neutral-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h4 className="text-[14px] font-semibold text-neutral-100">{bundle.name}</h4>
          <p className="text-[12px] text-neutral-500 leading-relaxed line-clamp-2">{bundle.description}</p>
        </div>
        <span className={cn("shrink-0 text-[11px] font-medium", difficultyColor[bundle.difficulty])}>
          {difficultyLabel[bundle.difficulty]}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-800/30 pt-3">
        <span className="text-[11px] text-neutral-600">{bundle.skillCount} 个技能</span>
        <button className="rounded-lg bg-neutral-800 px-3 py-1 text-[12px] font-medium text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white active:scale-[0.97]">
          查看详情
        </button>
      </div>
    </div>
  );
}
