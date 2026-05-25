import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MarkdownContent } from "@/components/markdown-content";
import { getPostBySlug, getAdjacentPosts } from "@/lib/db";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale as "zh-CN" | "en");

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | Lumi's Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
    },
    alternates: {
      languages: {
        "zh-CN": `/posts/${slug}`,
        en: `/en/posts/${slug}`,
      },
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPostBySlug(slug, locale as "zh-CN" | "en");

  if (!post) {
    notFound();
  }

  const { prev, next } = await getAdjacentPosts(slug, locale as "zh-CN" | "en");

  return <PostContent post={post} prev={prev} next={next} />;
}

function PostContent({ post, prev, next }: { post: any; prev: any; next: any }) {
  const t = useTranslations();

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <article className="mx-auto max-w-[900px] px-6 py-12 sm:py-16">
          {/* 面包屑 */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Link
              href="/"
              className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
            >
              {t("common.home")}
            </Link>
            <span>/</span>
            <Link
              href={`/category/${post.category.slug}`}
              className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
            >
              {post.category.name}
            </Link>
          </nav>

          {/* 文章头部 */}
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
              <span>{t("post.readingTime", { time: post.readingTime })}</span>
              {post.viewCount !== undefined && (
                <>
                  <span>·</span>
                  <span>{t("post.views", { count: post.viewCount })}</span>
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

          <div
            className="mb-8 h-px"
            style={{
              background: "linear-gradient(to right, var(--accent-primary), transparent)",
            }}
          />

          {post.content && <MarkdownContent content={post.content} />}

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
                  <svg className="h-3 w-3 transition-transform duration-[var(--duration-fast)] group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  {t("post.prevPost")}
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
                  {t("post.nextPost")}
                  <svg className="h-3 w-3 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
