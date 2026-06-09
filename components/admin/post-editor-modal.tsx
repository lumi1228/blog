"use client";

import { useEffect, useCallback } from "react";

interface PostEditorModalProps {
  children: React.ReactNode;
  title: string;
  onClose?: () => void;
}

export function PostEditorModal({ children, title, onClose }: PostEditorModalProps) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]">
      {/* 顶部栏 */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-6">
        <h1
          className="text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        {onClose && (
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            title="关闭 (ESC)"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 内容区（带滚动） */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}
