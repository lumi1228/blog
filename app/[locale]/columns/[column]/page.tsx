import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ColumnChaptersList } from "@/components/column-chapters-list";
import { getColumnBySlug } from "@/lib/db";
import { buildAlternates } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string; column: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, column } = await params;
  const columnData = await getColumnBySlug(column, locale as Locale);

  if (!columnData) {
    return { title: "Column Not Found" };
  }

  const alternates = buildAlternates(
    `/columns/${column}`,
    `/en/columns/${column}`
  );

  return {
    title: `${columnData.title} · Lumi's Blog`,
    description: columnData.description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages as Record<string, string>,
    },
  };
}

export default async function ColumnOverviewPage({ params }: PageProps) {
  const { locale, column } = await params;
  setRequestLocale(locale);

  const columnData = await getColumnBySlug(column, locale as Locale);

  if (!columnData) {
    notFound();
  }

  // 计算总文章数
  const totalPosts = columnData.chapters.reduce(
    (sum, ch) => sum + ch.posts.length,
    0
  );

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* 专栏头部 */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-[100px]"
              style={{ background: "var(--glow-secondary)" }}
            />
          </div>
          <div className="relative mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
            {/* 面包屑 */}
            <nav className="mb-4 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <Link
                href="/"
                className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
              >
                Home
              </Link>
              <span>/</span>
              <Link
                href="/columns"
                className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
              >
                Columns
              </Link>
            </nav>

            <h1
              className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {columnData.title}
            </h1>
            {columnData.description && (
              <p className="mt-3 max-w-2xl text-sm text-[var(--text-tertiary)] leading-relaxed">
                {columnData.description}
              </p>
            )}
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              {totalPosts} 篇文章
            </p>
          </div>
        </section>

        {/* 目录式内容 */}
        <section className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
          <ColumnChaptersList
            columnSlug={columnData.slug}
            chapters={columnData.chapters}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}
