"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { requestDocsUnlock } from "@/lib/docs-unlock-client";

interface DocsGateModalProps {
  /** 关闭弹框 */
  onClose: () => void;
  /** 校验通过回调（cookie 已下发，由调用方决定如何跳转） */
  onSuccess: () => void;
}

/**
 * 知识库门禁弹框：在当前页就地输入授权码校验，避免跳转独立解锁页。
 * 复用 docsGate 文案与 /api/docs/unlock 接口；校验通过后服务端下发 7 天凭证 cookie。
 */
export function DocsGateModal({ onClose, onSuccess }: DocsGateModalProps) {
  const t = useTranslations("docsGate");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ESC 关闭 + 锁定背景滚动
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = code.trim();
      if (!trimmed || submitting) return;
      setSubmitting(true);
      setError("");
      const result = await requestDocsUnlock(trimmed);
      if (result === "ok") {
        onSuccess();
        return;
      }
      setError(result === "tooMany" ? t("tooMany") : t("wrong"));
      setSubmitting(false);
    },
    [code, submitting, onSuccess, t]
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent-primary)]">
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a2.25 2.25 0 012.25 2.25v6a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-6a2.25 2.25 0 012.25-2.25z"
            />
          </svg>
        </div>

        <h2
          className="mb-1.5 text-lg font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("title")}
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
          {t("desc")}
        </p>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError("");
            }}
            placeholder={t("placeholder")}
            autoFocus
            aria-label={t("placeholder")}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-2.5 text-center text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
          {error && (
            <p className="text-sm text-[var(--error)]" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!code.trim() || submitting}
            className="w-full rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-[var(--duration-fast)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {submitting ? t("verifying") : t("submit")}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
