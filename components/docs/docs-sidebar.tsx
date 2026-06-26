"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { ColumnChapter, Post } from "@/lib/types";

interface DocsSidebarProps {
  /** 文档集 slug */
  setSlug: string;
  /** 文档集标题 */
  setTitle: string;
  chapters: (ColumnChapter & { posts: Post[] })[];
  currentPostSlug: string;
  /** 移动端抽屉标题文案（如「文档目录」） */
  drawerLabel: string;
}

/** 判断某章节是否包含当前文章，用于初始化展开状态 */
function chapterHasActivePost(
  chapter: ColumnChapter & { posts: Post[] },
  currentSlug: string
) {
  return chapter.posts.some((p) => p.slug === currentSlug);
}

/**
 * 文档详情页左侧常驻章节目录。
 * 基于原 ColumnSidebar，链接指向 /docs/[set]/[slug]。
 */
export function DocsSidebar({
  setSlug,
  setTitle,
  chapters,
  currentPostSlug,
  drawerLabel,
}: DocsSidebarProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >(() => {
    // 默认折叠所有章节分组，仅展开包含当前文章的分组
    const initial: Record<string, boolean> = {};
    chapters.forEach((ch) => {
      initial[ch.id] = chapterHasActivePost(ch, currentPostSlug);
    });
    return initial;
  });

  function toggleChapter(chapterId: string) {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  }

  // 移动端抽屉打开时禁止 body 滚动
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  /** 章节目录列表，PC 和移动端共用 */
  const chapterList = (
    <ul className="space-y-1">
      {chapters.map((chapter) => {
        const isExpanded = expandedChapters[chapter.id] ?? false;
        const hasActive = chapterHasActivePost(chapter, currentPostSlug);

        return (
          <li key={chapter.id}>
            {/* 章节标题行（可点击收起/展开） */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className={`group w-full flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 lg:px-1 lg:py-1.5
                          transition-colors duration-[var(--duration-fast)]
                          hover:bg-[var(--bg-tertiary)]
                          ${hasActive ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`}
            >
              {/* 章节名 */}
              <span className="flex-1 text-left text-sm lg:text-[13px] font-semibold truncate">
                {chapter.title}
              </span>

              {/* 展开/收起箭头 */}
              <svg
                className={`h-3.5 w-3.5 lg:h-3 lg:w-3 shrink-0 transition-transform duration-[var(--duration-normal)] text-[var(--text-tertiary)]
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
                maxHeight: isExpanded ? `${chapter.posts.length * 44 + 8}px` : "0px",
                opacity: isExpanded ? 1 : 0,
              }}
            >
              {/* 移动端：带左侧竖线的缩进容器；PC端：普通缩进 */}
              <ul className="mt-1 space-y-0.5 pb-1 ml-3 lg:ml-2 border-l border-[var(--border-default)]">
                {chapter.posts.map((post) => {
                  const isActive = post.slug === currentPostSlug;
                  return (
                    <li key={post.id}>
                      <Link
                        href={`/docs/${setSlug}/${post.slug}`}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`-ml-px block border-l rounded-r-[var(--radius-sm)] pl-4 pr-2 py-2.5 lg:py-1.5 text-sm lg:text-[13px] leading-snug transition-colors duration-[var(--duration-fast)]
                          ${
                            isActive
                              ? "border-[var(--accent-primary)] bg-[var(--accent-muted)] text-[var(--accent-primary)] font-medium"
                              : "border-transparent text-[var(--text-tertiary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
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
  );

  return (
    <>
      <aside
        className={`shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all duration-[var(--duration-normal)] ${
          sidebarCollapsed ? "w-12" : "w-64"
        } hidden lg:flex lg:flex-col lg:sticky lg:top-[3.5rem] lg:h-[calc(100vh-3.5rem)] lg:self-start`}
      >
        {/* 折叠侧边栏按钮 + 文档集标题 */}
        <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-3">
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
              href={`/docs/${setSlug}`}
              className="text-sm font-semibold text-[var(--text-primary)] truncate hover:text-[var(--accent-primary)] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {setTitle}
            </Link>
          )}
        </div>

        {/* 目录内容 */}
        {!sidebarCollapsed && (
          <nav className="flex-1 overflow-y-auto p-3">{chapterList}</nav>
        )}
      </aside>

      {/* ── 移动端悬浮按钮（lg 以下） ── */}
      <button
        aria-label={drawerLabel}
        onClick={() => setMobileDrawerOpen(true)}
        className="lg:hidden fixed bottom-32 right-4 z-40 flex h-11 w-11 items-center justify-center
                   rounded-full shadow-lg border border-[var(--border-subtle)]
                   bg-[var(--bg-secondary)] text-[var(--text-secondary)]
                   transition-all duration-[var(--duration-fast)]
                   hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]
                   active:scale-95"
      >
        {/* 文档目录 icon（书本形状） */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </button>

      {/* ── 移动端底部抽屉（lg 以下） ── */}
      {mobileDrawerOpen && (
        <div className="lg:hidden">
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* 抽屉主体 */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={drawerLabel}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh]
                       overflow-y-auto rounded-t-2xl
                       bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]
                       px-4 pb-8 pt-1
                       animate-slide-up"
          >
            {/* 拖拽指示条 */}
            <div className="mx-auto mb-3 mt-2 h-1 w-10 rounded-full bg-[var(--border-default)]" />

            {/* 标题行 */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-0.5 rounded-full shrink-0"
                  style={{ background: "var(--accent-primary)" }}
                />
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="shrink-0 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {drawerLabel}
                  </span>
                  <span style={{ color: "var(--border-default)" }} className="shrink-0 text-[10px]">
                    /
                  </span>
                  <Link
                    href={`/docs/${setSlug}`}
                    onClick={() => setMobileDrawerOpen(false)}
                    className="truncate text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                  >
                    {setTitle}
                  </Link>
                </div>
              </div>
              <button
                aria-label="关闭"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full
                           text-[var(--text-tertiary)] hover:text-[var(--text-primary)]
                           transition-colors duration-[var(--duration-fast)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav>{chapterList}</nav>
          </div>
        </div>
      )}
    </>
  );
}
