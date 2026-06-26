"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/utils/supabase/client";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { PostEditor } from "@/components/admin/post-editor";
import { PostEditorModal } from "@/components/admin/post-editor-modal";
import type { Column, Chapter, Post } from "@/components/admin/columns-workspace";

interface ColumnsRightPanelProps {
  selectedColumn: Column | null;
  selectedChapter: Chapter | null;
  posts: Post[];
  loading: boolean;
  onPostsMutated: () => void;
}

// ─── 可拖拽文章行 ──────────────────────────────────────────────────────────────

function SortablePostRow({
  post,
  isSaving,
  onDeleted,
  onEdit,
}: {
  post: Post;
  isSaving: boolean;
  onDeleted: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: post.id });

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: isDragging ? ("relative" as const) : undefined,
      }}
      className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--bg-secondary)]"
    >
      {/* 拖拽手柄 */}
      <td className="w-10 px-3 py-2.5">
        <button
          {...attributes}
          {...listeners}
          disabled={isSaving}
          className="flex h-5 w-5 cursor-grab items-center justify-center rounded text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
          title="拖拽排序"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5h16.5M3.75 12h16.5M3.75 19h16.5" />
          </svg>
        </button>
      </td>

      {/* 标题 */}
      <td className="px-4 py-2.5">
        <button
          onClick={() => onEdit(post.id)}
          className="text-left text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)]"
        >
          {post.title_zh}
        </button>
        {post.title_en && (
          <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">EN: {post.title_en}</div>
        )}
      </td>

      {/* 标签 */}
      <td className="hidden px-4 py-2.5 lg:table-cell">
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
          <span className="text-xs text-[var(--text-tertiary)]">-</span>
        )}
      </td>

      {/* 状态 */}
      <td className="px-4 py-2.5">
        <ToggleStatusButton postId={post.id} currentStatus={post.status} />
      </td>

      {/* 创建时间 */}
      <td className="hidden px-4 py-2.5 text-xs text-[var(--text-tertiary)] md:table-cell">
        {new Date(post.created_at).toLocaleDateString("zh-CN")}
      </td>

      {/* 操作 */}
      <td className="px-4 py-2.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(post.id)}
            className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]"
          >
            编辑
          </button>
          <DeletePostButton
            postId={post.id}
            title={post.title_zh}
            onDeleted={() => onDeleted(post.id)}
          />
        </div>
      </td>
    </tr>
  );
}

// ─── 右侧面板主体 ──────────────────────────────────────────────────────────────

