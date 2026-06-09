"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Column {
  id: string;
  slug: string;
  sort: number;
  title_zh: string;
  title_en: string | null;
  description_zh: string | null;
  description_en: string | null;
  cover_image: string | null;
  articleCount: number;
}

interface ColumnManagerProps {
  columns: Column[];
}

// 单行可拖拽组件
function SortableRow({
  col,
  onEdit,
  onDelete,
}: {
  col: Column;
  onEdit: (col: Column) => void;
  onDelete: (col: Column) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: col.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]"
    >
      {/* 拖拽把手 */}
      <td className="w-8 px-2 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent-secondary)] active:cursor-grabbing"
          aria-label="拖拽排序"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {col.cover_image && (
            <img src={col.cover_image} alt="" className="h-8 w-8 rounded object-cover" />
          )}
          <div>
            <div className="font-medium text-[var(--text-primary)]">{col.title_zh}</div>
            {col.title_en && (
              <div className="text-xs text-[var(--text-tertiary)]">{col.title_en}</div>
            )}
          </div>
        </div>
      </td>
      <td
        className="px-4 py-3 text-[var(--text-tertiary)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {col.slug}
      </td>
      <td className="hidden px-4 py-3 text-[var(--text-secondary)] sm:table-cell">
        {col.articleCount}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(col)}
            className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(col)}
            className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--error)] hover:bg-[var(--error)]/10"
          >
            删除
          </button>
        </div>
      </td>
    </tr>
  );
}

export function ColumnManager({ columns: initialColumns }: ColumnManagerProps) {
  const router = useRouter();
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Column | null>(null);
  const [form, setForm] = useState({
    titleZh: "",
    titleEn: "",
    slug: "",
    descriptionZh: "",
    descriptionEn: "",
    coverImage: "",
  });
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const resetForm = () => {
    setForm({ titleZh: "", titleEn: "", slug: "", descriptionZh: "", descriptionEn: "", coverImage: "" });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (col: Column) => {
    setForm({
      titleZh: col.title_zh,
      titleEn: col.title_en || "",
      slug: col.slug,
      descriptionZh: col.description_zh || "",
      descriptionEn: col.description_en || "",
      coverImage: col.cover_image || "",
    });
    setEditing(col);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.titleZh.trim() || !form.slug.trim()) {
      alert("请填写专栏名称和 Slug");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const data = {
      title_zh: form.titleZh,
      title_en: form.titleEn || null,
      slug: form.slug,
      description_zh: form.descriptionZh || null,
      description_en: form.descriptionEn || null,
      cover_image: form.coverImage || null,
    };

    if (editing) {
      const { error } = await supabase.from("columns").update(data).eq("id", editing.id);
      if (error) {
        alert("更新失败：" + error.message);
        setSaving(false);
        return;
      }
    } else {
      const maxSort = columns.length > 0 ? Math.max(...columns.map((c) => c.sort)) : -1;
      const { error } = await supabase.from("columns").insert({ ...data, sort: maxSort + 1 });
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

  const handleDelete = async (col: Column) => {
    if (col.articleCount > 0) {
      alert(`该专栏下有 ${col.articleCount} 篇文章，请先移动或删除文章`);
      return;
    }
    if (!confirm(`确定要删除专栏「${col.title_zh}」吗？\n此操作将同时删除所有关联的章节。`)) return;

    const supabase = createClient();
    await supabase.from("column_chapters").delete().eq("column_id", col.id);
    const { error } = await supabase.from("columns").delete().eq("id", col.id);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    router.refresh();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex((c) => c.id === active.id);
    const newIndex = columns.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(columns, oldIndex, newIndex);

    // 重新分配连续 sort 值
    const updated = reordered.map((col, i) => ({ ...col, sort: i }));
    setColumns(updated);

    // 批量写入数据库
    const supabase = createClient();
    await Promise.all(
      updated.map((col) => supabase.from("columns").update({ sort: col.sort }).eq("id", col.id))
    );
  };

  return (
    <div className="space-y-6">
      {/* 新建按钮 */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新建专栏
        </button>
      )}

      {/* 编辑表单 */}
      {showForm && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            {editing ? "编辑专栏" : "新建专栏"}
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
            <div>
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="url-friendly-name"
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">中文描述</label>
              <textarea
                value={form.descriptionZh}
                onChange={(e) => setForm((p) => ({ ...p, descriptionZh: e.target.value }))}
                rows={2}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">封面图 URL</label>
              <input
                value={form.coverImage}
                onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none"
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

      {/* 专栏列表 */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="w-8 px-2 py-3" />
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">名称</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Slug</th>
              <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] sm:table-cell">
                文章数
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">操作</th>
            </tr>
          </thead>
          <tbody>
            {columns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-tertiary)]">
                  暂无专栏，点击上方「新建专栏」开始创建
                </td>
              </tr>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columns.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columns.map((col) => (
                    <SortableRow
                      key={col.id}
                      col={col}
                      onEdit={startEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
