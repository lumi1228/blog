"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { requestDocsUnlock } from "@/lib/docs-unlock-client";

/**
 * 知识库门禁解锁表单。
 *
 * - 校验授权码（POST /api/docs/unlock）→ 成功后服务端下发 7 天签名 cookie，
 *   随后跳回用户原本想访问的 next 路径（默认 /docs）。
 * - 支持魔法链接：URL 带 ?code=xxx 时进入即自动提交，免手动输入。
 * - next 做白名单校验，只允许 /docs 或 /en/docs 开头，防开放重定向。
 */
export function DocsGateForm() {
  const t = useTranslations("docsGate");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const autoTried = useRef(false);

  // 解析并校验跳转目标，防开放重定向
  const resolveNext = useCallback((): string => {
    const raw = searchParams.get("next");
    const fallback = locale === "en" ? "/en/docs" : "/docs";
    if (!raw) return fallback;
    // 仅允许站内 /docs 或 /en/docs 路径
    if (/^\/(en\/)?docs(\/|$|\?)/.test(raw)) return raw;
    return fallback;
  }, [searchParams, locale]);

  const submit = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || submitting) return;
      setSubmitting(true);
      setError("");
      const result = await requestDocsUnlock(trimmed);
      if (result === "ok") {
        router.replace(resolveNext());
        return;
      }
      setError(result === "tooMany" ? t("tooMany") : t("wrong"));
      setSubmitting(false);
    },
    [submitting, router, resolveNext, t]
  );

  // 魔法链接：?code=xxx 自动提交一次
  useEffect(() => {
    if (autoTried.current) return;
    const urlCode = searchParams.get("code");
    if (urlCode) {
      autoTried.current = true;
      setCode(urlCode);
      void submit(urlCode);
    }
  }, [searchParams, submit]);

  return (
    <div className="mx-auto w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 text-center">
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

      <h1
        className="mb-1.5 text-lg font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t("title")}
      </h1>
      <p className="mb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
        {t("desc")}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(code);
        }}
        className="space-y-3"
      >
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

      <Link
        href="/"
        className="mt-5 inline-block text-xs text-[var(--text-tertiary)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
