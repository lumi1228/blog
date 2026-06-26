import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getColumnBySlug } from "@/lib/db";
import { redirect } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string; set: string }>;
}

/**
 * 文档集入口（TRAE 风格）：不再展示章节概览页。
 * 直接重定向到该文档集的「第一篇文章」，使切换文档集后即落到正文。
 * 仅当文档集存在但暂无已发布文章时，渲染空状态。
 * 外壳由 app/[locale]/docs/layout.tsx 提供。
 */
export default async function DocsSetPage({ params }: PageProps) {
  const { locale, set } = await params;
  setRequestLocale(locale);

  const setData = await getColumnBySlug(set, locale as Locale);

  if (!setData) {
    notFound();
  }

  // 章节已按 sort 升序，章节内文章按 column_order 升序；取第一篇
  const firstPostSlug = setData.chapters
    .flatMap((ch) => ch.posts)
    .at(0)?.slug;

  if (firstPostSlug) {
    redirect({ href: `/docs/${set}/${firstPostSlug}`, locale });
  }

  // 文档集存在但无文章：空状态
  const t = await getTranslations("docs");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
        <h1
          className="text-lg font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {setData.title}
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {t("noArticles")}
        </p>
      </div>
    </main>
  );
}
