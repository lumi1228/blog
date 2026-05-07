import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import {
  getPostsByCategory,
  mockCategories,
} from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = mockCategories.find((c) => c.slug === slug);

  if (!category) return { title: "分类未找到" };

  return {
    title: `${category.name} | Lumi's Blog`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = mockCategories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const posts = getPostsByCategory(slug);

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
            {/* 面包屑 */}
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

            {/* 分类标签 */}
            <div className="mb-3 animate-fade-in-up">
              <span
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] 
                           bg-[var(--accent-muted)] px-3 py-1 text-xs font-medium text-[var(--accent-primary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                CATEGORY
              </span>
            </div>

            {/* 标题 */}
            <h1
              className="mb-3 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl animate-fade-in-up stagger-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {category.name}
            </h1>

            {/* 描述 */}
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
            <EmptyState message="这个分类下暂时还没有文章" />
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

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] 
                 bg-[var(--bg-secondary)] px-8 py-16 text-center"
    >
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center 
                   rounded-[var(--radius-full)] bg-[var(--accent-muted)]"
      >
        <svg
          className="h-6 w-6 text-[var(--accent-primary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}
