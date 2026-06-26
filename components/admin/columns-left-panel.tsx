"use client";

import { useState } from "react";
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
import type { Column, Chapter } from "@/components/admin/columns-workspace";

// ─── 可拖拽专栏行 ──────────────────────────────────────────────────────────

function SortableColumnRow({
  col,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onSelectChapter,
  onEditChapter,
  onDeleteChapter,
  onReorderChapters,
  selectedChapterId,
  chapters,
  loading,
}: {
  col: Column;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSelectChapter: (chapterId: string | null) => void;
  onEditChapter: (ch: Chapter) => void;
  onDeleteChapter: (ch: Chapter) => void;
  onReorderChapters: (reordered: Chapter[]) => void;
  selectedChapterId: string | null;
  chapters: Chapter[];
  loading: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: col.id });

  const chapterSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleChapterDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = chapters.findIndex((c) => c.id === active.id);
    const newIdx = chapters.findIndex((c) => c.id === over.id);
    onReorderChapters(arrayMove(chapters, oldIdx, newIdx));
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="space-y-1"
    >
      <div className="flex items-center gap-1 px-2 py-1 group">
        <button
          {...attributes}
          {...listeners}
          className="flex h-5 w-5 cursor-grab items-center justify-center rounded text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] active:cursor-grabbing"
          title="拖拽排序专栏"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
        <button
          onClick={onToggleExpand}
          className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[var(--text-primary)] truncate">{col.title_zh}</div>
          {col.title_en && <div className="text-xs text-[var(--text-tertiary)] truncate">{col.title_en}</div>}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onEdit} className="rounded p-0.5 text-[var(--text-tertiary)] hover:text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)] transition-colors" title="编辑专栏">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={onDelete} className="rounded p-0.5 text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors" title="删除专栏">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pl-5 space-y-1">
          {loading && <div className="px-2 py-1 text-xs text-[var(--text-tertiary)]">加载中...</div>}
          {!loading && chapters.length === 0 && <div className="px-2 py-1 text-xs text-[var(--text-tertiary)]">暂无章节</div>}
          {chapters.length > 0 && (
            <DndContext id={`admin-chapters-${col.id}`} sensors={chapterSensors} collisionDetection={closestCenter} onDragEnd={handleChapterDragEnd}>
              <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {chapters.map((ch) => (
                  <SortableChapterItem
                    key={ch.id}
                    chapter={ch}
                    isSelected={selectedChapterId === ch.id}
                    onSelect={() => onSelectChapter(ch.id)}
                    onEdit={() => onEditChapter(ch)}
                    onDelete={() => onDeleteChapter(ch)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
          <button
            onClick={() => onSelectChapter(null)}
            className={`w-full text-left px-3 py-1 text-xs rounded-[var(--radius-sm)] transition-colors ${
              selectedChapterId === null
                ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            }`}
          >
            （未分组）
          </button>
        </div>
      )}
    </div>
  );
}

function SortableChapterItem({
  chapter,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  chapter: Chapter;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: chapter.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      className={`w-full text-left px-2 py-1 rounded-[var(--radius-sm)] transition-colors group cursor-pointer ${
        isSelected
          ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="flex h-4 w-4 flex-shrink-0 cursor-grab items-center justify-center rounded text-[var(--text-tertiary)] active:cursor-grabbing"
          title="拖拽排序"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="7" r="1.5" /><circle cx="15" cy="7" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="17" r="1.5" /><circle cx="15" cy="17" r="1.5" />
          </svg>
        </button>
        <span className="text-xs flex-shrink-0">§</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{chapter.title_zh}</div>
          {chapter.title_en && (
            <div className="text-xs text-[var(--text-tertiary)] truncate">{chapter.title_en}</div>
          )}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="rounded p-0.5 text-[var(--text-tertiary)] hover:text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)] transition-colors"
            title="编辑"
          >
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded p-0.5 text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
            title="删除"
          >
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 专栏弹框（新建 / 编辑）─────────────────────────────────────────────────

interface ColumnFormData {
  titleZh: string;
  titleEn: string;
  slug: string;
  descriptionZh: string;
  descriptionEn: string;
}

function ColumnModal({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ColumnFormData;
  onSave: (data: ColumnFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ColumnFormData>(
    initial ?? { titleZh: "", titleEn: "", slug: "", descriptionZh: "", descriptionEn: "" }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.titleZh.trim()) { alert("请填写中文名称"); return; }
    if (!form.slug.trim()) { alert("请填写 Slug"); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      {/* 弹框 */}
      <div className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-6 shadow-[var(--shadow-lg)]">
        <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
          {initial ? "编辑专栏" : "新建专栏"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--text-tertiary)]">中文名称 *</label>
            <input
              autoFocus
              placeholder="中文名称"
              value={form.titleZh}
              onChange={(e) => setForm((p) => ({ ...p, titleZh: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-tertiary)]">英文名称</label>
            <input
              placeholder="英文名称"
              value={form.titleEn}
              onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-tertiary)]">Slug *（URL 标识，如 my-column）</label>
            <input
              placeholder="my-column"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-tertiary)]">中文简介</label>
            <input
              placeholder="中文简介"
              value={form.descriptionZh}
              onChange={(e) => setForm((p) => ({ ...p, descriptionZh: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-tertiary)]">英文简介</label>
            <input
              placeholder="英文简介"
              value={form.descriptionEn}
              onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-[var(--radius-md)] bg-[var(--accent-primary)] py-2 text-sm font-medium text-[var(--bg-primary)] disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-[var(--radius-md)] border border-[var(--border-default)] py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 章节弹框（新建 / 编辑）─────────────────────────────────────────────────

function ChapterModal({
  columnId,
  initial,
  maxSort,
  onSave,
  onCancel,
}: {
  columnId: string;
  initial?: Chapter;
  maxSort: number;
  onSave: (ch: Chapter) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ titleZh: initial?.title_zh ?? "", titleEn: initial?.title_en ?? "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.titleZh.trim()) { alert("请填写章节名称"); return; }
    setSaving(true);
    const supabase = createClient();
    if (initial) {
      const { data, error } = await supabase
        .from("column_chapters")
        .update({ title_zh: form.titleZh, title_en: form.titleEn || null })
        .eq("id", initial.id)
        .select("id, column_id, sort, title_zh, title_en")
        .single();
      if (error) { alert("更新失败：" + error.message); setSaving(false); return; }
      onSave(data as Chapter);
    } else {
      const { data, error } = await supabase
        .from("column_chapters")
        .insert({ column_id: columnId, title_zh: form.titleZh, title_en: form.titleEn || null, sort: maxSort + 1 })
        .select("id, column_id, sort, title_zh, title_en")
        .single();
      if (error) { alert("创建失败：" + error.message); setSaving(false); return; }
      onSave(data as Chapter);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      {/* 弹框 */}
      <div className="relative w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-6 shadow-[var(--shadow-lg)]">
        <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
          {initial ? "编辑章节" : "新建章节"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--text-tertiary)]">中文名称 *</label>
            <input
              autoFocus
              value={form.titleZh}
              onChange={(e) => setForm((p) => ({ ...p, titleZh: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onCancel(); }}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-tertiary)]">英文名称</label>
            <input
              value={form.titleEn}
              onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onCancel(); }}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-[var(--radius-md)] bg-[var(--accent-primary)] py-2 text-sm font-medium text-[var(--bg-primary)] disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-[var(--radius-md)] border border-[var(--border-default)] py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 主面板 ────────────────────────────────────────────────────────────────

export interface ColumnsLeftPanelProps {
  columns: Column[];
  chapterCache: Map<string, Chapter[]>;
  chapterLoadState: Map<string, "loading" | "loaded" | "error">;
  selectedColumnId: string | null;
  selectedChapterId: string | null;
  onExpandColumn: (columnId: string) => void;
  onSelectChapter: (columnId: string, chapterId: string | null) => void;
  onColumnMutate: (type: "add" | "update" | "delete", payload: Partial<Column> & { id: string }) => void;
  onColumnReorder: (reordered: Column[]) => void;
  onChapterMutate: (columnId: string, type: "add" | "update" | "delete", payload: Partial<Chapter> & { id: string }) => void;
  onChapterReorder: (columnId: string, reordered: Chapter[]) => void;
}

export function ColumnsLeftPanel({
  columns,
  chapterCache,
  chapterLoadState,
  selectedColumnId,
  selectedChapterId,
  onExpandColumn,
  onSelectChapter,
  onColumnMutate,
  onColumnReorder,
  onChapterMutate,
  onChapterReorder,
}: ColumnsLeftPanelProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([selectedColumnId ?? ""]));

  // 专栏表单状态
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [showNewColumnForm, setShowNewColumnForm] = useState(false);

  // 章节表单状态：{ columnId, chapter（编辑时有值） }
  const [chapterFormState, setChapterFormState] = useState<{
    columnId: string;
    chapter?: Chapter;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = columns.findIndex((c) => c.id === active.id);
    const newIdx = columns.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(columns, oldIdx, newIdx);

    // 原子更新整个列表顺序
    onColumnReorder(reordered);

    const supabase = createClient();
    await Promise.all(
      reordered.map((c, i) => supabase.from("columns").update({ sort: i }).eq("id", c.id))
    );
  };

  const handleDeleteColumn = async (col: Column) => {
    if (col.articleCount > 0) {
      alert(`该专栏下有 ${col.articleCount} 篇文章，请先删除文章`);
      return;
    }
    if (!confirm(`确定删除专栏「${col.title_zh}」？`)) return;

    const supabase = createClient();
    await supabase.from("column_chapters").delete().eq("column_id", col.id);
    await supabase.from("columns").delete().eq("id", col.id);
    onColumnMutate("delete", col);
    router.refresh();
  };

  const handleSaveColumn = async (data: ColumnFormData) => {
    const supabase = createClient();
    if (editingColumn) {
      const { data: updated, error } = await supabase
        .from("columns")
        .update({
          title_zh: data.titleZh,
          title_en: data.titleEn || null,
          slug: data.slug,
          description_zh: data.descriptionZh || null,
          description_en: data.descriptionEn || null,
        })
        .eq("id", editingColumn.id)
        .select()
        .single();
      if (error) { alert("更新失败：" + error.message); return; }
      onColumnMutate("update", { ...updated, id: updated.id });
    } else {
      const maxSort = columns.length > 0 ? Math.max(...columns.map((c) => c.sort)) : -1;
      const { data: created, error } = await supabase
        .from("columns")
        .insert({
          title_zh: data.titleZh,
          title_en: data.titleEn || null,
          slug: data.slug,
          description_zh: data.descriptionZh || null,
          description_en: data.descriptionEn || null,
          sort: maxSort + 1,
        })
        .select()
        .single();
      if (error) { alert("创建失败：" + error.message); return; }
      onColumnMutate("add", { ...created, id: created.id, articleCount: 0 });
    }
    setEditingColumn(null);
    setShowNewColumnForm(false);
    router.refresh();
  };

  const handleDeleteChapter = async (columnId: string, ch: Chapter) => {
    if (!confirm(`确定删除章节「${ch.title_zh}」？该章节下的文章将变为未分组。`)) return;
    const supabase = createClient();
    await supabase.from("posts").update({ chapter_id: null }).eq("chapter_id", ch.id);
    const { error } = await supabase.from("column_chapters").delete().eq("id", ch.id);
    if (error) { alert("删除失败：" + error.message); return; }
    onChapterMutate(columnId, "delete", ch);
  };

  const handleReorderChapters = async (columnId: string, reordered: Chapter[]) => {
    // 原子更新缓存顺序
    onChapterReorder(columnId, reordered);
    const supabase = createClient();
    await Promise.all(
      reordered.map((c, i) => supabase.from("column_chapters").update({ sort: i }).eq("id", c.id))
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 章节 Modal */}
      {chapterFormState && (
        <ChapterModal
          columnId={chapterFormState.columnId}
          initial={chapterFormState.chapter}
          maxSort={(() => {
            const chs = chapterCache.get(chapterFormState.columnId) ?? [];
            return chs.length > 0 ? Math.max(...chs.map((c) => c.sort)) : -1;
          })()}
          onSave={(saved) => {
            if (chapterFormState.chapter) {
              onChapterMutate(chapterFormState.columnId, "update", saved);
            } else {
              onChapterMutate(chapterFormState.columnId, "add", saved);
            }
            setChapterFormState(null);
          }}
          onCancel={() => setChapterFormState(null)}
        />
      )}

      {/* 专栏 Modal（新建 / 编辑） */}
      {(showNewColumnForm || editingColumn) && (
        <ColumnModal
          initial={
            editingColumn
              ? {
                  titleZh: editingColumn.title_zh,
                  titleEn: editingColumn.title_en ?? "",
                  slug: editingColumn.slug,
                  descriptionZh: editingColumn.description_zh ?? "",
                  descriptionEn: editingColumn.description_en ?? "",
                }
              : undefined
          }
          onSave={handleSaveColumn}
          onCancel={() => { setEditingColumn(null); setShowNewColumnForm(false); }}
        />
      )}

      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        <DndContext id="admin-columns" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {columns.map((col) => {
              const chapters = chapterCache.get(col.id) ?? [];
              return (
                <div key={col.id}>
                  <SortableColumnRow
                    col={col}
                    isExpanded={expandedIds.has(col.id)}
                    onToggleExpand={() => {
                      if (!expandedIds.has(col.id)) {
                        onExpandColumn(col.id);
                        setExpandedIds((s) => new Set([...s, col.id]));
                      } else {
                        setExpandedIds((s) => {
                          const next = new Set(s);
                          next.delete(col.id);
                          return next;
                        });
                      }
                    }}
                    onEdit={() => { setEditingColumn(col); setShowNewColumnForm(false); }}
                    onDelete={() => handleDeleteColumn(col)}
                    onSelectChapter={(chapterId) => onSelectChapter(col.id, chapterId)}
                    onEditChapter={(ch) => setChapterFormState({ columnId: col.id, chapter: ch })}
                    onDeleteChapter={(ch) => handleDeleteChapter(col.id, ch)}
                    onReorderChapters={(reordered) => handleReorderChapters(col.id, reordered)}
                    selectedChapterId={selectedColumnId === col.id ? selectedChapterId : null}
                    chapters={chapters}
                    loading={chapterLoadState.get(col.id) === "loading"}
                  />

                  {/* 新建章节按钮：仅在展开时显示 */}
                  {expandedIds.has(col.id) && (
                    <button
                      onClick={() => setChapterFormState({ columnId: col.id })}
                      className="ml-5 flex items-center gap-1 px-3 py-0.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      新建章节
                    </button>
                  )}
                </div>
              );
            })}
          </SortableContext>
        </DndContext>
      </div>

      <div className="border-t border-[var(--border-subtle)] p-3">
        <button
          onClick={() => setShowNewColumnForm(true)}
          className="w-full flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-3 py-2 text-xs font-medium text-[var(--bg-primary)]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新建专栏
        </button>
      </div>
    </div>
  );
}

