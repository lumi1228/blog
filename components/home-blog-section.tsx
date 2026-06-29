import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Post } from "@/lib/types";

interface HomeBlogSectionProps {
  posts: Post[];
  total: number;
  locale: string;
}

export function HomeBlogSection({ posts, total, locale }: HomeBlogSectionProps) {
  const t = useTranslations();
  const [featuredPost, ...otherPosts] = posts;

  return (
    <section
      id="blog"
      className="relative flex flex-col overflow-hidden bg-[var(--bg-primary)] min-h-[calc(100dvh-4rem)]"
    >
      {/* 装饰背景（与知识库错位，营造节奏感） */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div
          className="absolute right-0 -bottom-20 h-[500px] w-[500px] rounded-full opacity-[0.04] blur-[130px]"
          style={{ background: "var(--accent-primary)" }}
        />
        <div
          className="absolute -left-20 top-1/3 h-[350px] w-[350px] rounded-full opacity-[0.03] blur-[100px]"
          style={{ background: "var(--accent-secondary)" }}
        />
      </div>

      {/* Zone 1：Header */}
      <div className="relative mx-auto w-full max-w-[1200px] flex-shrink-0 border-t border-[var(--border-subtle)] px-6 pt-10 pb-6 sm:pt-12">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]
                          bg-[var(--accent-muted)] border border-[var(--accent-primary)]/20"
            >
              <svg
                className="h-4 w-4 text-[var(--accent-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h2
              className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("home.blogSection.title")}
            </h2>
            {total > 0 && (
              <span
                className="rounded-[var(--radius-full)] bg-[var(--bg-tertiary)] px-2.5 py-0.5
                           text-xs text-[var(--text-tertiary)] border border-[var(--border-subtle)]"
              >
                {t("home.blogSection.totalCount", { count: total })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Zone 2：Content（flex-1） */}
      <div className="relative mx-auto w-full max-w-[1200px] flex-1 px-6 pb-5 flex flex-col">
        {posts.length === 0 ? (
          /* 空状态 */
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-4 py-12">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full
                          bg-[var(--accent-muted)] border border-[var(--accent-primary)]/20"
            >
              <svg
                className="h-7 w-7 text-[var(--accent-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">
              {t("home.blogSection.empty")}
            </p>
          </div>
        ) : (
          /* 内容布局：Featured 大卡 + 右侧紧凑列表 */
          <div className="flex flex-1 flex-col gap-5 lg:flex-row min-h-[300px]">
            {/* 左侧：Featured 大卡 */}
            <div className="flex flex-col lg:flex-[3]">
              <FeaturedPostCard post={featuredPost} locale={locale} />
            </div>

            {/* 右侧：紧凑卡片列 */}
            {otherPosts.length > 0 && (
              <div className="flex flex-col gap-3 lg:flex-[2]">
                {otherPosts.map((post, i) => (
                  <CompactPostCard
                    key={post.id}
                    post={post}
                    locale={locale}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone 3：CTA Footer */}
      <div className="relative mx-auto w-full max-w-[1200px] flex-shrink-0 border-t border-[var(--border-subtle)] px-6 py-5">
        <div className="flex items-center justify-end">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)]
                       bg-[var(--accent-muted)] px-4 py-2 text-xs font-semibold
                       text-[var(--accent-primary)] border border-[var(--accent-primary)]/20
                       transition-all duration-[var(--duration-fast)]
                       hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)]
                       hover:border-transparent hover:shadow-[0_0_20px_var(--glow-primary)]"
          >
            {t("home.blogSection.viewAll")}
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Featured 大卡（封面前置·沉浸式） ──────────────────────────────────────────

function FeaturedPostCard({ post, locale }: { post: Post; locale: string }) {
  const coverSrc = post.coverImage ?? post.coverImageFallback ?? null;
  const onCover = !!coverSrc;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative flex h-full min-h-[320px] flex-1 flex-col justify-end overflow-hidden
                 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] animate-fade-in-up
                 transition-all duration-[var(--duration-normal)]
                 hover:border-[var(--accent-primary)]/40
                 hover:shadow-[var(--shadow-glow-accent)]"
    >
      {/* 背景：封面铺满 + 暗色蒙版（保证浅色文字在任意封面上清晰）；无封面回退磨砂 */}
      {onCover ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverSrc!}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover
                       transition-transform duration-[var(--duration-slow)] group-hover:scale-[1.04]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-black/10" />
        </>
      ) : (
        <div aria-hidden="true" className="absolute inset-0 frosted-glass" />
      )}

      {/* 叠加内容 */}
      <div className="relative z-10 p-6 sm:p-7 lg:p-8">
        {/* 分类 + 元信息 */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={
              onCover
                ? "rounded-[var(--radius-full)] border border-white/25 bg-white/15 px-3 py-0.5 font-semibold text-white backdrop-blur-md"
                : "rounded-[var(--radius-full)] border border-[var(--accent-primary)]/10 bg-[var(--accent-muted)] px-3 py-0.5 font-semibold text-[var(--accent-primary)]"
            }
          >
            {post.category.name}
          </span>
          <span className={onCover ? "text-white/60" : "text-[var(--text-tertiary)]"}>·</span>
          <time
            className={onCover ? "text-white/75" : "text-[var(--text-tertiary)]"}
            dateTime={post.publishedAt}
          >
            {formatDate(post.publishedAt, locale)}
          </time>
          <span className={onCover ? "text-white/60" : "text-[var(--text-tertiary)]"}>·</span>
          <span className={`font-mono ${onCover ? "text-white/75" : "text-[var(--text-tertiary)]"}`}>
            {post.readingTime} min
          </span>
        </div>

        {/* 标题 */}
        <h3
          className={
            onCover
              ? "mb-3 text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl [text-shadow:0_2px_12px_rgba(0,0,0,0.55)]"
              : "mb-3 text-xl font-bold leading-snug text-[var(--text-primary)] transition-colors duration-[var(--duration-fast)] group-hover:text-[var(--accent-primary)] sm:text-2xl lg:text-3xl"
          }
          style={{ fontFamily: "var(--font-display)" }}
        >
          {post.title}
        </h3>

        {/* 摘要 */}
        <p
          className={
            onCover
              ? "text-sm leading-relaxed text-white/85 line-clamp-2 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] sm:line-clamp-3"
              : "text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-3 sm:line-clamp-4"
          }
        >
          {post.excerpt}
        </p>

        {/* 标签 */}
        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.slug}
                className={
                  onCover
                    ? "rounded-[var(--radius-sm)] border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs text-white/90 backdrop-blur-sm"
                    : "rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-primary)]/30 px-2.5 py-0.5 text-xs text-[var(--text-tertiary)]"
                }
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 底部流光线 */}
      <div
        className="absolute bottom-0 left-6 right-6 z-10 h-[2px] origin-left scale-x-0
                   transition-transform duration-[var(--duration-normal)] group-hover:scale-x-100"
        style={{ background: "linear-gradient(to right, var(--accent-primary), transparent)" }}
      />
    </Link>
  );
}

