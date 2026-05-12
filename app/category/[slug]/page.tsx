import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { getPosts, getCategoryBySlug } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "分类未找到" };

  return {
    title: `${category.name} | Lumi's Blog`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { posts } = await getPosts({ categorySlug: slug });

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* 页面标题区 */}
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
                首页
              </Link>
              <span>/</span>
              <span>分类</span>
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
              共 {posts.length} 篇文章
            </p>
          </div>
        </section>

        {/* 文章列表 */}
        <section className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
          {posts.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                这个分类下暂时还没有文章
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
