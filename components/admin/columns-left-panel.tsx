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
  selectedChapterId: string | null;
  chapters: Chapter[];
  loading: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: col.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="space-y-1"
    >
      <div className="flex items-center gap-1 px-2 py-1 group">
        <button
          {...attributes}
          {...listeners}
          className="flex h-5 w-5 cursor-grab items-center justify-center rounded text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity active:cursor-grabbing"
          title="拖拽排序专栏"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>

        <button
          onClick={onToggleExpand}
          className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[var(--text-primary)] truncate">
            {col.title_zh}
          </div>
          {col.title_en && (
            <div className="text-xs text-[var(--text-tertiary)] truncate">{col.title_en}</div>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={onEdit}
            className="rounded p-0.5 text-[var(--text-tertiary)] hover:text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)] transition-colors"
            title="编辑专栏"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="rounded p-0.5 text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
            title="删除专栏"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pl-5 space-y-1">
          {loading && (
            <div className="px-2 py-1 text-xs text-[var(--text-tertiary)]">加载中...</div>
          )}
          {!loading && chapters.length === 0 && (
            <div className="px-2 py-1 text-xs text-[var(--text-tertiary)]">暂无章节</div>
          )}
          {chapters.map((ch) => (
            <ChapterRow
              key={ch.id}
              chapter={ch}
              isSelected={selectedChapterId === ch.id}
              onSelect={() => onSelectChapter(ch.id)}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
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

function ChapterRow({
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
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-1 rounded-[var(--radius-sm)] transition-colors group ${
        isSelected
          ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
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
    </button>
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
  onChapterMutate: (columnId: string, type: "add" | "update" | "delete", payload: Partial<Chapter> & { id: string }) => void;
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
  onChapterMutate,
}: ColumnsLeftPanelProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([selectedColumnId ?? ""]));
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {columns.map((col) => (
              <SortableColumnRow
                key={col.id}
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
                onEdit={() => setEditingColumn(col)}
                onDelete={() => handleDeleteColumn(col)}
                onSelectChapter={(chapterId) => onSelectChapter(col.id, chapterId)}
                selectedChapterId={selectedColumnId === col.id ? selectedChapterId : null}
                chapters={chapterCache.get(col.id) ?? []}
                loading={chapterLoadState.get(col.id) === "loading"}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="border-t border-[var(--border-subtle)] p-3 space-y-2">
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-3 py-2 text-xs font-medium text-[var(--bg-primary)]"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新建专栏
          </button>
        )}
      </div>
    </div>
  );
}