// ─── 紧凑卡片（封面左置·横向） ────────────────────────────────────────────────

function CompactPostCard({
  post,
  locale,
  index,
}: {
  post: Post;
  locale: string;
  index: number;
}) {
  const coverSrc = post.coverImage ?? post.coverImageFallback ?? null;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group frosted-glass relative flex flex-1 items-stretch overflow-hidden
                 rounded-[var(--radius-lg)] animate-fade-in-up min-h-[88px]
                 transition-all duration-[var(--duration-normal)]
                 hover:border-[var(--accent-primary)]/40
                 hover:shadow-[var(--shadow-glow-accent)]"
      style={{ animationDelay: `${(index + 1) * 80}ms` }}
    >
      {/* 封面（左置竖条，铺满卡片高度） */}
      {coverSrc && (
        <div className="relative w-[36%] max-w-[150px] flex-shrink-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover
                       transition-transform duration-[var(--duration-normal)] group-hover:scale-105"
          />
          {/* 与卡片背景过渡的轻微渐隐，使衔接更自然 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--bg-primary)]/15"
          />
        </div>
      )}

      {/* 文字内容 */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4 sm:px-5">
        <div className="flex items-center gap-2 text-xs">
          <span
            className="max-w-[110px] truncate rounded-[var(--radius-full)] border border-[var(--accent-primary)]/10
                       bg-[var(--accent-muted)] px-2.5 py-0.5 font-semibold text-[var(--accent-primary)]"
          >
            {post.category.name}
          </span>
          <span className="flex-shrink-0 text-[var(--text-tertiary)]">
            {formatDate(post.publishedAt, locale)}
          </span>
        </div>
        <h3
          className="text-sm font-semibold leading-snug text-[var(--text-primary)] line-clamp-2
                     transition-colors duration-[var(--duration-fast)]
                     group-hover:text-[var(--accent-primary)] sm:text-[0.95rem]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {post.title}
        </h3>
      </div>

      {/* 底部流光线 */}
      <div
        className="absolute bottom-0 left-4 right-4 h-[1px] origin-left scale-x-0
                   transition-transform duration-[var(--duration-normal)] group-hover:scale-x-100"
        style={{ background: "linear-gradient(to right, var(--accent-primary), transparent)" }}
      />
    </Link>
  );
}

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  if (locale === "en") {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}
