import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
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
          {columnData.chapters.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                该专栏暂无文章
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {columnData.chapters.map((chapter) => (
                <section key={chapter.id}>
                  {/* 章节标题 */}
                  <h2
                    className="mb-4 flex items-center gap-3 text-lg font-semibold text-[var(--text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-xs font-bold text-[var(--accent-primary)]">
                      {chapter.sort < 9999 ? chapter.sort : "·"}
                    </span>
                    {chapter.title}
                    <span className="text-xs font-normal text-[var(--text-tertiary)]">
                      ({chapter.posts.length}篇)
                    </span>
                  </h2>

                  {/* 文章列表 */}
                  <div className="space-y-1">
                    {chapter.posts.length === 0 ? (
                      <p className="text-xs text-[var(--text-tertiary)] pl-9">暂无文章</p>
                    ) : (
                      chapter.posts.map((post, idx) => (
                        <Link
                          key={post.id}
                          href={`/columns/${columnData.slug}/${post.slug}`}
                          className="group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 
                                     transition-colors duration-[var(--duration-fast)]
                                     hover:bg-[var(--bg-tertiary)]"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-tertiary)] group-hover:bg-[var(--accent-muted)] group-hover:text-[var(--accent-primary)] transition-colors duration-[var(--duration-fast)]">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-[var(--duration-fast)] line-clamp-1">
                            {post.title}
                          </span>
                          {post.readingTime > 0 && (
                            <span className="ml-auto shrink-0 text-xs text-[var(--text-tertiary)]">
                              {post.readingTime} min
                            </span>
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
