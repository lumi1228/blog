import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import type { Metadata } from "next";
import { getDocsOverview } from "@/lib/db";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";

/**
 * --- @ty.aicoding@ ---
 */
interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * 概览页元信息。
 * --- @ty.aicoding@ ---
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs" });
  return { title: t("title"), description: t("subtitle") };
}

/**
 * 所有知识库概览，只读取统计数据，不加载文章正文。
 * --- @ty.aicoding@ ---
 */
export default async function DocsHomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [columns, t] = await Promise.all([
    getDocsOverview(locale as Locale),
    getTranslations("docs"),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <header className="mb-10">
        <h1
          className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{t("subtitle")}</p>
      </header>
      {columns.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => (
            <Link
              key={column.id}
              href={`/docs/${column.slug}`}
              className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--accent-primary)]"
            >
              {column.coverImage && (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image src={column.coverImage} alt="" fill unoptimized className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">{column.title}</h2>
                {column.description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">{column.description}</p>}
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-6 text-xs text-[var(--text-tertiary)]">
                  <span>{t("chapterCount", { count: column.chapterCount })}</span>
                  <span>{t("articleCount", { count: column.articleCount })}</span>
                  <span className="ml-auto text-[var(--accent-primary)]">{t("viewDirectory")} →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-12 text-center text-[var(--text-secondary)]">{t("empty")}</p>
      )}
    </main>
  );
}
