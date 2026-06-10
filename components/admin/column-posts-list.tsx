"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { createClient } from "@/utils/supabase/client";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";

interface ColumnPost {
  id: string;
  slug: string;
  status: string;
  created_at: string;
  column_order: number | null;
  chapter_id: string | null;
  title_zh: string;
  title_en: string | null;
  post_tags: { tags: { name_zh: string } | null }[] | null;
}

interface Chapter {
  id: string;
  title_zh: string;
  title_en?: string | null;
  sort: number;
}

interface ColumnPostsListProps {
  posts: ColumnPost[];
  chapters: Chapter[];
  columnId: string | null;
  hasColumnSelected: boolean;
}

// ─── 可拖拽文章行 ──────────────────────────────────────────────────────────────

function SortablePostRow({ post, isSaving }: { post: ColumnPost; isSaving: boolean }) {
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
      {/* 缩进占位 + 文章拖拽手柄 */}
      <td className="w-10 px-3 py-2.5">
        <div className="flex items-center gap-0.5 pl-4">
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
        </div>
      </td>

      {/* 标题（左侧带树状线提示） */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1.5 pl-4">
          <span className="select-none text-xs text-[var(--text-tertiary)]">├</span>
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)]"
          >
            {post.title_zh}
          </Link>
        </div>
        {post.title_en && (
          <div className="mt-0.5 pl-10 text-xs text-[var(--text-tertiary)]">EN: {post.title_en}</div>
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
  );
}

// ─── 章节 inline 编辑表单行 ─────────────────────────────────────────────────────

