"use client";

import Link from "next/link";
import { useState } from "react";
import type { ColumnChapter, Post } from "@/lib/types";

interface ColumnSidebarProps {
  columnSlug: string;
  columnTitle: string;
  chapters: (ColumnChapter & { posts: Post[] })[];
  currentPostSlug: string;
}

/** 判断某章节是否包含当前文章，用于初始化展开状态 */
function chapterHasActivePost(
  chapter: ColumnChapter & { posts: Post[] },
  currentSlug: string
) {
  return chapter.posts.some((p) => p.slug === currentSlug);
}

export function ColumnSidebar({
  columnSlug,
  columnTitle,
  chapters,
  currentPostSlug,
}: ColumnSidebarProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 每个章节独立的展开/收起状态
  // 默认：包含当前文章的章节展开，其余展开（符合"默认展开"的需求）
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    chapters.forEach((ch) => {
      // 默认全部展开；当前活跃章节一定展开
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

  return (
    <aside
      className={`shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all duration-[var(--duration-normal)] ${
        sidebarCollapsed ? "w-12" : "w-64"
      } hidden lg:block`}
    >
      {/* 折叠侧边栏按钮 + 专栏标题 */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] 
                     text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]
                     transition-colors duration-[var(--duration-fast)]"
          title={sidebarCollapsed ? "展开目录" : "收起目录"}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-[var(--duration-normal)] ${
              sidebarCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
        {!sidebarCollapsed && (
          <Link
            href={`/columns/${columnSlug}`}
            className="text-sm font-semibold text-[var(--text-primary)] truncate hover:text-[var(--accent-primary)] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {columnTitle}
          </Link>
        )}
      </div>

      {/* 目录内容 */}
      {!sidebarCollapsed && (
        <nav className="max-h-[calc(100vh-8rem)] overflow-y-auto p-3">
          <ul className="space-y-1">
            {chapters.map((chapter) => {
              const isExpanded = expandedChapters[chapter.id] ?? true;
              const hasActive = chapterHasActivePost(chapter, currentPostSlug);

              return (
                <li key={chapter.id}>
                  {/* 章节标题行（可点击收起/展开） */}
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className={`group w-full flex items-center gap-2 rounded-[var(--radius-sm)] px-1 py-1.5
                                transition-colors duration-[var(--duration-fast)]
                                hover:bg-[var(--bg-tertiary)]
                                ${hasActive ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`}
                  >
                    {/* 序号 badge */}
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[10px] font-bold transition-colors duration-[var(--duration-fast)]
                                  ${hasActive ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] group-hover:bg-[var(--accent-muted)] group-hover:text-[var(--accent-primary)]"}`}
                    >
                      {chapter.sort < 9999 ? chapter.sort : "·"}
                    </span>

                    {/* 章节名 */}
                    <span className="flex-1 text-left text-xs font-semibold truncate">
                      {chapter.title}
                    </span>

                    {/* 展开/收起箭头 */}
                    <svg
                      className={`h-3 w-3 shrink-0 transition-transform duration-[var(--duration-normal)] text-[var(--text-tertiary)]
                                  ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 文章列表（带高度过渡动画） */}
                  <div
                    className={`overflow-hidden transition-all duration-[var(--duration-normal)]`}
                    style={{
                      maxHeight: isExpanded ? `${chapter.posts.length * 36 + 8}px` : "0px",
                      opacity: isExpanded ? 1 : 0,
                    }}
                  >
                    <ul className="mt-0.5 space-y-0.5 pb-1">
                      {chapter.posts.map((post) => {
                        const isActive = post.slug === currentPostSlug;
                        return (
                          <li key={post.id}>
                            <Link
                              href={`/columns/${columnSlug}/${post.slug}`}
                              className={`block rounded-[var(--radius-sm)] px-1 py-1.5 pl-8 text-xs leading-tight transition-colors duration-[var(--duration-fast)]
                                ${
                                  isActive
                                    ? "bg-[var(--accent-muted)] text-[var(--accent-primary)] font-medium"
                                    : "text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                                }`}
                            >
                              {post.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* 侧边栏收起时显示小图标 */}
      {sidebarCollapsed && (
        <div className="flex justify-center pt-4">
          <Link
            href={`/columns/${columnSlug}`}
            className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] 
                       text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-primary)]
                       transition-colors duration-[var(--duration-fast)]"
            title={`返回 ${columnTitle}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </Link>
        </div>
      )}
    </aside>
  );
}
