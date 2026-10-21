"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import type { DocsDirectoryChapter } from "@/lib/types";

/**
 * --- @ty.aicoding@ ---
 */
interface DocsSidebarProps {
  /** 文档集 slug */
  setSlug: string;
  /** 文档集标题 */
  setTitle: string;
  chapters: DocsDirectoryChapter[];
  /** 移动端抽屉标题文案（如「文档目录」） */
  drawerLabel: string;
}

/**
 * 知识库共享侧栏：章节名导航，独立箭头展开，跟随路由定位当前条目。
 * --- @ty.aicoding@ ---
 */
export function DocsSidebar({
  setSlug,
  setTitle,
  chapters,
  drawerLabel,
}: DocsSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("docs");
  const setPath = `/docs/${setSlug}`;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [expansion, setExpansion] = useState<{ pathname: string; chapters: Record<string, boolean> }>({ pathname, chapters: {} });
  // 布局持久存在；路由变化时使用新路由的默认展开状态。
  const overrides = expansion.pathname === pathname ? expansion.chapters : {};

  /**
   * --- @ty.aicoding@ ---
   */
  function toggleChapter(chapterId: string, expanded: boolean) {
    setExpansion({ pathname, chapters: { ...overrides, [chapterId]: !expanded } });
  }

  // 移动端抽屉打开时禁止 body 滚动
  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileDrawerOpen]);

  /** 章节目录列表，PC 和移动端共用 */
  const chapterList = (
    <ul className="space-y-1">
      <li>
        <Link href={setPath} aria-current={pathname === setPath ? "page" : undefined} onClick={() => setMobileDrawerOpen(false)}
          className={`mb-2 block rounded-[var(--radius-sm)] px-2 py-2 text-sm font-medium ${pathname === setPath ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"}`}>
          {t("overview")}
        </Link>
      </li>
      {chapters.map((chapter) => {
        const chapterPath = `${setPath}/chapters/${chapter.id}`;
        const isCurrentChapter = pathname === chapterPath;
        const hasActive = isCurrentChapter || chapter.posts.some((post) => pathname === `${setPath}/${post.slug}`);
        const isExpanded = overrides[chapter.id] ?? hasActive;

        return (
          <li key={chapter.id}>
            <div className={`flex items-center rounded-[var(--radius-sm)] hover:bg-[var(--bg-tertiary)] ${isCurrentChapter ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`}>
              <Link href={chapterPath} aria-current={isCurrentChapter ? "page" : undefined} onClick={() => setMobileDrawerOpen(false)} className="min-w-0 flex-1 px-2 py-2 text-sm font-semibold lg:text-[13px]">
                {chapter.title}
              </Link>

              <button type="button" onClick={() => toggleChapter(chapter.id, isExpanded)} aria-expanded={isExpanded}
                aria-label={t(isExpanded ? "collapseChapter" : "expandChapter", { title: chapter.title })}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] hover:text-[var(--accent-primary)]">
              <svg
                className={`h-3.5 w-3.5 lg:h-3 lg:w-3 shrink-0 transition-transform duration-[var(--duration-normal)] text-[var(--text-tertiary)]
                            ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              </button>
            </div>

            <div hidden={!isExpanded}>
              {/* 移动端：带左侧竖线的缩进容器；PC端：普通缩进 */}
              <ul className="mt-1 space-y-0.5 pb-1 ml-3 lg:ml-2 border-l border-[var(--border-default)]">
                {chapter.posts.map((post) => {
                  const isActive = pathname === `${setPath}/${post.slug}`;
                  return (
                    <li key={post.id}>
                      <Link
                        href={`/docs/${setSlug}/${post.slug}`}
                        aria-current={isActive ? "page" : undefined}
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
            title={t(sidebarCollapsed ? "expandSidebar" : "collapseSidebar")}
            aria-label={t(sidebarCollapsed ? "expandSidebar" : "collapseSidebar")}
            aria-expanded={!sidebarCollapsed}
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
          <nav aria-label={drawerLabel} className="flex-1 overflow-y-auto p-3">{chapterList}</nav>
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
                aria-label={t("close")}
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
