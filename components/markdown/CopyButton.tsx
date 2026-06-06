"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface CopyButtonProps {
  text: string;
  className?: string;
}

type CopyState = "idle" | "copying" | "success" | "failed";

export function CopyButton({ text, className }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const t = useTranslations("post.copyCode");

  const handleCopy = useCallback(async () => {
    if (state === "copying") return;

    setState("copying");

    try {
      await navigator.clipboard.writeText(text);
      setState("success");
    } catch {
      setState("failed");
    } finally {
      // 无论成功还是失败，2000ms 后回到 idle
      setTimeout(() => {
        setState("idle");
      }, 2000);
    }
  }, [text, state]);

  // 根据状态决定显示文案
  const labelKey = state === "success" ? "success" : state === "failed" ? "failed" : "idle";
  const buttonLabel = t(labelKey);
  const ariaLabel = t("ariaLabel");

  // 根据状态决定图标与样式
  const isSuccess = state === "success";
  const isFailed = state === "failed";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      disabled={state === "copying"}
      className={[
        // 基础胶囊按钮样式
        "copy-button-fade",
        "inline-flex items-center gap-1.5",
        "min-w-[4.5rem]",          // 保证 360px 容器内完整可见
        "h-7 px-2.5",
        "rounded-[var(--radius-full)]",
        "text-xs font-medium",
        "border border-[var(--border-subtle)]",
        // 颜色按状态切换
        isSuccess
          ? "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30"
          : isFailed
            ? "bg-[var(--error)]/15 text-[var(--error)] border-[var(--error)]/30"
            : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
        // 过渡动画
        "transition-all duration-[var(--duration-fast)]",
        // 禁用态
        "disabled:cursor-default",
        // 焦点态
        "focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] focus-visible:outline-offset-2",
        "focus:outline-none",
        // 外部传入的 className（控制 opacity 等）
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 图标区域 */}
      {isSuccess ? (
        // 已复制：对勾图标
        <svg
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : isFailed ? (
        // 失败：叉号图标
        <svg
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        // 默认：复制图标（两个重叠的矩形）
        <svg
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          {/* 后面的页 */}
          <rect x="8" y="2" width="13" height="13" rx="2" ry="2" />
          {/* 前面的页 */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16V8a2 2 0 0 1 2-2"
          />
          <rect x="3" y="8" width="13" height="13" rx="2" ry="2" />
        </svg>
      )}

      {/* 按钮文字 */}
      <span>{buttonLabel}</span>

      {/* 屏幕阅读器实时区域：状态变更时朗读 */}
      <span
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {state === "success" || state === "failed" ? buttonLabel : ""}
      </span>
    </button>
  );
}
