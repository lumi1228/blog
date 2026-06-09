"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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

interface Chapter {
  id: string;
  column_id: string;
  sort: number;
  title_zh: string;
  title_en: string | null;
  articleCount: number;
}

interface ColumnInfo {
  id: string;
  title_zh: string;
  title_en: string | null;
  slug: string;
}

interface ChapterManagerProps {
  column: ColumnInfo;
  chapters: Chapter[];
}

// 可拖拽章节行
function SortableChapterRow({
  ch,
  isSaving,
  onEdit,
  onDelete,
}: {
  ch: Chapter;
  isSaving: boolean;
  onEdit: (ch: Chapter) => void;
  onDelete: (ch: Chapter) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ch.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]"
    >
      {/* 拖拽手柄 */}
      <td className="w-10 px-3 py-3">
        <button
          {...attributes}
          {...listeners}
          disabled={isSaving}
          className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
          title="拖拽排序"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5h16.5M3.75 12h16.5M3.75 19h16.5" />
          </svg>
        </button>
      </td>

      {/* 名称 */}
      <td className="px-4 py-3">
        <div className="font-medium text-[var(--text-primary)]">{ch.title_zh}</div>
        {ch.title_en && <div className="text-xs text-[var(--text-tertiary)]">{ch.title_en}</div>}
      </td>

      {/* 文章数 */}
      <td className="hidden px-4 py-3 text-[var(--text-secondary)] sm:table-cell">
        {ch.articleCount}
      </td>

      {/* 操作 */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(ch)}
            className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(ch)}
            className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--error)] hover:bg-[var(--error)]/10"
          >
            删除
          </button>
        </div>
      </td>
    </tr>
  );
}

export function ChapterManager({ column, chapters: initialChapters }: ChapterManagerProps) {
  const router = useRouter();
  const [chapters, setChapters] = useState(initialChapters);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Chapter | null>(null);
  const [form, setForm] = useState({ titleZh: "", titleEn: "" });
  const [saving, setSaving] = useState(false);
  const [sortSaving, setSortSaving] = useState(false);
  const [sortError, setSortError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const resetForm = () => {
    setForm({ titleZh: "", titleEn: "" });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (ch: Chapter) => {
    setForm({ titleZh: ch.title_zh, titleEn: ch.title_en || "" });
    setEditing(ch);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.titleZh.trim()) {
      alert("请填写章节名称");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const data = {
      column_id: column.id,
      title_zh: form.titleZh,
      title_en: form.titleEn || null,
      sort: editing ? editing.sort : (chapters.length > 0 ? Math.max(...chapters.map((c) => c.sort)) + 1 : 0),
    };

    if (editing) {
      const { error } = await supabase.from("column_chapters").update(data).eq("id", editing.id);
      if (error) {
        alert("更新失败：" + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("column_chapters").insert(data);
      if (error) {
        alert("创建失败：" + error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    resetForm();
    router.refresh();
  };

  const handleDelete = async (ch: Chapter) => {
    if (ch.articleCount > 0) {
      alert(`该章节下有 ${ch.articleCount} 篇文章，请先将文章移出章节再删除`);
      return;
    }
    if (!confirm(`确定要删除章节「${ch.title_zh}」吗？`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("column_chapters").delete().eq("id", ch.id);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    router.refresh();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);
    const newChapters = arrayMove(chapters, oldIndex, newIndex);

    setChapters(newChapters);
    setSortSaving(true);
    setSortError(null);

    try {
      const supabase = createClient();
      const updates = newChapters.map((c, i) =>
        supabase.from("column_chapters").update({ sort: i }).eq("id", c.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        setChapters(initialChapters);
        setSortError("排序保存失败：" + failed.error.message);
        return;
      }
      router.refresh();
    } catch {
      setChapters(initialChapters);
      setSortError("排序保存失败，请重试");
    } finally {
      setSortSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 返回 + 标题 */}
      <div className="flex items-center gap-3">
        <a
          href="/admin/columns"
          className="rounded-[var(--radius-md)] p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </a>
        <h1
          className="text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          章节管理
        </h1>
        <span className="text-sm text-[var(--text-tertiary)]">— {column.title_zh}</span>
      </div>

      {/* 新建按钮 */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新建章节
        </button>
      )}

      {/* 编辑表单 */}
      {showForm && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            {editing ? "编辑章节" : "新建章节"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">中文名称 *</label>
              <input
                value={form.titleZh}
                onChange={(e) => setForm((p) => ({ ...p, titleZh: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">英文名称</label>
              <input
                value={form.titleEn}
                onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-[var(--radius-md)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 章节列表 */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="w-10 px-3 py-3" />
                <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">名称</th>
                <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] sm:table-cell">
                  文章数
                </th>
                <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortError && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center text-sm text-red-500">
                    {sortError}
                  </td>
                </tr>
              )}
              {sortSaving && (
                <tr>
                  <td colSpan={4} className="px-4 py-1.5 text-center text-xs text-[var(--text-tertiary)]">
                    正在保存排序...
                  </td>
                </tr>
              )}
              {chapters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[var(--text-tertiary)]">
                    暂无章节，点击上方「新建章节」开始创建
                  </td>
                </tr>
              ) : (
                <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  {chapters.map((ch) => (
                    <SortableChapterRow
                      key={ch.id}
                      ch={ch}
                      isSaving={sortSaving}
                      onEdit={startEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              )}
            </tbody>
          </table>
        </div>
      </DndContext>
    </div>
  );
}
