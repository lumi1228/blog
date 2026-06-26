"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTrigger } from "@/components/search/SearchTrigger";

export interface DocsTab {
  /** 文档集 slug */
  slug: string;
  /** 文档集标题 */
  title: string;
  /** 文档集首篇文章 slug；存在则 Tab 直达首篇，避免二次跳转 */
  firstPostSlug?: string | null;
}

interface DocsTopbarProps {
  /** 顶部文档集 Tab（对应各专栏） */
  tabs: DocsTab[];
  locale: string;
  /** 文档站标识文案（已按 locale 解析） */
  docsLabel: string;
}

/**
 * 文档子站顶部栏（独立外壳）。
 * - 左侧：站点 logo + 文档标识
 * - 中部：各文档集 Tab，按当前路径高亮
 * - 右侧：站内搜索 + 语言切换 + 主题切换
 *
 * 使用 next-intl 的 usePathname（返回不含 locale 前缀的路径），
 * 以判断当前激活的文档集。
 */
export function DocsTopbar({ tabs, locale, docsLabel }: DocsTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);

  // pathname 形如 /docs 或 /docs/[set] 或 /docs/[set]/[slug]
  const activeSlug = (() => {
    const match = pathname.match(/^\/docs\/([^/]+)/);
    return match ? match[1] : null;
  })();

  const switchLocale = () => {
    const nextLocale = locale === "zh-CN" ? "en" : "zh-CN";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)]
                 bg-[var(--bg-primary)]/85 backdrop-blur-xl"
    >
      {/* 单行 header：logo + 文档标识 + 文档集 Tab（桌面）+ 右侧操作区 */}
      <div className="mx-auto flex h-14 max-w-[1400px] items-center px-6">
        <div className="flex shrink-0 items-center gap-2.5">
          {/* 返回主站 logo */}
          <Link
            href="/"
            locale={locale}
            className="font-display text-xl font-semibold tracking-tight text-[var(--text-primary)]
                       transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-[var(--accent-primary)]">L</span>umi
          </Link>

          {/* 竖线分隔符（可见且克制） */}
          <span
            className="h-4 w-px shrink-0 bg-[var(--border-default)]"
            aria-hidden="true"
          />

          {/* 知识库标识：精致徽章，带图标，自然融入而非孤立文字 */}
          <Link
            href="/docs"
            className="group inline-flex items-center gap-1.5 rounded-[var(--radius-md)]
                       bg-[var(--accent-muted)] px-2.5 py-1
                       text-sm font-medium text-[var(--accent-primary)]
                       transition-colors duration-[var(--duration-fast)]
                       hover:bg-[var(--accent-primary)]/15"
          >
            <svg
              className="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            {docsLabel}
          </Link>
        </div>

        {/* 文档集 Tab（桌面端，置于 header 同一行） */}
        {tabs.length > 0 && (
          <nav
            className="ml-6 hidden h-full items-stretch gap-1 md:flex"
            aria-label={docsLabel}
          >
            {tabs.map((tab) => {
              const isActive = tab.slug === activeSlug;
              const href = tab.firstPostSlug
                ? `/docs/${tab.slug}/${tab.firstPostSlug}`
                : `/docs/${tab.slug}`;
              return (
                <Link
                  key={tab.slug}
                  href={href}
                  className={`relative flex h-full items-center border-b-2 px-3 text-sm font-medium
                              transition-colors duration-[var(--duration-fast)]
                              ${
                                isActive
                                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                              }`}
                >
                  {tab.title}
                </Link>
              );
            })}
          </nav>
        )}

        {/* 右侧操作区 */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <SearchTrigger locale={locale as "zh-CN" | "en"} scope="docs" />

          <button
            onClick={switchLocale}
            className="flex h-9 items-center justify-center rounded-[var(--radius-md)] px-2
                       text-xs font-medium text-[var(--text-secondary)]
                       transition-all duration-[var(--duration-fast)]
                       hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            title={locale === "zh-CN" ? "Switch to English" : "切换到中文"}
          >
            {locale === "zh-CN" ? "EN" : "中"}
          </button>

          <ThemeToggle />

          {/* 移动端文档集切换按钮 */}
          {tabs.length > 0 && (
            <button
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]
                         text-[var(--text-secondary)] transition-all duration-[var(--duration-fast)]
                         hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] md:hidden"
              onClick={() => setMobileTabsOpen((v) => !v)}
              aria-label={docsLabel}
              aria-expanded={mobileTabsOpen}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {mobileTabsOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 文档集 Tab（移动端下拉） */}
      {tabs.length > 0 && mobileTabsOpen && (
        <div className="border-t border-[var(--border-subtle)] px-6 py-3 md:hidden animate-fade-in">
          <div className="flex flex-col gap-0.5">
            {tabs.map((tab) => {
              const isActive = tab.slug === activeSlug;
              const href = tab.firstPostSlug
                ? `/docs/${tab.slug}/${tab.firstPostSlug}`
                : `/docs/${tab.slug}`;
              return (
                <Link
                  key={tab.slug}
                  href={href}
                  onClick={() => setMobileTabsOpen(false)}
                  className={`rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium
                              transition-colors duration-[var(--duration-fast)]
                              ${
                                isActive
                                  ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                              }`}
                >
                  {tab.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
