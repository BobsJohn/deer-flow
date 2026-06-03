"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PermissionBadge, CategoryTag } from "@/components/marketplace/marketplace-ui";
import Link from "next/link";

const API_BASE = "/api/marketplace";

interface SkillDetail {
  id: string;
  name: string;
  description: string;
  type: "python" | "prompt" | "mcp";
  permission_level: "public" | "team" | "commercial";
  category: string[];
  tags: string[];
  version: number;
  input_schema: Record<string, unknown> | null;
  output_schema: Record<string, unknown> | null;
  examples: Array<{ input: unknown; output: unknown }> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function SkillDetailPage() {
  const params = useParams();
  const skillId = params.id as string;
  const [skill, setSkill] = useState<SkillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [showLicenseInput, setShowLicenseInput] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchJSON<SkillDetail>(`${API_BASE}/skills/${skillId}`)
      .then(setSkill)
      .catch((e) => setError(e.message === "HTTP 404" ? "技能未找到" : "加载失败，请重试"))
      .finally(() => setLoading(false));
  }, [skillId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-6">
          <Link href="/marketplace" className="rounded-lg px-3 py-1.5 text-[12px] text-neutral-500 hover:text-neutral-200 transition-colors">← 返回市场</Link>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-neutral-800" />
            <div className="h-4 w-96 rounded bg-neutral-800/60" />
            <div className="mt-6 h-40 rounded-xl bg-neutral-900/50 border border-neutral-800/60" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-6">
          <Link href="/marketplace" className="rounded-lg px-3 py-1.5 text-[12px] text-neutral-500 hover:text-neutral-200 transition-colors">← 返回市场</Link>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-20 flex flex-col items-center gap-4">
          <svg className="h-10 w-10 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-[14px] text-neutral-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!skill) return null;

  const schemaFields = skill.input_schema?.properties
    ? Object.entries(skill.input_schema.properties as Record<string, { type: string; description?: string; default?: unknown }>)
    : [];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="sticky top-0 z-50 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/marketplace" className="flex items-center gap-2 rounded-lg px-2 py-1 text-[13px] text-neutral-500 hover:text-neutral-200 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            返回市场
          </Link>
          <div className="flex items-center gap-2">
            {skill.permission_level === "public" ? (
              <button className="rounded-lg bg-neutral-800 px-4 py-1.5 text-[13px] font-medium text-white hover:bg-neutral-700 active:scale-[0.97] transition-all">直接使用</button>
            ) : skill.permission_level === "commercial" && !showLicenseInput ? (
              <button onClick={() => setShowLicenseInput(true)} className="rounded-lg bg-violet-600/20 px-4 py-1.5 text-[13px] font-medium text-violet-300 border border-violet-600/30 hover:bg-violet-600/30 hover:text-violet-200 transition-all">授权使用</button>
            ) : (
              <button className="rounded-lg bg-neutral-800 px-4 py-1.5 text-[13px] font-medium text-white hover:bg-neutral-700 active:scale-[0.97] transition-all">团队使用</button>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <PermissionBadge level={skill.permission_level} />
            <CategoryTag category={(skill.category ?? [])[0] ?? "other"} />
            <span className="rounded-md bg-neutral-800/60 px-2 py-0.5 text-[11px] font-mono text-neutral-500 uppercase tracking-wider">{skill.type}</span>
            <span className="text-[11px] text-neutral-600">v{skill.version}</span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-[26px] font-bold tracking-tight">{skill.name}</h1>
            <p className="text-[14px] leading-relaxed text-neutral-400 max-w-2xl">{skill.description}</p>
          </div>
          {(skill.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(skill.tags ?? []).map((tag) => (
                <span key={tag} className="rounded-md bg-neutral-800/50 px-2.5 py-0.5 text-[12px] text-neutral-500">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6 rounded-xl border border-neutral-800/40 bg-neutral-900/30 p-6 text-[13px]">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-600">状态</span>
            <span className={cn("font-medium", skill.status === "published" ? "text-emerald-400" : "text-neutral-300")}>
              {{ draft: "草稿", review: "审核中", published: "已发布", deprecated: "已弃用" }[skill.status] ?? skill.status}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-600">创建时间</span>
            <span className="text-neutral-300">{new Date(skill.created_at).toLocaleDateString("zh-CN")}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-600">更新时间</span>
            <span className="text-neutral-300">{new Date(skill.updated_at).toLocaleDateString("zh-CN")}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-600">版本</span>
            <span className="text-neutral-300">v{skill.version}</span>
          </div>
        </div>

        {schemaFields.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-neutral-600">输入参数</h2>
            <div className="overflow-hidden rounded-xl border border-neutral-800/40">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-neutral-800/40 bg-neutral-900/50">
                    <th className="px-4 py-2.5 text-left font-medium text-neutral-400">参数</th>
                    <th className="px-4 py-2.5 text-left font-medium text-neutral-400">类型</th>
                    <th className="px-4 py-2.5 text-left font-medium text-neutral-400">描述</th>
                    <th className="px-4 py-2.5 text-left font-medium text-neutral-400">默认值</th>
                  </tr>
                </thead>
                <tbody>
                  {schemaFields.map(([name, field]) => (
                    <tr key={name} className="border-b border-neutral-800/20 last:border-0">
                      <td className="px-4 py-2.5 font-mono text-[12px] text-neutral-200">{name}</td>
                      <td className="px-4 py-2.5 text-neutral-500">{field.type}</td>
                      <td className="px-4 py-2.5 text-neutral-400">{field.description ?? "-"}</td>
                      <td className="px-4 py-2.5 text-neutral-500 font-mono">{field.default?.toString() ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {skill.examples && skill.examples.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-neutral-600">使用示例</h2>
            {skill.examples.map((ex, i) => (
              <div key={i} className="rounded-xl border border-neutral-800/40 bg-neutral-900/30 p-4 mb-3">
                <div className="mb-2">
                  <span className="text-[11px] font-medium text-neutral-600">输入</span>
                  <pre className="mt-1 rounded-lg bg-neutral-950 p-3 text-[12px] font-mono text-neutral-400 overflow-x-auto">{JSON.stringify(ex.input, null, 2)}</pre>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-neutral-600">输出</span>
                  <pre className="mt-1 rounded-lg bg-neutral-950 p-3 text-[12px] font-mono text-neutral-400 overflow-x-auto">{JSON.stringify(ex.output, null, 2)}</pre>
                </div>
              </div>
            ))}
          </section>
        )}

        {showLicenseInput && (
          <section className="rounded-xl border border-violet-800/40 bg-violet-950/20 p-5">
            <h3 className="mb-2 text-[14px] font-semibold text-violet-300">输入授权密钥</h3>
            <p className="mb-3 text-[12px] text-neutral-500">此技能为商业级资产，需要有效的 License 才能使用。</p>
            <div className="flex gap-2">
              <input value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} placeholder="输入 License Key"
                className="flex-1 h-10 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 text-[13px] text-neutral-200 placeholder-neutral-600 outline-none focus:border-violet-600/50" />
              <button className="rounded-lg bg-violet-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-violet-500 transition-colors">验证</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
