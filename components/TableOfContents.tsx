"use client";

/**
 * TableOfContents — 文章内容目录（TOC）
 *
 * - 接收服务端解析好的 headings，不在客户端重新解析 Markdown
 * - 用 IntersectionObserver 监听各标题 DOM，高亮当前可视区域内最近的标题
 * - 点击条目平滑滚动到对应锚点
 * - 移动端隐藏（由父级布局控制）
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { Heading } from "@/lib/markdown/extractHeadings";

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
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

  if (headings.length === 0) return null;

  return (
    <aside
      aria-label="文章目录"
      className="sticky top-24 w-[220px] shrink-0 self-start"
    >
      {/* 标题 */}
      <div className="mb-3 flex items-center gap-2">
        {/* 装饰竖线 */}
        <span
          className="h-4 w-0.5 rounded-full"
          style={{ background: "var(--accent-primary)" }}
        />
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-tertiary)" }}
        >
          目录
        </span>
      </div>

      {/* 条目列表 */}
      <nav>
        <ul className="space-y-0.5">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;

            return (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => handleClick(e, heading.id)}
                  className="group flex items-start gap-2 rounded-[var(--radius-sm)] py-1 pr-2 text-sm
                             transition-colors duration-[var(--duration-fast)] outline-none
                             focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                  style={{
                    // 缩进：h1 无缩进，h2 缩进 12px，h3 缩进 24px
                    paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
                    color: isActive
                      ? "var(--accent-primary)"
                      : "var(--text-tertiary)",
                  }}
                >
                  {/* 激活状态左侧指示点 */}
                  <span
                    className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-[var(--duration-fast)]"
                    style={{
                      background: isActive
                        ? "var(--accent-primary)"
                        : "var(--border-default)",
                      boxShadow: isActive
                        ? "0 0 6px var(--glow-primary)"
                        : "none",
                    }}
                  />
                  <span
                    className="leading-snug line-clamp-2 transition-colors duration-[var(--duration-fast)]
                               group-hover:text-[var(--text-primary)]"
                    style={{
                      color: isActive
                        ? "var(--accent-primary)"
                        : "var(--text-tertiary)",
                    }}
                  >
                    {heading.text}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
