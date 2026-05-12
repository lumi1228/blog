import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";

export default async function AdminPostsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      id, slug, status, published_at, created_at, reading_time, view_count,
      title_zh, title_en,
      categories(name_zh)
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          文章管理
        </h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新建文章
        </Link>
      </div>

      {/* 文章列表 */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">
                标题
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] sm:table-cell">
                分类
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">
                状态
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] md:table-cell">
                创建时间
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {(!posts || posts.length === 0) ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-tertiary)]">
                  暂无文章，点击右上角「新建文章」开始写作
                </td>
              </tr>
            ) : (
              posts.map((post: any) => (
                <tr
                  key={post.id}
                  className="border-t border-[var(--border-subtle)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--bg-secondary)]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)]"
                    >
                      {post.title_zh}
                    </Link>
                    {post.title_en && (
                      <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                        EN: {post.title_en}
                      </div>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--text-secondary)] sm:table-cell">
                    {(post.categories as any)?.name_zh || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <ToggleStatusButton postId={post.id} currentStatus={post.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--text-tertiary)] md:table-cell">
                    {new Date(post.created_at).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]"
                      >
                        编辑
                      </Link>
                      <DeletePostButton postId={post.id} title={post.title_zh} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
