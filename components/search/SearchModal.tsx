"use client";

import { useEffect, useRef, useState, useDeferredValue, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { localizedPath } from "@/lib/seo";
import type { SearchIndexEntry } from "@/lib/types";
import type FuseLib from "fuse.js";
import type { FuseResult } from "fuse.js";

// ============================================================
// 类型定义
// ============================================================

type FuseInstance = FuseLib<SearchIndexEntry>;

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; fuse: FuseInstance }
  | { kind: "error" };

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  returnFocusTo: HTMLElement | null;
  locale: "zh-CN" | "en";
}

// ============================================================
// 模块级索引缓存（5分钟内命中跳过 fetch）
// ============================================================

const indexCache = new Map<
  string,
  { fetchedAt: number; data: SearchIndexEntry[] }
>();

const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

// ============================================================
// 纯函数：供 Property 4 测试使用
// ============================================================

/**
 * 执行 fuse 搜索，返回前 20 条结果，excerpt 截断至 80 字符
 *
 * 供 Property 4 测试使用（外部 export）
 */
export function renderResults(
  fuse: FuseInstance,
  query: string
): { slug: string; title: string; excerptText: string; publishedAt: string }[] {
  return (fuse.search(query) as FuseResult<SearchIndexEntry>[])
    .slice(0, 20)
    .map((r) => ({
      ...r.item,
      excerptText: r.item.excerpt.slice(0, 80),
    }));
}

// ============================================================
// useDebouncedValue hook（150ms）
// ============================================================

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================
// 日期格式化工具
// ============================================================

