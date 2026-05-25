import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { getPosts, getCategoryBySlug } from "@/lib/db";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug, locale as "zh-CN" | "en");

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} | Lumi's Blog`,
    description: category.description,
    alternates: {
      languages: {
        "zh-CN": `/category/${slug}`,
        en: `/en/category/${slug}`,
      },
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const category = await getCategoryBySlug(slug, locale as "zh-CN" | "en");

  if (!category) {
    notFound();
  }

  const { posts } = await getPosts({ locale: locale as "zh-CN" | "en", categorySlug: slug });

  return <CategoryContent category={category} posts={posts} />;
}

function CategoryContent({ category, posts }: { category: any; posts: any[] }) {
  const t = useTranslations();

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-20 blur-[100px]"
              style={{ background: "var(--glow-primary)" }}
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
              <span>{t("category.label")}</span>
            </nav>

            <div className="mb-3 animate-fade-in-up">
              <span
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] 
                           bg-[var(--accent-muted)] px-3 py-1 text-xs font-medium text-[var(--accent-primary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                CATEGORY
              </span>
            </div>

            <h1
              className="mb-3 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl animate-fade-in-up stagger-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {category.name}
            </h1>

            {category.description && (
              <p className="mb-2 max-w-xl text-base text-[var(--text-secondary)] animate-fade-in-up stagger-3">
                {category.description}
              </p>
            )}

            <p className="text-sm text-[var(--text-tertiary)] animate-fade-in-up stagger-4">
              {t("post.totalInCategory", { count: posts.length })}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
          {posts.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                {t("post.noCategoryPosts")}
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
