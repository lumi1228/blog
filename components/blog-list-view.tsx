import { useTranslations } from "next-intl";
import { ArticleCard } from "@/components/article-card";
import { BlogTabs } from "@/components/blog-tabs";
import { Pagination } from "@/components/pagination";
import type { Category, Post } from "@/lib/types";

interface BlogListViewProps {
  locale: string;
  /** 全部分类，用于 Tab 栏 */
  categories: Category[];
  /** 当前激活分类 slug；null 表示「全部」 */
  activeSlug: string | null;
  /** 当前页文章 */
  posts: Post[];
  /** 该筛选条件下的文章总数（用于分页与计数） */
  total: number;
  /** 当前页码（1-based） */
  currentPage: number;
  /** 每页条数 */
  pageSize: number;
  /** 头部主标题（仅用于 sr-only h1，保 SEO/无障碍，不可见） */
  title: string;
}

/**
 * 博客列表共享视图：精简头部（sr-only h1 + Tab 栏 + 计数）+ 文章网格 + 分页 + 空状态。
 *
 * 由 /blog（activeSlug=null）与 /category/[slug]（activeSlug=slug）共用，
 * 仅传入不同的 title 与分页数据。
 */
export function BlogListView({
  locale,
  categories,
  activeSlug,
  posts,
  total,
  currentPage,
  pageSize,
  title,
}: BlogListViewProps) {
  const t = useTranslations();
  const totalPages = Math.ceil(total / pageSize);

  const emptyText =
    activeSlug === null ? t("blog.noPosts") : t("post.noCategoryPosts");

  return (
    <main className="flex-1">
      {/* 头部：紧凑筛选条（Tab 栏 + 计数同行，标题转 sr-only），随滚动吸附在导航栏下方 */}
      <section className="sticky top-16 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1200px] px-6 py-4 sm:py-5">
          <h1 className="sr-only">{title}</h1>

          <div className="flex items-center justify-between gap-4 animate-fade-in-up">
            <div className="min-w-0 flex-1">
              <BlogTabs categories={categories} activeSlug={activeSlug} />
            </div>
            <p className="flex-shrink-0 text-xs text-[var(--text-tertiary)]">
              {t("blog.totalPosts", { count: total })}
            </p>
          </div>
        </div>
      </section>

      {/* 文章列表 */}
      <section className="mx-auto max-w-[1200px] px-6 py-8 sm:py-10">
        {posts.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
            <p className="text-sm text-[var(--text-secondary)]">{emptyText}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:gap-6">
              {posts.map((post, index) => (
                <ArticleCard key={post.id} post={post} index={index} locale={locale} />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </>
        )}
      </section>
    </main>
  );
}
