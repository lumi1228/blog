import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 获取统计数据
  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  const { count: publishedCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const { count: draftCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  const stats = [
    { label: "总文章数", value: postCount || 0, color: "var(--accent-primary)" },
    { label: "已发布", value: publishedCount || 0, color: "var(--success)" },
    { label: "草稿", value: draftCount || 0, color: "var(--warning)" },
    { label: "分类数", value: categoryCount || 0, color: "var(--accent-secondary)" },
  ];

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        概览
      </h1>

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5"
          >
            <div className="mb-1 text-xs text-[var(--text-tertiary)]">
              {stat.label}
            </div>
            <div
              className="text-3xl font-bold"
              style={{ color: stat.color, fontFamily: "var(--font-display)" }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
          快捷操作
        </h2>
        <div className="flex gap-3">
          <a
            href="/admin/posts"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新建文章
          </a>
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all duration-[var(--duration-fast)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            查看前台
          </a>
        </div>
      </div>
    </div>
  );
}
