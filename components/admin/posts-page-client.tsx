"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { PostEditor } from "@/components/admin/post-editor";
import { PostEditorModal } from "@/components/admin/post-editor-modal";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";

interface Category { id: string; slug: string; name_zh: string }
interface Tag { id: string; slug: string; name_zh: string }
interface ColumnItem { id: string; slug: string; title_zh: string }
interface ChapterItem { id: string; column_id: string; title_zh: string }

interface Post {
  id: string;
  slug: string;
  status: string;
  created_at: string;
  title_zh: string;
  title_en: string | null;
  category: { name_zh: string } | null;
  post_tags: { tags: { name_zh: string } | null }[] | null;
}

interface PostsPageClientProps {
  initialPosts: Post[];
  categories: Category[];
  tags: Tag[];
  columns: ColumnItem[];
  chapters: ChapterItem[];
}

type ModalMode =
  | { type: "closed" }
  | { type: "new" }
  | { type: "edit"; postId: string };

export function PostsPageClient({
  initialPosts,
  categories,
  tags,
  columns,
  chapters,
}: PostsPageClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [modal, setModal] = useState<ModalMode>({ type: "closed" });
  const [editInitialData, setEditInitialData] = useState<any>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [, startTransition] = useTransition();

  const openNew = useCallback(() => {
    setEditInitialData(null);
    setModal({ type: "new" });
  }, []);

  const openEdit = useCallback(async (postId: string) => {
    setLoadingEdit(true);
    setModal({ type: "edit", postId });

    const supabase = createClient();
    const { data: post } = await supabase
      .from("posts")
      .select(
        `id, slug, cover_image, status,
         title_zh, title_en, excerpt_zh, excerpt_en, content_zh, content_en,
         category_id, column_id, chapter_id, show_in_list,
         post_tags(tag_id)`
      )
      .eq("id", postId)
      .single();

    if (post) {
      setEditInitialData({
        id: post.id,
        slug: post.slug,
        coverImage: post.cover_image || "",
        status: post.status as "draft" | "published",
        categoryId: post.category_id || "",
        tagIds: (post.post_tags || []).map((pt: any) => pt.tag_id),
        titleZh: post.title_zh || "",
        titleEn: post.title_en || "",
        excerptZh: post.excerpt_zh || "",
        excerptEn: post.excerpt_en || "",
        contentZh: post.content_zh || "",
        contentEn: post.content_en || "",
        columnId: post.column_id || "",
        chapterId: post.chapter_id || "",
        showInList: post.show_in_list ?? false,
      });
    }
    setLoadingEdit(false);
  }, []);

  const handleClose = useCallback(() => {
    setModal({ type: "closed" });
    setEditInitialData(null);
    // 刷新列表
    startTransition(() => {
      router.refresh();
    });
    // 同步更新本地列表
    const supabase = createClient();
    supabase
      .from("posts")
      .select(
        `id, slug, status, created_at, title_zh, title_en, category:categories(name_zh), post_tags(tags(name_zh))`
      )
      .is("column_id", null)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data as Post[]);
      });
  }, [router]);

  const isOpen = modal.type !== "closed";
  const modalTitle = modal.type === "new" ? "新建文章" : "编辑文章";

  return (
    <div>
      {/* 全屏弹框 */}
      {isOpen && (
        <PostEditorModal title={modalTitle} onClose={handleClose}>
          {loadingEdit && modal.type === "edit" && !editInitialData ? (
            <div className="flex h-64 items-center justify-center text-[var(--text-tertiary)]">
              加载中...
            </div>
          ) : (
            <PostEditor
              key={modal.type === "edit" ? (modal as any).postId : "new"}
              categories={categories}
              tags={tags}
              columns={columns}
              chapters={chapters}
              initialData={modal.type === "edit" ? editInitialData : undefined}
              onClose={handleClose}
            />
          )}
        </PostEditorModal>
      )}

      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          文章管理
        </h1>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新建文章
        </button>
      </div>

      {/* 文章列表 */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">标题</th>
              <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] sm:table-cell">
                分类
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] lg:table-cell">
                标签
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">状态</th>
              <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] md:table-cell">
                创建时间
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-tertiary)]">
                  暂无常规文章，点击右上角「新建文章」开始写作
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-t border-[var(--border-subtle)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--bg-secondary)]"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(post.id)}
                      className="text-left font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)]"
                    >
                      {post.title_zh}
                    </button>
                    {post.title_en && (
                      <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">EN: {post.title_en}</div>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--text-secondary)] sm:table-cell">
                    {post.category?.name_zh || "-"}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {post.post_tags && post.post_tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {post.post_tags.map((pt, i) =>
                          pt.tags ? (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-full bg-[var(--accent-muted)] px-2 py-0.5 text-xs text-[var(--accent-secondary)]"
                            >
                              {pt.tags.name_zh}
                            </span>
                          ) : null
                        )}
                      </div>
                    ) : (
                      <span className="text-[var(--text-tertiary)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ToggleStatusButton postId={post.id} currentStatus={post.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--text-tertiary)] md:table-cell">
                    {new Date(post.created_at).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(post.id)}
                        className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]"
                      >
                        编辑
                      </button>
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
