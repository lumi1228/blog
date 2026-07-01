import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import { CoverHero } from "@/components/cover-hero";
import { getPostBySlug, getAdjacentPosts } from "@/lib/db";
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
import type { Post } from "@/lib/types";
import type { Heading } from "@/lib/markdown/extractHeadings";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale as Locale);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const hasUserCover = !!post.coverImage;
  const coverOk = hasUserCover ? await validateCoverImage(post.coverImage) : false;
  const { images } = buildOgImages(post.coverImage, coverOk);

  const alternates = buildAlternates(
    `/posts/${slug}`,
    `/en/posts/${slug}`,
    post.availableLocales
  );

  return {
    title: `${post.title} | Lumi's Blog`,
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
      images: images,
    },
    twitter: {
      card: images.length > 0 ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      ...(images.length > 0 ? { images } : {}),
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPostBySlug(slug, locale as Locale);

  if (!post) {
    notFound();
  }

  const { prev, next } = await getAdjacentPosts(slug, locale as Locale);

  // 提取文章标题，用于 TOC
  const headings = extractHeadings(post.content ?? "");

  // 计算封面图可达性（与 generateMetadata 共享 React cache，不重复发 HEAD 请求）
  const hasUserCover = !!post.coverImage;
  const coverOk = hasUserCover ? await validateCoverImage(post.coverImage) : false;
  const { images } = buildOgImages(post.coverImage, coverOk);

  // 构建 Article JSON-LD
  const jsonLd = buildArticleJsonLd({
    url: `${SITE_URL}/posts/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    publishedAt: post.publishedAt,
    author: aboutConfig.name,
    inLanguage: locale as Locale,
    image: images.length > 0 ? images[0] : undefined,
    updatedAt: post.updatedAt,
  });

  // 服务端获取翻译，避免在 PostContent 中使用 useTranslations hook
  const t = await getTranslations();

  const translations = {
    blog: t("nav.blog"),
    readingTime: (time: number) => t("post.readingTime", { time }),
    views: (count: number) => t("post.views", { count }),
    prevPost: t("post.prevPost"),
    nextPost: t("post.nextPost"),
  };

  return (
    <PostContent
      post={post}
      prev={prev}
      next={next}
      headings={headings}
      jsonLd={jsonLd}
      translations={translations}
    />
  );
}

interface PostContentProps {
  post: Post;
  prev: Post | null;
  next: Post | null;
  headings: Heading[];
  jsonLd: Record<string, unknown>;
  translations: {
    blog: string;
    readingTime: (time: number) => string;
    views: (count: number) => string;
    prevPost: string;
    nextPost: string;
  };
}

function PostContent({ post, prev, next, headings, jsonLd, translations }: PostContentProps) {
  const t = translations;
  const coverSrc = post.coverImage ?? post.coverImageFallback ?? null;

  return (
    <>
      <Navbar />

      <main className="article-theme flex-1">
        {/* 外层容器：居中 + 水平 padding。
            容器宽度收紧到 80rem(1280px)，正好容纳「正文 60rem + 间距 + TOC 17rem」，
            右侧不再残留死白，整体居中后左右留白均衡。 */}
        <div className="mx-auto max-w-[80rem] px-6 py-12 sm:py-16">
          {/* 两栏布局：文章主体(左，填满 TOC 之外的空间) + 右侧 TOC(固定)。
              xl 以下回退为单列：主体 mx-auto 居中，TOC 转为右下浮层。 */}
          <div className="xl:flex xl:items-start xl:gap-12">

            {/* ── 文章主体（xl+ 填满剩余空间，约 60rem，比原 56rem 略宽但不过满） ── */}
            <article className="mx-auto w-full min-w-0 max-w-[64rem] xl:mx-0 xl:max-w-none xl:flex-1">
              {/* JSON-LD 结构化数据 */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
              />

              {/* 面包屑：博客 / 文章分类 / 文章名字 */}
              <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                <Link
                  href="/blog"
                  className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
                >
                  {t.blog}
                </Link>
                <span>/</span>
                <Link
                  href={`/category/${post.category.slug}`}
                  className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
                >
                  {post.category.name}
                </Link>
                <span>/</span>
                <span className="text-[var(--text-secondary)] line-clamp-1">
                  {post.title}
                </span>
              </nav>

              {/* 文章头部：有封面时图文融合 Hero，无封面时常规标题 */}
              {coverSrc ? (
                <header className="mb-10">
                  <CoverHero src={coverSrc}>
                    <div className="mb-4">
                      <Link
                        href={`/category/${post.category.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)]
                                   border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white
                                   backdrop-blur-md transition-colors duration-[var(--duration-fast)]
                                   hover:bg-white/25"
                      >
                        {post.category.name}
                      </Link>
                    </div>

                    <h1
                      className="mb-3 text-[1.75rem] font-bold leading-tight tracking-tight text-white
                                 sm:text-[2rem] lg:text-[2.125rem] [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.65)]">
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
                            className="rounded-[var(--radius-sm)] border border-white/20 bg-white/10
                                       px-2 py-0.5 text-xs text-white/90 backdrop-blur-sm
                                       transition-colors duration-[var(--duration-fast)]
                                       hover:border-white/45 hover:bg-white/20"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </CoverHero>
                </header>
              ) : (
                <header className="mb-10 animate-fade-in-up">
                  <div className="mb-4">
                    <Link
                      href={`/category/${post.category.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] 
                                 bg-[var(--accent-muted)] px-3 py-1 text-xs font-medium text-[var(--accent-primary)]
                                 transition-colors duration-[var(--duration-fast)]
                                 hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)]"
                    >
                      {post.category.name}
                    </Link>
                  </div>

                  <h1
                    className="mb-3 text-[1.75rem] font-bold leading-tight tracking-tight text-[var(--text-primary)] 
                               sm:text-[2rem] lg:text-[2.125rem]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--text-tertiary)]">
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
              )}

              <ViewCounter postId={post.id} />

              <div className="mb-8 h-px bg-[var(--border-default)]" />

              {post.content && <MarkdownRenderer content={post.content} />}

              <div
                className="my-12 h-px"
                style={{
                  background: "linear-gradient(to right, transparent, var(--border-default), transparent)",
                }}
              />

              {/* 上一篇 / 下一篇 */}
              <nav className="grid gap-4 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={`/posts/${prev.slug}`}
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
                    href={`/posts/${next.slug}`}
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

            {/* ── 右侧 TOC（xl 断点以上显示） ── */}
            <TableOfContents headings={headings} />

          </div>
        </div>
      </main>

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
