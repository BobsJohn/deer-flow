"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { useAuth } from "@/components/marketplace/auth-context";
import { useApi, ROLE_LABELS } from "@/components/marketplace/api";
import { SkillCard, type SkillCardData } from "@/components/marketplace/marketplace-ui";

export default function MySkillsPage() {
  const { token, loading: authLoading, user } = useAuth();
  const api = useApi();
  const router = useRouter();
  const [skills, setSkills] = useState<SkillCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const canManage = user?.role === "admin" || user?.role === "developer";

  useEffect(() => {
    if (!authLoading && !token) router.push("/marketplace/login");
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    api.get<SkillCardData[]>("/skills/mine")
      .then((data) => setSkills(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (authLoading) return <div className="min-h-screen bg-neutral-950" />;
  if (!token) return null;

  if (!canManage) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <MarketplaceHeader />
        <main className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-neutral-500">你没有权限管理技能</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <MarketplaceHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">我的技能</h1>
            <p className="mt-1 text-[13px] text-neutral-500">团队内的所有技能</p>
          </div>
          <button onClick={() => router.push("/marketplace/skills/new")}
            className="rounded-lg bg-neutral-200 px-4 py-2 text-[13px] font-medium text-neutral-900 hover:bg-white transition-all">
            + 创建技能
          </button>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-5">
                <div className="mb-3 h-4 w-16 rounded bg-neutral-800" />
                <div className="mb-2 h-5 w-3/4 rounded bg-neutral-800" />
                <div className="mb-4 h-8 w-full rounded bg-neutral-800/60" />
              </div>
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 py-20">
            <p className="text-[13px] text-neutral-600">还没有技能，创建第一个吧</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} onUse={(id) => router.push(`/marketplace/skills/${id}`)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
