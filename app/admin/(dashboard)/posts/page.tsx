import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/server";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { ColumnPostsList } from "@/components/admin/column-posts-list";

interface PageProps {
  searchParams: Promise<{ tab?: string; column?: string }>;
}

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const { tab, column } = await searchParams;
  const activeTab = tab === "columns" ? "columns" : "posts";

  const supabase = createAdminClient();

  // 常规文章：column_id 为空
  const postsQuery = supabase
    .from("posts")
    .select(
      `id, slug, status, published_at, created_at, reading_time, view_count,
       title_zh, title_en,
       categories(name_zh)`
    )
    .is("column_id", null)
    .order("created_at", { ascending: false });

  // 专栏列表（tab=columns 时才查）
  const columnsQuery = supabase
    .from("columns")
    .select("id, title_zh")
    .order("sort", { ascending: true });

  // 专栏文章：按选中专栏筛选，带 chapter_id
  const buildColumnPostsQuery = () => {
    if (!column) return supabase.from("posts").select("id").limit(0);
    return supabase
      .from("posts")
      .select(
        `id, slug, status, created_at,
         column_order, chapter_id, title_zh, title_en`
      )
      .eq("column_id", column)
      .order("column_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
  };

  // 章节列表：按选中专栏筛选
  const buildChaptersQuery = () => {
    if (!column) return supabase.from("column_chapters").select("id").limit(0);
    return supabase
      .from("column_chapters")
      .select("id, title_zh, sort")
      .eq("column_id", column)
      .order("sort", { ascending: true });
  };

  const [{ data: posts }, { data: columns }, columnPostsResult, chaptersResult] = await Promise.all([
    activeTab === "posts" ? postsQuery : Promise.resolve({ data: [] }),
    activeTab === "columns" ? columnsQuery : Promise.resolve({ data: [] }),
    activeTab === "columns" ? buildColumnPostsQuery() : Promise.resolve({ data: [] }),
    activeTab === "columns" ? buildChaptersQuery() : Promise.resolve({ data: [] }),
  ]);

  const columnPosts = columnPostsResult?.data ?? [];
  const chapters = chaptersResult?.data ?? [];

  const tabBase =
    "relative pb-2.5 text-sm font-medium transition-colors duration-[var(--duration-fast)]";
  const tabActive =
    "text-[var(--text-primary)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--accent-primary)]";
  const tabInactive = "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]";

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

      {/* Tab 切换 */}
      <div className="mb-4 flex gap-6 border-b border-[var(--border-subtle)]">
        <Link
          href="/admin/posts?tab=posts"
          className={`${tabBase} ${activeTab === "posts" ? tabActive : tabInactive}`}
        >
          常规文章
        </Link>
        <Link
          href="/admin/posts?tab=columns"
          className={`${tabBase} ${activeTab === "columns" ? tabActive : tabInactive}`}
        >
          专栏文章
        </Link>
      </div>

      {/* 常规文章列表 */}
      {activeTab === "posts" && (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">标题</th>
                <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] sm:table-cell">
                  分类
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">状态</th>
                <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] md:table-cell">
                  创建时间
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {!posts || posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-tertiary)]">
                    暂无常规文章，点击右上角「新建文章」开始写作
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
                        <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">EN: {post.title_en}</div>
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
      )}

      {/* 专栏文章列表 */}
      {activeTab === "columns" && (
        <div className="space-y-4">
          {/* 专栏选择器 */}
          <div className="flex flex-wrap items-center gap-2">
            {!columns || columns.length === 0 ? (
              <span className="text-sm text-[var(--text-tertiary)]">暂无专栏，请先创建专栏</span>
            ) : (
              columns.map((col: any) => (
                <Link
                  key={col.id}
                  href={`/admin/posts?tab=columns&column=${col.id}`}
                  className={`rounded-full px-3 py-1 text-sm transition-colors duration-[var(--duration-fast)] ${
                    column === col.id
                      ? "bg-[var(--accent-primary)] text-[var(--bg-primary)]"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {col.title_zh}
                </Link>
              ))
            )}
          </div>

          {/* 文章列表（按章节分组） */}
          <ColumnPostsList
            key={column ?? "no-column"}
            posts={(columnPosts as any) ?? []}
            chapters={(chapters as any) ?? []}
            columnId={column ?? null}
            hasColumnSelected={!!column}
          />
        </div>
      )}
    </div>
  );
}
