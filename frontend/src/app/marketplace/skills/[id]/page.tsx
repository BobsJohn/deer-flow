"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PermissionBadge, CategoryTag } from "@/components/marketplace/marketplace-ui";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { useAuth } from "@/components/marketplace/auth-context";
import { useApi, STATUS_LABELS } from "@/components/marketplace/api";
import { useRouter } from "next/navigation";

interface SkillDetail {
  id: string; name: string; description: string;
  type: "python" | "prompt" | "mcp";
  permission_level: "public" | "team" | "commercial";
  category: string[]; tags: string[]; version: number;
  input_schema: Record<string, unknown> | null;
  output_schema: Record<string, unknown> | null;
  examples: Array<{ input: unknown; output: unknown }> | null;
  status: string; created_at: string; updated_at: string;
}

export default function SkillDetailPage() {
  const params = useParams();
  const { token, loading: authLoading } = useAuth();
  const api = useApi();
  const router = useRouter();
  const skillId = params.id as string;
  const [skill, setSkill] = useState<SkillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [showInstallSuccess, setShowInstallSuccess] = useState(false);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) router.push("/marketplace/login");
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchSkill();
  }, [skillId, token]);

  const fetchSkill = async () => {
    try {
      const data = await api.get<SkillDetail>(`/skills/${skillId}`);
      setSkill(data);
    } catch (e) {
      setError(e instanceof Error ? (e.message === "HTTP 404" ? "技能未找到" : e.message) : "加载失败");
    }
    setLoading(false);
  };

  const install = async (force = false) => {
    if (!token) return;
    setInstalling(true);
    try {
      await api.post(`/skills/${skillId}/install${force ? "?force=true" : ""}`, {});
      setShowInstallSuccess(true);
      setShowConfirmOverwrite(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("409") || e instanceof Object) {
        setShowConfirmOverwrite(true);
      }
    }
    setInstalling(false);
  };

  const installSkill = () => install(false);
  const forceInstall = () => install(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <MarketplaceHeader backTo={{ href: "/marketplace", label: "返回市场" }} />
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
        <MarketplaceHeader backTo={{ href: "/marketplace", label: "返回市场" }} />
        <div className="mx-auto max-w-4xl px-6 py-20 flex flex-col items-center gap-4">
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
      <MarketplaceHeader
        backTo={{ href: "/marketplace", label: "返回市场" }}
      />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <PermissionBadge level={skill.permission_level} />
            <CategoryTag category={(skill.category ?? [])[0] ?? "other"} />
            <span className="rounded-md bg-neutral-800/60 px-2 py-0.5 text-[11px] font-mono text-neutral-500 uppercase tracking-wider">{skill.type}</span>
            <span className="text-[11px] text-neutral-600">v{skill.version}</span>
          </div>
          <h1 className="text-[26px] font-bold tracking-tight">{skill.name}</h1>
          <p className="text-[14px] leading-relaxed text-neutral-400 max-w-2xl">{skill.description}</p>
          <button onClick={installSkill} disabled={installing}
            className="self-start rounded-lg bg-neutral-200 px-4 py-2 text-[13px] font-medium text-neutral-900 hover:bg-white disabled:opacity-50 transition-all">
            {installing ? "安装中..." : "直接使用"}
          </button>
          {(skill.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(skill.tags ?? []).map((tag) => (
                <span key={tag} className="rounded-md bg-neutral-800/50 px-2.5 py-0.5 text-[12px] text-neutral-500">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6 rounded-xl border border-neutral-800/40 bg-neutral-900/30 p-6 text-[13px]">
          {[{ label: "状态", value: STATUS_LABELS[skill.status] ?? skill.status, color: skill.status === "published" ? "text-emerald-400" : "text-neutral-300" },
            { label: "创建时间", value: new Date(skill.created_at).toLocaleDateString("zh-CN"), color: "text-neutral-300" },
            { label: "更新时间", value: new Date(skill.updated_at).toLocaleDateString("zh-CN"), color: "text-neutral-300" },
            { label: "版本", value: `v${skill.version}`, color: "text-neutral-300" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-neutral-600">{label}</span>
              <span className={cn("font-medium", color)}>{value}</span>
            </div>
          ))}
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
                className="flex-1 h-10 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 text-[13px] text-neutral-200 outline-none focus:border-violet-600/50" />
              <button className="rounded-lg bg-violet-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-violet-500 transition-colors">验证</button>
            </div>
          </section>
        )}

        {showInstallSuccess && (
          <section className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-5 mb-4">
            <p className="text-emerald-400 text-[13px] font-medium">✅ 技能已安装到 DeerFlow</p>
            <p className="text-[12px] text-neutral-500 mt-1">重启 DeerFlow 后即可使用该技能。</p>
            <button onClick={() => setShowInstallSuccess(false)} className="mt-2 text-[12px] text-neutral-500 hover:text-neutral-300">关闭</button>
          </section>
        )}

        {showConfirmOverwrite && (
          <section className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-5 mb-4">
            <p className="text-amber-400 text-[13px] font-medium">技能已存在</p>
            <p className="text-[12px] text-neutral-500 mt-1">该技能已安装过，是否覆盖？</p>
            <div className="flex gap-2 mt-3">
              <button onClick={forceInstall} disabled={installing}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-[12px] text-white hover:bg-amber-500 transition-all">覆盖</button>
              <button onClick={() => setShowConfirmOverwrite(false)} className="rounded-lg bg-neutral-800 px-3 py-1.5 text-[12px] text-neutral-400 hover:text-neutral-200 transition-all">取消</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
