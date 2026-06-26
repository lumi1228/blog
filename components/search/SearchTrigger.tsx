"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

// ============================================================
// 懒加载 SearchModal（仅客户端，按需加载）
// ============================================================

const SearchModal = dynamic(
  () => import("./SearchModal").then((m) => ({ default: m.SearchModal })),
  { ssr: false }
);

// ============================================================
// Props
// ============================================================

interface SearchTriggerProps {
  locale: "zh-CN" | "en";
  /** 搜索作用域：全站（默认）或仅文档 */
  scope?: "site" | "docs";
}

// ============================================================
// SearchTrigger 客户端组件
// ============================================================

export function SearchTrigger({ locale, scope = "site" }: SearchTriggerProps) {
  const t = useTranslations("nav");

  const [open, setOpen] = useState(false);
  // 缓存触发元素，关闭时归还焦点
  const triggerRef = useRef<Element | null>(null);

  // ============================================================
  // 全局快捷键：(Ctrl/Cmd) + K 打开搜索
  // ============================================================

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // 仅响应 Ctrl+K / Cmd+K
      if (!((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) return;

      // 守卫：焦点在输入类元素时不拦截（INPUT / TEXTAREA / contentEditable）
      const activeEl = document.activeElement;
      if (activeEl?.tagName === "INPUT") return;
      if (activeEl?.tagName === "TEXTAREA") return;
      if ((activeEl as HTMLElement)?.isContentEditable === true) return;

      e.preventDefault();
      triggerRef.current = activeEl;
      setOpen(true);
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ============================================================
  // 关闭处理：归还焦点由 SearchModal 内部通过 returnFocusTo?.focus() 完成
  // ============================================================

  const handleClose = () => {
    setOpen(false);
  };

  // ============================================================
  // 渲染
  // ============================================================

  return (
    <>
      {/* 搜索按钮 */}
      <button
        onClick={() => {
          triggerRef.current = document.activeElement;
          setOpen(true);
        }}
        aria-label={t("search")}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]
                   text-[var(--text-secondary)] transition-all duration-[var(--duration-fast)]
                   hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]
                   focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2"
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {/* 懒加载 SearchModal，仅在 open 时挂载 */}
      {open && (
        <SearchModal
          open={open}
          onClose={handleClose}
          returnFocusTo={triggerRef.current as HTMLElement | null}
          locale={locale}
          scope={scope}
        />
      )}
    </>
  );
}