function ChapterInlineForm({
  columnId,
  chapter,
  onDone,
  onCancel,
}: {
  columnId: string;
  chapter?: Chapter | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [titleZh, setTitleZh] = useState(chapter?.title_zh ?? "");
  const [titleEn, setTitleEn] = useState(chapter?.title_en ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    if (!titleZh.trim()) { setError("请填写章节名称"); return; }
    setSaving(true);
    setError(null);
    const supabase = createClient();

    if (chapter) {
      const { error: err } = await supabase
        .from("column_chapters")
        .update({ title_zh: titleZh, title_en: titleEn || null })
        .eq("id", chapter.id);
      if (err) { setError("更新失败：" + err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("column_chapters").insert({
        column_id: columnId,
        title_zh: titleZh,
        title_en: titleEn || null,
        sort: 9999,
      });
      if (err) { setError("创建失败：" + err.message); setSaving(false); return; }
    }

    setSaving(false);
    router.refresh();
    onDone();
  };

  return (
    <tr className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <td colSpan={6} className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            autoFocus
            value={titleZh}
            onChange={(e) => setTitleZh(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") onCancel();
            }}
            placeholder="章节中文名称 *"
            className="w-44 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
          <input
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") onCancel();
            }}
            placeholder="英文名称（可选）"
            className="w-44 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-medium text-[var(--bg-primary)] disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={onCancel}
            className="rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            取消
          </button>
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      </td>
    </tr>
  );
}

// ─── 章节区块：章节标题行（含拖拽手柄）+ 折叠文章 ────────────────────────────────

interface ChapterSectionProps {
  chapter: Chapter | null;
  columnId: string;
  posts: ColumnPost[];
  onReorder: (chapterId: string | null, newPosts: ColumnPost[]) => Promise<void>;
  isSaving: boolean;
  defaultOpen: boolean;
  // dnd-kit 透传（仅用于章节行手柄）
  dndRef?: (node: HTMLElement | null) => void;
  dndStyle?: React.CSSProperties;
  dndAttributes?: DraggableAttributes;
  dndListeners?: SyntheticListenerMap;
  isDragging?: boolean;
}

function ChapterSection({
  chapter,
  columnId,
  posts,
  onReorder,
  isSaving,
  defaultOpen,
  dndRef,
  dndStyle,
  dndAttributes,
  dndListeners,
  isDragging,
}: ChapterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const postSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handlePostDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = posts.findIndex((p) => p.id === active.id);
    const newIndex = posts.findIndex((p) => p.id === over.id);
    await onReorder(chapter?.id ?? null, arrayMove(posts, oldIndex, newIndex));
  };

  const handleDelete = async () => {
    if (!chapter) return;
    if (posts.length > 0) {
      alert(`该章节下有 ${posts.length} 篇文章，请先将文章移出章节再删除`);
      return;
    }
    if (!confirm(`确定要删除章节「${chapter.title_zh}」吗？`)) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("column_chapters").delete().eq("id", chapter.id);
    if (error) { alert("删除失败：" + error.message); setDeleting(false); return; }
    router.refresh();
  };

  const isUngrouped = chapter === null;

  return (
    <>
      {/* 章节标题行 */}
      {editing && chapter ? (
        <ChapterInlineForm
          columnId={columnId}
          chapter={chapter}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <tr
          ref={dndRef}
          style={{ ...dndStyle, opacity: isDragging ? 0.5 : undefined }}
          className="bg-[var(--bg-secondary)]"
        >
          {/* 章节拖拽手柄 */}
          <td className="w-10 px-3 py-2">
            <div className="flex items-center gap-0.5">
              {!isUngrouped && dndAttributes && dndListeners && (
                <button
                  {...dndAttributes}
                  {...dndListeners}
                  className="flex h-5 w-5 cursor-grab items-center justify-center rounded text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] active:cursor-grabbing"
                  title="拖拽调整章节顺序"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5h16.5M3.75 12h16.5M3.75 19h16.5" />
                  </svg>
                </button>
              )}
              {/* 折叠/展开按钮 */}
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              >
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </td>

          {/* 章节信息 */}
          <td colSpan={4} className="px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                § {isUngrouped ? "未分组" : chapter.title_zh}
              </span>
              {chapter?.title_en && (
                <span className="text-xs text-[var(--text-tertiary)]">{chapter.title_en}</span>
              )}
              <span className="text-xs text-[var(--text-tertiary)]">{posts.length} 篇</span>
            </div>
          </td>

          {/* 章节操作 */}
          <td className="px-4 py-2 text-right">
            {!isUngrouped && (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]"
                >
                  编辑
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--error)] hover:bg-[var(--error)]/10 disabled:opacity-50"
                >
                  删除
                </button>
              </div>
            )}
          </td>
        </tr>
      )}

      {/* 折叠区：文章列表 */}
      {open && (
        <>
          {posts.length === 0 ? (
            <tr className="border-t border-[var(--border-subtle)]">
              <td colSpan={6} className="px-4 py-2 pl-14 text-xs text-[var(--text-tertiary)]">
                暂无文章
              </td>
            </tr>
          ) : (
            <DndContext
              sensors={postSensors}
              collisionDetection={closestCenter}
              onDragEnd={handlePostDragEnd}
            >
              <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                {posts.map((post) => (
                  <SortablePostRow key={post.id} post={post} isSaving={isSaving} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </>
      )}
    </>
  );
}

// ─── 可拖拽章节区块（章节间排序） ──────────────────────────────────────────────────

function SortableChapterSection(props: Omit<ChapterSectionProps, "dndRef" | "dndStyle" | "dndAttributes" | "dndListeners" | "isDragging"> & { chapter: Chapter }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.chapter.id });

  return (
    <ChapterSection
      {...props}
      dndRef={setNodeRef}
      dndStyle={{ transform: CSS.Transform.toString(transform), transition }}
      dndAttributes={attributes}
      dndListeners={listeners}
      isDragging={isDragging}
    />
  );
}

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

function buildGroupedPosts(
  posts: ColumnPost[],
  chapters: Chapter[]
): Map<string | null, ColumnPost[]> {
  const map = new Map<string | null, ColumnPost[]>();
  chapters.forEach((ch) => map.set(ch.id, []));
  map.set(null, []);
  posts.forEach((post) => {
    const key = post.chapter_id && map.has(post.chapter_id) ? post.chapter_id : null;
    map.get(key)!.push(post);
  });
  return map;
}

// ─── 主组件 ────────────────────────────────────────────────────────────────────

export function ColumnPostsList({
  posts: initialPosts,
  chapters: initialChapters,
  columnId,
  hasColumnSelected,
}: ColumnPostsListProps) {
  const router = useRouter();
  const [chapters, setChapters] = useState(initialChapters);
  const [groupedPosts, setGroupedPosts] = useState<Map<string | null, ColumnPost[]>>(() =>
    buildGroupedPosts(initialPosts, initialChapters)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showNewChapterForm, setShowNewChapterForm] = useState(false);

  // 章节间排序的传感器
  const chapterSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 文章排序保存
  const handlePostReorder = async (chapterId: string | null, newPosts: ColumnPost[]) => {
    let offset = 0;
    for (const [key, ps] of groupedPosts) {
      if (key === chapterId) break;
      offset += ps.length;
    }

    setGroupedPosts((prev) => {
      const next = new Map(prev);
      next.set(chapterId, newPosts);
      return next;
    });
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const results = await Promise.all(
        newPosts.map((p, i) =>
          supabase.from("posts").update({ column_order: offset + i }).eq("id", p.id)
        )
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        setGroupedPosts(buildGroupedPosts(initialPosts, chapters));
        setErrorMsg("排序保存失败：" + failed.error.message);
        return;
      }
      router.refresh();
    } catch {
      setErrorMsg("排序保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  // 章节间排序保存
  const handleChapterDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);
    const newChapters = arrayMove(chapters, oldIndex, newIndex);

    setChapters(newChapters);
    setGroupedPosts(buildGroupedPosts(initialPosts, newChapters));
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const results = await Promise.all(
        newChapters.map((c, i) =>
          supabase.from("column_chapters").update({ sort: i }).eq("id", c.id)
        )
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        setChapters(initialChapters);
        setGroupedPosts(buildGroupedPosts(initialPosts, initialChapters));
        setErrorMsg("章节排序保存失败：" + failed.error.message);
        return;
      }
      router.refresh();
    } catch {
      setChapters(initialChapters);
      setGroupedPosts(buildGroupedPosts(initialPosts, initialChapters));
      setErrorMsg("章节排序保存失败，请重试");
    }
  };

  // ── 未选专栏占位 ──
  if (!hasColumnSelected) {
    return (
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
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-tertiary)]">
                请在上方选择一个专栏查看并管理章节
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const ungroupedPosts = groupedPosts.get(null) ?? [];

  return (
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
          {/* 全局状态提示 */}
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

          {chapters.length === 0 && initialPosts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-tertiary)]">
                该专栏暂无章节和文章，点击下方「新建章节」开始
              </td>
            </tr>
          ) : (
            <>
              {/* 章节列表（支持章节间拖拽排序） */}
              <DndContext
                sensors={chapterSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleChapterDragEnd}
              >
                <SortableContext
                  items={chapters.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {chapters.map((ch, idx) => (
                    <SortableChapterSection
                      key={ch.id}
                      chapter={ch}
                      columnId={columnId!}
                      posts={groupedPosts.get(ch.id) ?? []}
                      onReorder={handlePostReorder}
                      isSaving={isSaving}
                      defaultOpen={idx === 0}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* 未分组文章（若有） */}
              {ungroupedPosts.length > 0 && (
                <ChapterSection
                  chapter={null}
                  columnId={columnId!}
                  posts={ungroupedPosts}
                  onReorder={handlePostReorder}
                  isSaving={isSaving}
                  defaultOpen={true}
                />
              )}
            </>
          )}

          {/* 新建章节入口 */}
          {showNewChapterForm && columnId ? (
            <ChapterInlineForm
              columnId={columnId}
              onDone={() => {
                setShowNewChapterForm(false);
                router.refresh();
              }}
              onCancel={() => setShowNewChapterForm(false)}
            />
          ) : (
            <tr className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
              <td colSpan={6} className="px-4 py-2.5">
                <button
                  onClick={() => setShowNewChapterForm(true)}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] transition-colors hover:text-[var(--accent-primary)]"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  新建章节
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
