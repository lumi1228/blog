import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { ColumnCard } from "@/components/column-card";
import { Pagination } from "@/components/pagination";
import { getPosts, getColumns } from "@/lib/db";
import { buildAlternates } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

const PAGE_SIZE = 10;
const FEATURED_COLUMNS_COUNT = 3;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

const descriptions: Record<Locale, string> = {
  "zh-CN": "一个女性开发者的技术博客",
  en: "A female developer's tech blog",
};

const ogLocales: Record<Locale, string> = {
  "zh-CN": "zh_CN",
  en: "en_US",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const description = descriptions[typedLocale] ?? descriptions["zh-CN"];
  const alternates = buildAlternates("/", "/en");

  return {
    title: "Lumi's Blog",
    description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages as Record<string, string>,
    },
    openGraph: {
      type: "website",
      locale: ogLocales[typedLocale] ?? "zh_CN",
      title: "Lumi's Blog",
      description,
    },
  };
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  setRequestLocale(locale);

  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // 获取博客列表
  const { posts, total } = await getPosts({
    locale: locale as "zh-CN" | "en",
    limit: PAGE_SIZE,
    offset,
  });

  // 获取精选专栏（前3个）
  const allColumns = await getColumns(locale as Locale);
  const featuredColumns = allColumns.slice(0, FEATURED_COLUMNS_COUNT);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <HomeContent
      posts={posts}
      total={total}
      columns={featuredColumns}
      hasMoreColumns={allColumns.length > FEATURED_COLUMNS_COUNT}
      locale={locale}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}

function HomeContent({
  posts,
  total,
  columns,
  hasMoreColumns,
  locale,
  currentPage,
  totalPages,
}: {
  posts: any[];
  total: number;
  columns: any[];
  hasMoreColumns: boolean;
  locale: string;
  currentPage: number;
  totalPages: number;
}) {
  const t = useTranslations();

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero 区域 */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] py-20 sm:py-28 lg:py-36">
          {/* 极简紫色光晕背景 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* 主光晕 - 中央 */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-20 blur-[140px] animate-aurora-1"
              style={{ background: "var(--accent-primary)" }}
            />
            {/* 次光晕 - 右上 */}
            <div
              className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full opacity-15 blur-[120px] animate-aurora-2"
              style={{ background: "var(--accent-primary)" }}
            />
          </div>

          <div className="relative mx-auto max-w-[1200px] px-6">
            <div className="max-w-3xl text-center mx-auto">
              {/* 极光微章 */}
              <div className="mb-6 animate-fade-in-up stagger-1 flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full 
                             bg-[var(--accent-muted)] px-3.5 py-1 text-xs font-semibold tracking-wider text-[var(--accent-primary)]
                             border border-[var(--accent-primary)]/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-ping" />
                  {t("home.badge")}
                </span>
              </div>

              {/* 标题 */}
              <h1
                className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] 
                           sm:text-5xl lg:text-6xl animate-fade-in-up stagger-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("home.title1")}
                <br />
                <span className="bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] bg-clip-text text-transparent">
                  {t("home.title2")}
                </span>
              </h1>

              {/* 描述 */}
              <p className="mb-10 max-w-xl mx-auto text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg lg:text-xl animate-fade-in-up stagger-3">
                {t("home.description1")} {t("home.description2")}
              </p>

              {/* CTA 按钮组 */}
              <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up stagger-4">
                <a
                  href="#columns"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] 
                             bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold
                             text-[var(--bg-primary)] transition-all duration-[var(--duration-normal)]
                             hover:shadow-[0_0_30px_var(--glow-primary)] hover:scale-[1.03] active:scale-95"
                >
                  {t("home.browseColumns")}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <a
                  href="#posts"
                  className="frosted-glass inline-flex items-center gap-2 rounded-[var(--radius-md)] 
                             px-6 py-3 text-sm font-semibold text-[var(--text-primary)] 
                             transition-all duration-[var(--duration-fast)]
                             hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:scale-[1.03]"
                >
                  {t("home.latestArticles")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 精选专栏区 */}
        {columns.length > 0 && (
          <section id="columns" className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2
                  className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t("home.featuredColumns")}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                  {t("home.featuredColumnsDesc")}
                </p>
              </div>
              {hasMoreColumns && (
                <a
                  href={`/${locale}/columns`}
                  className="text-sm text-[var(--text-secondary)] transition-colors 
                             duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
                >
                  {t("home.allColumns")} →
                </a>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map((column, index) => (
                <ColumnCard key={column.id} column={column} locale={locale} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* 文章列表 */}
        <section id="posts" className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2
              className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("home.latestPosts")}
            </h2>
            <span className="text-sm text-[var(--text-tertiary)]">
              {t("home.totalPosts", { count: total })}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                {t("home.noPosts")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {posts.map((post, index) => (
                  <ArticleCard key={post.id} post={post} index={index} locale={locale} />
                ))}
              </div>

              {/* 分页控件 */}
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
