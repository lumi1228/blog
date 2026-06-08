import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getColumns } from "@/lib/db";
import { buildAlternates } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const descriptions: Record<Locale, string> = {
  "zh-CN": "专栏 · 系统化学习笔记",
  en: "Columns · Structured Learning Notes",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const alternates = buildAlternates("/columns", "/en/columns");

  return {
    title: descriptions[typedLocale] ?? descriptions["zh-CN"],
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages as Record<string, string>,
    },
  };
}

export default async function ColumnsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const columns = await getColumns(locale as Locale);

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-[100px]"
              style={{ background: "var(--glow-secondary)" }}
            />
          </div>
          <div className="relative mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
            <h1
              className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <ColumnsTitle locale={locale} />
            </h1>
            <p className="mt-3 max-w-lg text-sm text-[var(--text-tertiary)] leading-relaxed">
              <ColumnsSubtitle locale={locale} />
            </p>
          </div>
        </section>

        {/* 专栏列表 */}
        <section className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
          {columns.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                <EmptyText locale={locale} />
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {columns.map((column) => (
                <Link
                  key={column.id}
                  href={`/columns/${column.slug}`}
                  className="group rounded-[var(--radius-lg)] border border-[var(--border-subtle)] 
                             bg-[var(--bg-secondary)] p-6 transition-all duration-[var(--duration-fast)]
                             hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)]"
                >
                  {column.coverImage && (
                    <div className="mb-4 overflow-hidden rounded-[var(--radius-md)]">
                      <img
                        src={column.coverImage}
                        alt={column.title}
                        className="h-40 w-full object-cover transition-transform duration-[var(--duration-slow)] group-hover:scale-105"
                      />
                    </div>
                  )}
                  <h2
                    className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] 
                               transition-colors duration-[var(--duration-fast)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {column.title}
                  </h2>
                  {column.description && (
                    <p className="mt-2 text-sm text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
                      {column.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

function ColumnsTitle({ locale }: { locale: string }) {
  const t = useTranslations("column");
  return <>{t("title")}</>;
}

function ColumnsSubtitle({ locale }: { locale: string }) {
  const t = useTranslations("column");
  return <>{t("subtitle")}</>;
}

function EmptyText({ locale }: { locale: string }) {
  const t = useTranslations("column");
  return <>{t("empty")}</>;
}
