import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";
import { getPosts } from "@/lib/db";
import { buildAlternates, SITE_NAME } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

const PAGE_SIZE = 10;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale !== "en";
  const title = isZh ? `博客 | ${SITE_NAME}` : `Blog | ${SITE_NAME}`;
  const description = isZh
    ? "记录技术探索、设计思考与成长感悟"
    : "Tech explorations, design thinking, and growth";
  const { canonical, languages } = buildAlternates("/blog", "/en/blog");

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languages as Record<string, string>,
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      title,
      description,
    },
  };
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  setRequestLocale(locale);

  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { posts, total } = await getPosts({
    locale: locale as Locale,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <BlogContent
      posts={posts}
      total={total}
      locale={locale}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}

function BlogContent({
  posts,
  total,
  locale,
  currentPage,
  totalPages,
}: {
  posts: any[];
  total: number;
  locale: string;
  currentPage: number;
  totalPages: number;
}) {
  const t = useTranslations();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* 页头 */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full opacity-[0.08] blur-[100px]"
              style={{ background: "var(--accent-primary)" }}
            />
            <div
              className="absolute left-0 bottom-0 h-[200px] w-[200px] rounded-full opacity-[0.04] blur-[80px]"
              style={{ background: "var(--accent-secondary)" }}
            />
          </div>

          <div className="relative mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
            <div className="mb-4 animate-fade-in-up">
              <span
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)]
                           bg-[var(--accent-muted)] px-3.5 py-1 text-xs font-semibold tracking-wider
                           text-[var(--accent-primary)] border border-[var(--accent-primary)]/20"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                {t("blog.title")}
              </span>
            </div>

            <h1
              className="mb-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl animate-fade-in-up stagger-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("blog.title")}
            </h1>
            <p className="mb-1.5 text-sm text-[var(--text-secondary)] animate-fade-in-up stagger-3">
              {t("blog.subtitle")}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] animate-fade-in-up stagger-4">
              {t("blog.totalPosts", { count: total })}
            </p>
          </div>
        </section>

        {/* 文章列表 */}
        <section className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
          {posts.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-20 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                {t("blog.noPosts")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {posts.map((post, index) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    index={index}
                    locale={locale}
                  />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