function formatDate(isoString: string, locale: "zh-CN" | "en"): string {
  try {
    const date = new Date(isoString);
    if (locale === "zh-CN") {
      return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return isoString;
  }
}

// ============================================================
// 可聚焦元素选择器
// ============================================================

const FOCUSABLE_SELECTOR =
  'button, [href], input, [tabindex]:not([tabindex="-1"])';

// ============================================================
// SearchModal 主组件
// ============================================================

export function SearchModal({
  open,
  onClose,
  returnFocusTo,
  locale,
}: SearchModalProps) {
  const t = useTranslations("search");
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>({ kind: "idle" });
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);

  // 仅在客户端完成挂载后才启用 portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // 使用 useDeferredValue + useDebouncedValue 双重保险防抖
  const deferredQuery = useDeferredValue(query);
  const debouncedQuery = useDebouncedValue(deferredQuery, 150);

  // ============================================================
  // 索引加载逻辑
  // ============================================================

  const loadIndex = useCallback(async () => {
    // 5 分钟缓存命中
    const cached = indexCache.get(locale);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      const FuseModule = await import("fuse.js").catch(() => null);
      if (!FuseModule) {
        setLoadState({ kind: "error" });
        return;
      }
      const fuse = new FuseModule.default(cached.data, {
        keys: [
          { name: "title", weight: 0.6 },
          { name: "excerpt", weight: 0.3 },
          { name: "tags", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      });
      setLoadState({ kind: "ready", fuse });
      return;
    }

    setLoadState({ kind: "loading" });

    try {
      // 并行动态加载 fuse.js 与 fetch 索引数据
      const [FuseModule, response] = await Promise.all([
        import("fuse.js"),
        fetch(`/api/search-index?locale=${locale}`),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      const entries: SearchIndexEntry[] = json.entries ?? [];

      // 更新模块级缓存
      indexCache.set(locale, { fetchedAt: Date.now(), data: entries });

      const fuse = new FuseModule.default(entries, {
        keys: [
          { name: "title", weight: 0.6 },
          { name: "excerpt", weight: 0.3 },
          { name: "tags", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      });

      setLoadState({ kind: "ready", fuse });
    } catch (err) {
      console.warn("[SearchModal] 索引加载失败:", err);
      setLoadState({ kind: "error" });
    }
  }, [locale]);

  // open 变为 true 时触发索引加载
  useEffect(() => {
    if (open && loadState.kind === "idle") {
      loadIndex();
    }
  }, [open, loadState.kind, loadIndex]);

  // open 时聚焦搜索输入框
  useEffect(() => {
    if (open) {
      // 延迟一帧确保 DOM 已渲染
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // 关闭时重置查询和选中状态
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(-1);
    }
  }, [open]);

  // ============================================================
  // 计算搜索结果
  // ============================================================

  const results =
    loadState.kind === "ready" && debouncedQuery.length > 0
      ? renderResults(loadState.fuse, debouncedQuery)
      : [];

  // ============================================================
  // 键盘交互：关闭、上下导航、Enter 跳转
  // ============================================================

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        returnFocusTo?.focus();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          results.length === 0 ? -1 : prev >= results.length - 1 ? 0 : prev + 1
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          results.length === 0
            ? -1
            : prev <= 0
              ? results.length - 1
              : prev - 1
        );
        return;
      }

      if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        const slug = results[activeIndex].slug;
        router.push(localizedPath(locale, `/posts/${slug}`));
        onClose();
        return;
      }
    },
    [results, activeIndex, locale, router, onClose, returnFocusTo]
  );

  // 选中项 scrollIntoView
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ============================================================
  // focus trap：Tab / Shift+Tab 在 modal 内循环
  // ============================================================

  useEffect(() => {
    if (!open) return;

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab：从第一个跳到最后一个
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab：从最后一个跳到第一个
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabTrap);
    return () => document.removeEventListener("keydown", handleTabTrap);
  }, [open]);

  // ============================================================
  // 遮罩点击关闭
  // ============================================================

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
      returnFocusTo?.focus();
    }
  };

  // ============================================================
  // 渲染
  // ============================================================

  if (!open || !mounted) return null;

  const modalContent = (
    // 遮罩层
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[10vh]"
      onClick={handleOverlayClick}
      aria-hidden="false"
    >
      {/* 弹窗主容器 */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        aria-label={t("ariaModal")}
        onKeyDown={handleKeyDown}
        className="
          relative w-full max-w-[640px] mx-4
          bg-[var(--bg-elevated)]
          border border-[var(--border-subtle)]
          rounded-[var(--radius-xl)]
          overflow-hidden
          animate-fade-in-up
        "
        style={{
          boxShadow:
            "var(--shadow-lg), var(--shadow-glow-accent)",
        }}
      >
        {/* 隐藏的模态标题（供 aria-labelledby 引用） */}
        <span id="search-modal-title" className="sr-only">
          {t("ariaModal")}
        </span>

        {/* 搜索输入区 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
          {/* 搜索图标 */}
          <svg
            className="h-5 w-5 shrink-0 text-[var(--text-tertiary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            placeholder={t("placeholder")}
            aria-label={t("ariaInput")}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="
              flex-1 bg-transparent text-[var(--text-primary)]
              placeholder:text-[var(--text-tertiary)]
              text-base outline-none
            "
          />

          {/* 加载状态指示 */}
          {loadState.kind === "loading" && (
            <svg
              className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={() => {
              onClose();
              returnFocusTo?.focus();
            }}
            aria-label={t("close")}
            className="
              flex h-7 w-7 shrink-0 items-center justify-center
              rounded-[var(--radius-sm)]
              text-[var(--text-tertiary)]
              transition-colors duration-[var(--duration-fast)]
              hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]
              focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2
            "
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 内容区 */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* 错误态 */}
          {loadState.kind === "error" && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
              <svg
                className="h-8 w-8 text-[var(--error)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-[var(--text-secondary)]">
                {t("error")}
              </p>
              <button
                onClick={() => {
                  setLoadState({ kind: "idle" });
                  loadIndex();
                }}
                className="
                  rounded-[var(--radius-md)] px-4 py-1.5
                  text-sm font-medium
                  bg-[var(--accent-muted)] text-[var(--accent-primary)]
                  transition-colors duration-[var(--duration-fast)]
                  hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)]
                  focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2
                "
              >
                {t("retry")}
              </button>
            </div>
          )}

          {/* 空输入态：索引已加载但 query 为空 */}
          {(loadState.kind === "ready" || loadState.kind === "idle" || loadState.kind === "loading") &&
            query.length === 0 && (
              <div className="py-10 px-4 text-center">
                <p className="text-sm text-[var(--text-tertiary)]">
                  {t("empty")}
                </p>
              </div>
            )}

          {/* 无结果态：query 非空但结果为空 */}
          {loadState.kind === "ready" &&
            debouncedQuery.length > 0 &&
            results.length === 0 && (
              <div className="py-10 px-4 text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                  {t("noResult")}
                </p>
              </div>
            )}

          {/* 搜索结果列表 */}
          {loadState.kind === "ready" && results.length > 0 && (
            <ul role="listbox" aria-label={t("ariaModal")} className="py-2">
              {results.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <li
                    key={item.slug}
                    ref={isActive ? activeRef : undefined}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      router.push(
                        localizedPath(locale, `/posts/${item.slug}`)
                      );
                      onClose();
                    }}
                    className={`
                      mx-2 mb-1 cursor-pointer rounded-[var(--radius-md)]
                      border px-3 py-2.5
                      transition-colors duration-[var(--duration-fast)]
                      ${
                        isActive
                          ? "bg-[var(--bg-tertiary)] border-[var(--accent-primary)]"
                          : "border-transparent hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-subtle)]"
                      }
                    `}
                  >
                    {/* 标题 */}
                    <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                      {item.title}
                    </p>

                    {/* 摘要 */}
                    {item.excerptText && (
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)] line-clamp-1">
                        {item.excerptText}
                      </p>
                    )}

                    {/* 日期 */}
                    <p className="mt-1 text-[var(--text-tertiary)] text-sm">
                      {formatDate(item.publishedAt, locale)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  // SSR 安全：typeof window 检查由 mounted 状态控制
  return createPortal(modalContent, document.body);
}
