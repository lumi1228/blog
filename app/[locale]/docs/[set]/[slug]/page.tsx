import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { TableOfContents } from "@/components/TableOfContents";
import { getPostBySlug, getColumnBySlug, getColumnAdjacentPosts } from "@/lib/db";
import { ViewCounter } from "@/components/view-counter";
import { extractHeadings } from "@/lib/markdown/extractHeadings";
import {
  SITE_URL,
  validateCoverImage,
  buildOgImages,
  buildAlternates,
  buildArticleJsonLd,
} from "@/lib/seo";
import { aboutConfig } from "@/config/about";
import type { Locale } from "@/i18n/config";
import type { Heading } from "@/lib/markdown/extractHeadings";
import type { ColumnDetail, Post } from "@/lib/types";

interface PageProps {
  params: Promise<{ locale: string; set: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, set, slug } = await params;
  const post = await getPostBySlug(slug, locale as Locale);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const hasUserCover = !!post.coverImage;
  const coverOk = hasUserCover ? await validateCoverImage(post.coverImage) : false;
  const { images } = buildOgImages(post.coverImage, coverOk);

  const alternates = buildAlternates(
    `/docs/${set}/${slug}`,
    `/en/docs/${set}/${slug}`,
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

export default async function DocsPostDetailPage({ params }: PageProps) {
  const { locale, set, slug } = await params;
  setRequestLocale(locale);

  const post = await getPostBySlug(slug, locale as Locale);

  if (!post || !post.columnId) {
    notFound();
  }

  // 获取文档集详情（用于左侧章节目录）
  const setData = await getColumnBySlug(set, locale as Locale);

  if (!setData) {
    notFound();
  }

  // 获取文档集内上下篇
  const { prev, next } = await getColumnAdjacentPosts(set, slug, locale as Locale);

  // 提取文章标题，用于右侧 TOC
  const headings = extractHeadings(post.content ?? "");

  const hasUserCover = !!post.coverImage;
  const coverOk = hasUserCover ? await validateCoverImage(post.coverImage) : false;
  const { images } = buildOgImages(post.coverImage, coverOk);

  const jsonLd = buildArticleJsonLd({
    url: `${SITE_URL}/docs/${set}/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    publishedAt: post.publishedAt,
    author: aboutConfig.name,
    inLanguage: locale as Locale,
    image: images.length > 0 ? images[0] : undefined,
    updatedAt: post.updatedAt,
  });

  // 定位当前文章所属章节（用于面包屑；排除虚拟「未分类」章节）
  const currentChapter = setData.chapters.find(
    (ch) =>
      ch.id !== "__uncategorized__" &&
      ch.posts.some((p) => p.slug === post.slug)
  );
  const chapterTitle = currentChapter?.title ?? null;

  const t = await getTranslations();

  const translations = {
    drawerLabel: t("docs.label"),
    readingTime: (time: number) => t("post.readingTime", { time }),
    views: (count: number) => t("post.views", { count }),
    prevPost: t("post.prevPost"),
    nextPost: t("post.nextPost"),
  };

  return (
    <DocsPostContent
      post={post}
      setData={setData}
      chapterTitle={chapterTitle}
      prev={prev}
      next={next}
      headings={headings}
      jsonLd={jsonLd}
      translations={translations}
    />
  );
}

interface DocsPostContentProps {
  post: Post;
  setData: ColumnDetail;
  chapterTitle: string | null;
  prev: Post | null;
  next: Post | null;
  headings: Heading[];
  jsonLd: Record<string, unknown>;
  translations: {
    drawerLabel: string;
    readingTime: (time: number) => string;
    views: (count: number) => string;
    prevPost: string;
    nextPost: string;
  };
}

function DocsPostContent({
  post,
  setData,
  chapterTitle,
  prev,
  next,
  headings,
  jsonLd,
  translations,
}: DocsPostContentProps) {
  const t = translations;

  return (
    <div className="flex flex-1">
      {/* 左侧文档集章节目录（常驻） */}
      <DocsSidebar
        setSlug={setData.slug}
        setTitle={setData.title}
        chapters={setData.chapters}
        currentPostSlug={post.slug}
        drawerLabel={t.drawerLabel}
      />

      {/* 中间文章内容区：填满左侧章节目录与右侧 TOC 之间的空间 */}
      <main className="min-w-0 flex-1">
        <div className="px-6 py-12 sm:py-16">
          {/* ── 文章主体：限制最大阅读宽度并在中间区域水平居中 ── */}
          <article className="mx-auto w-full min-w-0 max-w-[56rem]">
            {/* JSON-LD */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* 面包屑：专栏 / 章节 / 文章（无章节则专栏 / 文章） */}
            <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <Link
                href={`/docs/${setData.slug}`}
                className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
              >
                {setData.title}
              </Link>
              {chapterTitle && (
                <>
                  <span>/</span>
                  <span>{chapterTitle}</span>
                </>
              )}
              <span>/</span>
              <span className="text-[var(--text-secondary)] line-clamp-1">
                {post.title}
              </span>
            </nav>

            {/* 文章头部 */}
            <header className="mb-10 animate-fade-in-up">
              <h1
                className="mb-3 text-[1.75rem] font-bold leading-tight tracking-tight text-[var(--text-primary)]
                           sm:text-[2rem] lg:text-[2.125rem]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--text-tertiary)]">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
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
                  {post.tags.map((tag) => (
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

            <div className="mb-8 h-px bg-[var(--border-default)]" />

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
                  href={`/docs/${setData.slug}/${prev.slug}`}
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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
                  href={`/docs/${setData.slug}/${next.slug}`}
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
        </div>
      </main>

      {/* ── 右侧文章 TOC（固定宽度，常驻；xl 以下转为右下浮层） ── */}
      <TableOfContents headings={headings} />
    </div>
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
