import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { ColumnSidebar } from "@/components/column-sidebar";
import { getPostBySlug, getColumnBySlug, getColumnAdjacentPosts } from "@/lib/db";
import { ViewCounter } from "@/components/view-counter";
import {
  SITE_URL,
  validateCoverImage,
  buildOgImages,
  buildAlternates,
  buildArticleJsonLd,
} from "@/lib/seo";
import { aboutConfig } from "@/config/about";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string; column: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, column, slug } = await params;
  const post = await getPostBySlug(slug, locale as Locale);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const hasUserCover = !!post.coverImage;
  const coverOk = hasUserCover ? await validateCoverImage(post.coverImage) : false;
  const { images } = buildOgImages(post.coverImage, coverOk);

  const alternates = buildAlternates(
    `/columns/${column}/${slug}`,
    `/en/columns/${column}/${slug}`,
    post.availableLocales
  );

  return {
    title: `${post.title} · Lumi's Blog`,
    description: post.excerpt,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      images,
    },
    twitter: {
      card: images.length > 0 ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      ...(images.length > 0 ? { images } : {}),
    },
  };
}

export default async function ColumnPostDetailPage({ params }: PageProps) {
  const { locale, column, slug } = await params;
  setRequestLocale(locale);

  const post = await getPostBySlug(slug, locale as Locale);

  if (!post || !post.columnId) {
    notFound();
  }

  // 获取专栏详情（用于侧边栏目录）
  const columnData = await getColumnBySlug(column, locale as Locale);

  if (!columnData) {
    notFound();
  }

  // 获取专栏内上下篇
  const { prev, next } = await getColumnAdjacentPosts(column, slug, locale as Locale);

  const hasUserCover = !!post.coverImage;
  const coverOk = hasUserCover ? await validateCoverImage(post.coverImage) : false;
  const { images } = buildOgImages(post.coverImage, coverOk);

  const jsonLd = buildArticleJsonLd({
    url: `${SITE_URL}/columns/${column}/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    publishedAt: post.publishedAt,
    author: aboutConfig.name,
    inLanguage: locale as Locale,
    image: images.length > 0 ? images[0] : undefined,
    updatedAt: post.updatedAt,
  });

  const t = await getTranslations();

  const translations = {
    home: t("common.home"),
    readingTime: (time: number) => t("post.readingTime", { time }),
    views: (count: number) => t("post.views", { count }),
    prevPost: t("post.prevPost"),
    nextPost: t("post.nextPost"),
    backToColumn: locale === "zh-CN" ? "返回专栏" : "Back to Column",
  };

  return (
    <ColumnPostContent
      post={post}
      columnData={columnData}
      prev={prev}
      next={next}
      jsonLd={jsonLd}
      translations={translations}
    />
  );
}

interface ColumnPostContentProps {
  post: any;
  columnData: any;
  prev: any;
  next: any;
  jsonLd: Record<string, unknown>;
  translations: {
    home: string;
    readingTime: (time: number) => string;
    views: (count: number) => string;
    prevPost: string;
    nextPost: string;
    backToColumn: string;
  };
}

function ColumnPostContent({
  post,
  columnData,
  prev,
  next,
  jsonLd,
  translations,
}: ColumnPostContentProps) {
  const t = translations;

  return (
    <>
      <Navbar />

      {/* 主体：侧边栏 + 文章内容 */}
      <div className="flex flex-1">
        {/* 左侧目录常驻 */}
        <ColumnSidebar
          columnSlug={columnData.slug}
          columnTitle={columnData.title}
          chapters={columnData.chapters}
          currentPostSlug={post.slug}
        />

        {/* 右侧文章内容 */}
        <main className="flex-1 min-w-0">
          <article className="mx-auto max-w-[900px] px-6 py-12 sm:py-16">
            {/* JSON-LD */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* 面包屑 */}
            <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <Link
                href="/"
                className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
              >
                {t.home}
              </Link>
              <span>/</span>
              <Link
                href="/columns"
                className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
              >
                Columns
              </Link>
              <span>/</span>
              <Link
                href={`/columns/${columnData.slug}`}
                className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
              >
                {columnData.title}
              </Link>
            </nav>

            {/* 文章头部 */}
            <header className="mb-10 animate-fade-in-up">
              <div className="mb-4 flex items-center gap-2">
                <Link
                  href={`/columns/${columnData.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] 
                             bg-[var(--accent-muted)] px-3 py-1 text-xs font-medium text-[var(--accent-primary)]
                             transition-colors duration-[var(--duration-fast)]
                             hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)]"
                >
                  {columnData.title}
                </Link>
                <Link
                  href={`/category/${post.category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] 
                             border border-[var(--border-subtle)] px-3 py-1 text-xs font-medium text-[var(--text-tertiary)]
                             transition-colors duration-[var(--duration-fast)]
                             hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]"
                >
                  {post.category.name}
                </Link>
              </div>

              <h1
                className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] 
                           sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-tertiary)]">
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                <span>·</span>
                <span>{t.readingTime(post.readingTime)}</span>
                {post.viewCount !== undefined && (
                  <>
                    <span>·</span>
                    <span>{t.views(post.viewCount)}</span>
                  </>
                )}
              </div>

              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {post.tags.map((tag: any) => (
                    <Link
                      key={tag.slug}
                      href={`/tag/${tag.slug}`}
                      className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] 
                                 px-2 py-0.5 text-xs text-[var(--text-tertiary)]
                                 transition-colors duration-[var(--duration-fast)]
                                 hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            <ViewCounter postId={post.id} />

            <div
              className="mb-8 h-px"
              style={{
                background:
                  "linear-gradient(to right, var(--accent-primary), transparent)",
              }}
            />

            {post.content && <MarkdownRenderer content={post.content} />}

            <div
              className="my-12 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--border-default), transparent)",
              }}
            />

            {/* 上一篇 / 下一篇 */}
            <nav className="grid gap-4 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/columns/${columnData.slug}/${prev.slug}`}
                  className="group rounded-[var(--radius-lg)] border border-[var(--border-subtle)] 
                             bg-[var(--bg-secondary)] p-4 transition-all duration-[var(--duration-fast)]
                             hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)]"
                >
                  <div className="mb-1 flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                    <svg
                      className="h-3 w-3 transition-transform duration-[var(--duration-fast)] group-hover:-translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    {t.prevPost}
                  </div>
                  <div className="line-clamp-2 text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
                    {prev.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link
                  href={`/columns/${columnData.slug}/${next.slug}`}
                  className="group rounded-[var(--radius-lg)] border border-[var(--border-subtle)] 
                             bg-[var(--bg-secondary)] p-4 text-right transition-all duration-[var(--duration-fast)]
                             hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)]"
                >
                  <div className="mb-1 flex items-center justify-end gap-1 text-xs text-[var(--text-tertiary)]">
                    {t.nextPost}
                    <svg
                      className="h-3 w-3 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <div className="line-clamp-2 text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
                    {next.title}
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </article>
        </main>
      </div>

      <Footer />
    </>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
