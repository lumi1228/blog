import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DocsChaptersList } from "@/components/docs/docs-chapters-list";
import { getColumnBySlug } from "@/lib/db";
import { buildAlternates } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string; set: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, set } = await params;
  const setData = await getColumnBySlug(set, locale as Locale);

  if (!setData) {
    return { title: "Not Found" };
  }

  const alternates = buildAlternates(`/docs/${set}`, `/en/docs/${set}`);

  return {
    title: `${setData.title} · Lumi's Blog`,
    description: setData.description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages as Record<string, string>,
    },
  };
}

/**
 * 文档集概览页：展示某文档集的章节目录。
 * 复用专栏数据（Column 即文档集），链接指向 /docs。
 * 外壳由 app/[locale]/docs/layout.tsx 提供。
 */
export default async function DocsSetOverviewPage({ params }: PageProps) {
  const { locale, set } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("docs");
  const setData = await getColumnBySlug(set, locale as Locale);

  if (!setData) {
    notFound();
  }

  const totalPosts = setData.chapters.reduce(
    (sum, ch) => sum + ch.posts.length,
    0
  );

  return (
    <main className="flex-1">
      {/* 文档集头部 */}
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
              {t("home")}
            </Link>
            <span>/</span>
            <Link
              href="/docs"
              className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
            >
              {t("label")}
            </Link>
          </nav>

          <h1
            className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {setData.title}
          </h1>
          {setData.description && (
            <p className="mt-3 max-w-2xl text-sm text-[var(--text-tertiary)] leading-relaxed">
              {setData.description}
            </p>
          )}
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">
            {t("totalArticles", { count: totalPosts })}
          </p>
        </div>
      </section>

      {/* 目录式内容 */}
      <section className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
        <DocsChaptersList
          setSlug={setData.slug}
          chapters={setData.chapters}
          emptyText={t("noArticles")}
        />
      </section>
    </main>
  );
}
