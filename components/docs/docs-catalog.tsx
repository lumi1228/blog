/**
 * 知识库及章节目录共享视图，不加载或渲染 Markdown 正文。
 * --- @ty.aicoding@ ---
 */
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { DocsDirectory, DocsDirectoryChapter, DocsChapterPost } from "@/lib/types";

/**
 * --- @ty.aicoding@ ---
 */
interface DocsCatalogProps {
  directory: DocsDirectory;
  chapter?: DocsDirectoryChapter;
  posts?: DocsChapterPost[];
}

/**
 * 知识库页展示分组标题列表，章节页展示该章的文章摘要。
 * --- @ty.aicoding@ ---
 */
export async function DocsCatalog({ directory, chapter, posts = [] }: DocsCatalogProps) {
  const [t, postT, locale] = await Promise.all([
    getTranslations("docs"), getTranslations("post"), getLocale(),
  ]);
  const setPath = `/docs/${directory.slug}`;
  const articleCount = chapter ? posts.length : directory.chapters.reduce((total, item) => total + item.posts.length, 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-12">
      <nav aria-label={t("breadcrumbs")} className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
        <Link href="/docs" className="hover:text-[var(--accent-primary)]">{t("label")}</Link>
        <span aria-hidden="true">/</span>
        {chapter ? (
          <>
            <Link href={setPath} className="hover:text-[var(--accent-primary)]">{directory.title}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[var(--text-secondary)]">{chapter.title}</span>
          </>
        ) : <span aria-current="page" className="text-[var(--text-secondary)]">{directory.title}</span>}
      </nav>

      <header className="mb-10">
        <p className="mb-3 text-xs font-medium text-[var(--accent-primary)]">{t(chapter ? "chapterDirectory" : "setDirectory")}</p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>{chapter?.title ?? directory.title}</h1>
        {!chapter && directory.description && <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{directory.description}</p>}
        <div className="mt-4 flex gap-4 text-xs text-[var(--text-tertiary)]">
          {!chapter && <span>{t("chapterCount", { count: directory.chapters.length })}</span>}
          <span>{t("articleCount", { count: articleCount })}</span>
        </div>
      </header>

      {chapter ? (
        posts.length > 0 ? (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`${setPath}/${post.slug}`} className="group block rounded-[var(--radius-md)] px-3 py-6 transition-colors duration-[var(--duration-fast)] hover:bg-[var(--bg-secondary)]">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">{post.excerpt}</p>}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-tertiary)]">
                    <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}</time>
                    <span>{postT("readingTime", { time: post.readingTime })}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-[var(--text-secondary)]">{t("emptyChapter")}</p>
      ) : directory.chapters.length > 0 ? (
        <div className="space-y-5">
          {directory.chapters.map((item) => (
            <section key={item.id} className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
              <h2>
                <Link href={`${setPath}/chapters/${item.id}`} className="flex items-center justify-between gap-4 bg-[var(--bg-secondary)] px-5 py-4 transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]">
                  <span className="text-base font-semibold">{item.title}</span>
                  <span className="shrink-0 text-xs font-normal text-[var(--text-tertiary)]">{t("articleCount", { count: item.posts.length })} →</span>
                </Link>
              </h2>
              {item.posts.length > 0 ? (
                <ul className="divide-y divide-[var(--border-subtle)] px-5">
                  {item.posts.map((post) => (
                    <li key={post.id}>
                      <Link href={`${setPath}/${post.slug}`} className="block py-3 text-sm leading-relaxed text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]">{post.title}</Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="px-5 py-4 text-sm text-[var(--text-tertiary)]">{t("emptyChapter")}</p>}
            </section>
          ))}
        </div>
      ) : <p className="text-sm text-[var(--text-secondary)]">{t("noArticles")}</p>}
    </main>
  );
}
