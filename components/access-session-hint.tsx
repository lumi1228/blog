"use client";

import { createContext, useContext } from "react";
import { useTranslations } from "next-intl";

const DocsSessionTtlContext = createContext<number | null>(null);

/**
 * 随页面下发知识库时长，所有入口共用，避免弹窗额外请求配置接口。
 * --- @ty.aicoding@ ---
 */
export function DocsSessionTtlProvider({
  seconds,
  children,
}: {
  seconds: number | null;
  children: React.ReactNode;
}) {
  return <DocsSessionTtlContext value={seconds}>{children}</DocsSessionTtlContext>;
}

/**
 * 仅展示时长上限；简历复用探测响应，知识库复用页面配置，不发起网络请求。
 * --- @ty.aicoding@ ---
 */
export function AccessSessionHint({ sessionTtlSeconds }: { sessionTtlSeconds?: number | null }) {
  const t = useTranslations("accessGate");
  const docsTtlSeconds = useContext(DocsSessionTtlContext);
  const seconds = sessionTtlSeconds === undefined ? docsTtlSeconds : sessionTtlSeconds;
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return null;
  return <> {t("sessionHint", { days: seconds / 86400 })}</>;
}
