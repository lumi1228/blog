import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MarkdownContent } from "@/components/markdown-content";
import { getPostBySlug, getAdjacentPosts } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 动态生成 metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "文章未找到" };
  }

  return {
    title: `${post.title} | Lumi's Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { prev, next } = await getAdjacentPosts(slug);

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
              首页
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
            {/* 分类 */}
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

            {/* 标题 */}
            <h1
              className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] 
                         sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {post.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-tertiary)]">
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
              <span>·</span>
              <span>{post.readingTime} min read</span>
              {post.viewCount !== undefined && (
                <>
                  <span>·</span>
                  <span>{post.viewCount.toLocaleString()} 次阅读</span>
                </>
              )}
            </div>

            {/* 标签 */}
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

          {/* 分割线装饰 */}
          <div
            className="mb-8 h-px"
            style={{
              background:
                "linear-gradient(to right, var(--accent-primary), transparent)",
            }}
          />

          {/* 文章正文 */}
          {post.content && <MarkdownContent content={post.content} />}

          {/* 文章底部分割线 */}
          <div
            className="my-12 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--border-default), transparent)",
            }}
          />

          {/* 上一篇 / 下一篇导航 */}
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
                  上一篇
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
                  下一篇
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
