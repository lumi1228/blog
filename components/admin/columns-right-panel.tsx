"use client";

import Link from "next/link";
import { ColumnPostsList } from "@/components/admin/column-posts-list";
import type { Column, Chapter, Post } from "@/components/admin/columns-workspace";

interface ColumnsRightPanelProps {
  selectedColumn: Column | null;
  selectedChapter: Chapter | null;
  currentChapters: Chapter[];
  posts: Post[];
  loading: boolean;
  onPostsMutated: (chapterId: string | null) => void;
}

export function ColumnsRightPanel({
  selectedColumn,
  selectedChapter,
  currentChapters,
  posts,
  loading,
  onPostsMutated,
}: ColumnsRightPanelProps) {
  if (!selectedColumn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
        <svg className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.523 0 10-4.748 10-10.747 0-6.002-4.477-10.747-10-10.747z" />
        </svg>
        <p className="text-sm">请在左侧选择一个专栏</p>
      </div>
    );
  }

  const breadcrumb = selectedChapter
    ? `${selectedColumn.title_zh} > § ${selectedChapter.title_zh}`
    : `${selectedColumn.title_zh}`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 顶部 header */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4 flex-shrink-0">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">{breadcrumb}</h2>
        <Link
          href={`/admin/posts/new?column_id=${selectedColumn.id}`}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新建文章
        </Link>
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
          <ColumnPostsList
            posts={posts}
            chapters={currentChapters}
            columnId={selectedColumn.id}
            hasColumnSelected={true}
          />
        )}
      </div>
    </div>
  );
}
