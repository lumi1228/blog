import Link from "next/link";
import type { Post } from "@/lib/types";

interface ArticleCardProps {
  post: Post;
  index: number;
  locale?: string;
}

export function ArticleCard({ post, index, locale = "zh-CN" }: ArticleCardProps) {
  const coverSrc = post.coverImage ?? post.coverImageFallback ?? null;
  return (
    <article
      className="group frosted-glass relative rounded-[var(--radius-lg)] p-6 sm:p-7
                 transition-all duration-[var(--duration-normal)]
                 hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)]
                 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        {/* 文章信息 */}
        <div className="flex-1 min-w-0">
          {/* 分类 + 日期 */}
          <div className="mb-3 flex items-center gap-2 text-xs">
            <Link
              href={`/category/${post.category.slug}`}
              className="rounded-full bg-[var(--accent-muted)] px-3 py-0.5 
                         font-semibold text-[var(--accent-primary)] transition-all duration-[var(--duration-fast)]
                         border border-[var(--accent-primary)]/10
                         hover:bg-[var(--accent-primary)] hover:text-[#030712] hover:border-transparent"
            >
              {post.category.name}
            </Link>
            <span className="text-[var(--text-tertiary)]">·</span>
            <time className="text-[var(--text-tertiary)]" dateTime={post.publishedAt}>
              {formatDate(post.publishedAt, locale)}
            </time>
            <span className="text-[var(--text-tertiary)]">·</span>
            <span className="text-[var(--text-tertiary)] font-mono">{post.readingTime} min</span>
          </div>

          {/* 标题 */}
          <h3 className="mb-2">
            <Link
              href={`/posts/${post.slug}`}
              className="text-xl font-bold leading-snug text-[var(--text-primary)]
                         transition-colors duration-[var(--duration-fast)]
                         group-hover:text-[var(--accent-primary)]
                         sm:text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {post.title}
            </Link>
          </h3>

          {/* 摘要 */}
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            {post.excerpt}
          </p>

          {/* 标签 (冰晶小标签) */}
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] 
                           bg-[var(--bg-primary)]/30 px-2.5 py-0.5 text-xs text-[var(--text-tertiary)]
                           transition-all duration-[var(--duration-fast)]
                           hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-primary)]/60"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 封面图 (冰川倒影缩放) */}
        {coverSrc && (
          <div className="shrink-0 overflow-hidden rounded-[var(--radius-md)] sm:w-52 sm:h-36 border border-[var(--border-subtle)] relative">
            <img
              src={coverSrc}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)]
                         group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* Hover 时的极光渐变流光底线 */}
      <div
        className="absolute bottom-0 left-6 right-6 h-[2px] origin-left scale-x-0 
                   transition-transform duration-[var(--duration-normal)]
                   group-hover:scale-x-100"
        style={{
          background: "linear-gradient(to right, var(--accent-primary), transparent)",
        }}
      />
    </article>
  );
}

function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";

  if (locale === "en") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