export function ColumnsRightPanel({
  selectedColumn,
  selectedChapter,
  posts: initialPosts,
  loading,
  onPostsMutated,
}: ColumnsRightPanelProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 弹框状态
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editInitialData, setEditInitialData] = useState<any>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  // 编辑器所需元数据
  const [meta, setMeta] = useState<{
    categories: any[];
    tags: any[];
    columns: any[];
    chapters: any[];
  } | null>(null);

  // 新建弹框状态
  const [showNew, setShowNew] = useState(false);

  // 外部切换章节时同步文章列表
  useEffect(() => {
    setPosts(initialPosts);
    setErrorMsg(null);
  }, [initialPosts]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = posts.findIndex((p) => p.id === active.id);
      const newIndex = posts.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(posts, oldIndex, newIndex);

      setPosts(reordered);
      setIsSaving(true);
      setErrorMsg(null);

      try {
        const supabase = createClient();
        const results = await Promise.all(
          reordered.map((p, i) =>
            supabase.from("posts").update({ column_order: i }).eq("id", p.id)
          )
        );
        const failed = results.find((r) => r.error);
        if (failed?.error) {
          setPosts(initialPosts);
          setErrorMsg("排序保存失败：" + failed.error.message);
          return;
        }
        onPostsMutated();
        router.refresh();
      } catch {
        setPosts(initialPosts);
        setErrorMsg("排序保存失败，请重试");
      } finally {
        setIsSaving(false);
      }
    },
    [posts, initialPosts, onPostsMutated, router]
  );

  const handleDeleted = useCallback(
    (id: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      onPostsMutated();
    },
    [onPostsMutated]
  );

  // 拉取元数据（只拉一次，缓存在 state 中）
  const fetchMeta = useCallback(async () => {
    if (meta) return meta;
    const supabase = createClient();
    const [{ data: categories }, { data: tags }, { data: columns }, { data: chapters }] =
      await Promise.all([
        supabase.from("categories").select("id, slug, name_zh").order("sort"),
        supabase.from("tags").select("id, slug, name_zh").order("name_zh"),
        supabase.from("columns").select("id, slug, title_zh").order("sort"),
        supabase.from("column_chapters").select("id, column_id, title_zh").order("sort"),
      ]);
    const result = {
      categories: categories || [],
      tags: tags || [],
      columns: columns || [],
      chapters: chapters || [],
    };
    setMeta(result);
    return result;
  }, [meta]);

  // 打开新建弹框
  const openNew = useCallback(async () => {
    await fetchMeta();
    setEditInitialData(null);
    setShowNew(true);
  }, [fetchMeta]);

  // 打开编辑弹框
  const openEdit = useCallback(
    async (postId: string) => {
      setLoadingEdit(true);
      setEditPostId(postId);

      await fetchMeta();

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
    },
    [fetchMeta]
  );

  // 关闭弹框，刷新文章列表
  const handleClose = useCallback(() => {
    setEditPostId(null);
    setEditInitialData(null);
    setShowNew(false);
    onPostsMutated();
    router.refresh();
  }, [onPostsMutated, router]);

  const isModalOpen = showNew || editPostId !== null;
  const modalTitle = showNew ? "新建文章" : "编辑文章";

  // ── 未选专栏 ──
  if (!selectedColumn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
        <svg className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-sm">请在左侧选择一个章节</p>
      </div>
    );
  }

  // 新建文章时预填专栏/章节
  const newInitialData = {
    slug: "",
    coverImage: "",
    status: "draft" as const,
    categoryId: meta?.categories?.[0]?.id || "",
    tagIds: [],
    titleZh: "",
    titleEn: "",
    excerptZh: "",
    excerptEn: "",
    contentZh: "",
    contentEn: "",
    columnId: selectedColumn.id,
    chapterId: selectedChapter?.id || "",
    showInList: false,
  };

  const breadcrumb = selectedChapter
    ? `${selectedColumn.title_zh} › ${selectedChapter.title_zh}`
    : selectedColumn.title_zh;

  return (
    <>
      {/* 全屏编辑弹框 */}
      {isModalOpen && meta && (
        <PostEditorModal title={modalTitle} onClose={handleClose}>
          {loadingEdit && editPostId && !editInitialData ? (
            <div className="flex h-64 items-center justify-center text-[var(--text-tertiary)]">
              加载中...
            </div>
          ) : (
            <PostEditor
              key={editPostId ?? "new"}
              categories={meta.categories}
              tags={meta.tags}
              columns={meta.columns}
              chapters={meta.chapters}
              initialData={showNew ? newInitialData : editInitialData}
              onClose={handleClose}
            />
          )}
        </PostEditorModal>
      )}

      <div className="flex flex-col h-full overflow-hidden">
        {/* 顶部 header */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4 flex-shrink-0">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] truncate">{breadcrumb}</h2>
          <button
            onClick={openNew}
            className="inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新建文章
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] animate-pulse" />
              ))}
            </div>
          ) : (
            <DndContext
              id="admin-column-posts"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-secondary)]">
                    <tr>
                      <th className="w-10 px-3 py-3" />
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">标题</th>
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
                    {errorMsg && (
                      <tr>
                        <td colSpan={6} className="px-4 py-2 text-center text-xs text-red-500">
                          {errorMsg}
                        </td>
                      </tr>
                    )}
                    {isSaving && (
                      <tr>
                        <td colSpan={6} className="px-4 py-1.5 text-center text-xs text-[var(--text-tertiary)]">
                          正在保存排序...
                        </td>
                      </tr>
                    )}
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-tertiary)]">
                          该章节暂无文章
                        </td>
                      </tr>
                    ) : (
                      <SortableContext
                        items={posts.map((p) => p.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {posts.map((post) => (
                          <SortablePostRow
                            key={post.id}
                            post={post}
                            isSaving={isSaving}
                            onDeleted={handleDeleted}
                            onEdit={openEdit}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </tbody>
                </table>
              </div>
            </DndContext>
          )}
        </div>
      </div>
    </>
  );
}
