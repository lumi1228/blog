"use client";

import Link from "next/link";
import { useState } from "react";
import type { Post } from "@/lib/types";

interface Chapter {
  id: string;
  title: string;
  sort: number;
  posts: (Post & { readingTime: number })[];
}

interface DocsChaptersListProps {
  /** 文档集 slug */
  setSlug: string;
  chapters: Chapter[];
  /** 空状态文案 */
  emptyText: string;
}

/**
 * 文档集概览页的章节目录列表。
 * 基于原 ColumnChaptersList，链接指向 /docs/[set]/[slug]。
 */
export function DocsChaptersList({
  setSlug,
  chapters,
  emptyText,
}: DocsChaptersListProps) {
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    chapters.forEach((ch) => {
      initial[ch.id] = true;
    });
    return initial;
  });

  function toggleChapter(chapterId: string) {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  }

  if (chapters.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => {
        const isExpanded = expandedChapters[chapter.id] ?? true;

        return (
          <section
            key={chapter.id}
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden"
          >
            {/* 章节标题行 —— 可点击收起/展开 */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="group w-full flex items-center gap-3 px-5 py-4
                         transition-colors duration-[var(--duration-fast)]
                         hover:bg-[var(--bg-tertiary)]"
            >
              {/* 序号 badge */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-xs font-bold text-[var(--accent-primary)]">
                {chapter.sort < 9999 ? chapter.sort : "·"}
              </span>

              {/* 章节名 */}
              <span
                className="flex-1 text-left text-base font-semibold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {chapter.title}
              </span>

              {/* 文章数 */}
              <span className="text-xs text-[var(--text-tertiary)] mr-1">
                {chapter.posts.length} 篇
              </span>

              {/* 展开/收起箭头 */}
              <svg
                className={`h-4 w-4 shrink-0 text-[var(--text-tertiary)] transition-transform duration-[var(--duration-normal)]
                            ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 文章列表（高度过渡动画） */}
            <div
              className="overflow-hidden transition-all duration-[var(--duration-normal)]"
              style={{
                maxHeight: isExpanded
                  ? `${chapter.posts.length * 52 + 16}px`
                  : "0px",
                opacity: isExpanded ? 1 : 0,
              }}
            >
              <div className="px-4 pb-3">
                {/* 分割线 */}
                <div
                  className="mb-2 h-px"
                  style={{
                    background:
                      "linear-gradient(to right, var(--accent-primary), transparent)",
                    opacity: 0.3,
                  }}
                />

                {chapter.posts.length === 0 ? (
                  <p className="py-3 text-xs text-[var(--text-tertiary)] pl-9">
                    暂无内容
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {chapter.posts.map((post, idx) => (
                      <Link
                        key={post.id}
                        href={`/docs/${setSlug}/${post.slug}`}
                        className="group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5
                                   transition-colors duration-[var(--duration-fast)]
                                   hover:bg-[var(--bg-tertiary)]"
                      >
                        {/* 序号 */}
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-tertiary)] group-hover:bg-[var(--accent-muted)] group-hover:text-[var(--accent-primary)] transition-colors duration-[var(--duration-fast)]">
                          {idx + 1}
                        </span>

                        {/* 标题 */}
                        <span className="flex-1 text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-[var(--duration-fast)] line-clamp-1">
                          {post.title}
                        </span>

                        {/* 阅读时长 */}
                        {post.readingTime > 0 && (
                          <span className="shrink-0 text-xs text-[var(--text-tertiary)]">
                            {post.readingTime} min
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
