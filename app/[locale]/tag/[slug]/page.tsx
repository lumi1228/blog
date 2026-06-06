import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { getPosts, getTagBySlug } from "@/lib/db";
import { buildAlternates, SITE_NAME } from "@/lib/seo";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tag = await getTagBySlug(slug, locale as "zh-CN" | "en");

  if (!tag) return { title: "Tag Not Found" };

  const title = `#${tag.name} | ${SITE_NAME}`;
  const description =
    locale === "zh-CN"
      ? `所有标记为 ${tag.name} 的文章`
      : `All posts tagged with ${tag.name}`;

  const { canonical, languages } = buildAlternates(`/tag/${slug}`, `/en/tag/${slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      title,
      description,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tag = await getTagBySlug(slug, locale as "zh-CN" | "en");

  if (!tag) {
    notFound();
  }

  const { posts } = await getPosts({ locale: locale as "zh-CN" | "en", tagSlug: slug });

  return <TagContent tag={tag} posts={posts} />;
}

function TagContent({ tag, posts }: { tag: any; posts: any[] }) {
  const t = useTranslations();

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -left-20 -top-20 h-80 w-80 rounded-full opacity-15 blur-[100px]"
              style={{ background: "var(--glow-secondary)" }}
            />
          </div>

          <div className="relative mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
            <nav className="mb-4 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <Link
                href="/"
                className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
              >
                {t("common.home")}
              </Link>
              <span>/</span>
              <span>{t("tag.label")}</span>
            </nav>

            <h1
              className="mb-3 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl animate-fade-in-up"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-[var(--accent-secondary)]" style={{ fontFamily: "var(--font-mono)" }}>#</span>
              {tag.name}
            </h1>

            <p className="text-sm text-[var(--text-tertiary)] animate-fade-in-up stagger-2">
              {t("post.totalInCategory", { count: posts.length })}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
          {posts.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                {t("post.noTagPosts")}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post, index) => (
                <ArticleCard key={post.id} post={post} index={index} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
