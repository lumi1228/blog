import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { mockPosts } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero 区域 */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-[100px]"
              style={{ background: "var(--glow-primary)" }}
            />
            <div
              className="absolute -left-20 bottom-0 h-64 w-64 rounded-full opacity-20 blur-[80px]"
              style={{ background: "var(--glow-secondary)" }}
            />
          </div>

          <div className="relative mx-auto max-w-[1200px] px-6 py-16 sm:py-24">
            <div className="max-w-2xl">
              {/* 标签 */}
              <div className="mb-4 animate-fade-in-up stagger-1">
                <span
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] 
                             bg-[var(--accent-muted)] px-3 py-1 text-xs font-medium text-[var(--accent-primary)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                  女性开发者 · 前端工程师
                </span>
              </div>

              {/* 标题 */}
              <h1
                className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] 
                           sm:text-4xl lg:text-5xl animate-fade-in-up stagger-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                代码与设计的
                <br />
                <span className="text-[var(--accent-primary)]">交汇之处</span>
              </h1>

              {/* 描述 */}
              <p className="mb-8 max-w-lg text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg animate-fade-in-up stagger-3">
                记录技术探索、设计思考与成长感悟。
                <br className="hidden sm:block" />
                用代码构建，用设计表达，用文字沉淀。
              </p>

              {/* CTA */}
              <div className="flex items-center gap-3 animate-fade-in-up stagger-4">
                <a
                  href="#posts"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] 
                             bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium
                             text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)]
                             hover:shadow-[var(--shadow-glow-accent)]"
                >
                  开始阅读
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] 
                             border border-[var(--border-default)] px-5 py-2.5 text-sm font-medium
                             text-[var(--text-secondary)] transition-all duration-[var(--duration-fast)]
                             hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                >
                  了解我
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 文章列表 */}
        <section id="posts" className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2
              className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              最新文章
            </h2>
            <span className="text-sm text-[var(--text-tertiary)]">
              共 {mockPosts.length} 篇
            </span>
          </div>

          <div className="grid gap-6">
            {mockPosts.map((post, index) => (
              <ArticleCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
