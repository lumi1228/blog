"use client";

/**
 * TableOfContents — 文章内容目录（TOC）
 *
 * - 接收服务端解析好的 headings，不在客户端重新解析 Markdown
 * - 用 IntersectionObserver 监听各标题 DOM，高亮当前可视区域内最近的标题
 * - 点击条目平滑滚动到对应锚点
 * - PC 端（lg+）：右侧固定侧边栏
 * - 移动端：右下角悬浮按钮 + 底部抽屉
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { Heading } from "@/lib/markdown/extractHeadings";

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 记录用户是否正在手动点击跳转，跳转期间暂停 observer 更新
  const isClickingRef = useRef(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();

      const el = document.getElementById(id);
      if (!el) return;

      // 标记点击中，避免 IntersectionObserver 立刻覆盖 active 状态
      isClickingRef.current = true;
      setActiveId(id);
      setDrawerOpen(false);

      el.scrollIntoView({ behavior: "smooth", block: "start" });

      // 滚动动画约 600ms 完成，之后恢复 observer
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        isClickingRef.current = false;
      }, 800);
    },
    []
  );

  useEffect(() => {
    if (headings.length === 0) return;

    const ids = headings.map((h) => h.id);

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickingRef.current) return;

        // 找到所有「进入视口」的标题中，在页面最靠上的那个
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target.id);

        if (visible.length > 0) {
          // 按在 headings 数组中的顺序选第一个（即文档中最靠前的）
          const first = ids.find((id) => visible.includes(id));
          if (first) setActiveId(first);
        }
      },
      {
        // 顶部留 96px 偏移（navbar 高度），进入视口上方 10% 时触发
        rootMargin: "-96px 0px -70% 0px",
        threshold: 0,
      }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, [headings]);

  // 抽屉打开时禁止 body 滚动
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (headings.length === 0) return null;

  /** 目录条目列表，PC 和移动端共用 */
  const tocList = (
    <ul className="space-y-0.5 border-l border-[var(--border-default)]">
      {headings.map((heading) => {
        const isActive = activeId === heading.id;

        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`group -ml-px flex items-start border-l rounded-r-[var(--radius-sm)] py-1 pr-2 text-[13px]
                         transition-colors duration-[var(--duration-fast)] outline-none
                         focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]
                         ${
                           isActive
                             ? "border-[var(--accent-primary)]"
                             : "border-transparent hover:border-[var(--border-default)]"
                         }`}
              style={{
                // 缩进：h1 无缩进，h2 缩进 12px，h3 缩进 24px
                paddingLeft: `${(heading.level - 1) * 12 + 12}px`,
                color: isActive
                  ? "var(--accent-primary)"
                  : "var(--text-tertiary)",
              }}
            >
              <span
                className="leading-snug line-clamp-2 transition-colors duration-[var(--duration-fast)]
                           group-hover:text-[var(--text-primary)]"
                style={{
                  color: isActive
                    ? "var(--accent-primary)"
                    : "var(--text-tertiary)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {heading.text}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* ── PC 端侧边栏（xl+，固定宽度） ── */}
      <aside
        aria-label="文章目录"
        className="hidden xl:block sticky top-24 w-[15rem] shrink-0 self-start"
      >
        <nav>{tocList}</nav>
      </aside>

      {/* ── 移动端悬浮按钮（xl 以下） ── */}
      <button
        aria-label="打开目录"
        onClick={() => setDrawerOpen(true)}
        className="xl:hidden fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center
                   rounded-full shadow-lg border border-[var(--border-subtle)]
                   bg-[var(--bg-secondary)] text-[var(--text-secondary)]
                   transition-all duration-[var(--duration-fast)]
                   hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]
                   active:scale-95"
      >
        {/* 目录 icon */}
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
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="15" y2="12" />
          <line x1="3" y1="18" x2="18" y2="18" />
        </svg>
      </button>

      {/* ── 移动端底部抽屉（xl 以下） ── */}
      {drawerOpen && (
        <div className="xl:hidden">
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* 抽屉主体 */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="文章目录"
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[65vh]
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
                  className="h-4 w-0.5 rounded-full"
                  style={{ background: "var(--accent-primary)" }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  文章目录
                </span>
              </div>
              <button
                aria-label="关闭目录"
                onClick={() => setDrawerOpen(false)}
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

            <nav>{tocList}</nav>
          </div>
        </div>
      )}
    </>
  );
}
