import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { getPostsByTag, mockTags } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockTags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = mockTags.find((t) => t.slug === slug);

  if (!tag) return { title: "标签未找到" };

  return {
    title: `#${tag.name} | Lumi's Blog`,
    description: `所有标记为 ${tag.name} 的文章`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = mockTags.find((t) => t.slug === slug);

  if (!tag) {
    notFound();
  }

  const posts = getPostsByTag(slug);

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* 页面标题区 */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -left-20 -top-20 h-80 w-80 rounded-full opacity-15 blur-[100px]"
              style={{ background: "var(--glow-secondary)" }}
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
              <span>标签</span>
            </nav>

            {/* 标题 */}
            <h1
              className="mb-3 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl animate-fade-in-up"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span
                className="text-[var(--accent-secondary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                #
              </span>
              {tag.name}
            </h1>

            <p className="text-sm text-[var(--text-tertiary)] animate-fade-in-up stagger-2">
              共 {posts.length} 篇文章
            </p>
          </div>
        </section>

        {/* 文章列表 */}
        <section className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
          {posts.length === 0 ? (
            <div
              className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] 
                         bg-[var(--bg-secondary)] px-8 py-16 text-center"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                这个标签下暂时还没有文章
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
