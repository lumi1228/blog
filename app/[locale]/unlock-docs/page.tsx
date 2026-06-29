import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { DocsGateForm } from "@/components/docs/docs-gate-form";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// 门禁页不应被搜索引擎收录
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * 知识库门禁解锁页（位于 docs 路由组之外，避免渲染会泄露文档集标题的 DocsTopbar）。
 * 访问 /docs* 无有效凭证时，中间件会重定向到此页并带上 ?next=原路径。
 */
export default async function UnlockDocsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] px-6 py-16">
      <Suspense fallback={null}>
        <DocsGateForm />
      </Suspense>
    </main>
  );
}
