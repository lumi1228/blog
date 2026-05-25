import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { Pagination } from "@/components/pagination";
import { getPosts } from "@/lib/db";

const PAGE_SIZE = 10;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  setRequestLocale(locale);

  // 解析页码，确保合法
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { posts, total } = await getPosts({
    locale: locale as "zh-CN" | "en",
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <HomeContent
      posts={posts}
      total={total}
      locale={locale}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}

function HomeContent({
  posts,
  total,
  locale,
  currentPage,
  totalPages,
}: {
  posts: any[];
  total: number;
  locale: string;
  currentPage: number;
  totalPages: number;
}) {
  const t = useTranslations();

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
                  {t("home.badge")}
                </span>
              </div>

              {/* 标题 */}
              <h1
                className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] 
                           sm:text-4xl lg:text-5xl animate-fade-in-up stagger-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("home.title1")}
                <br />
                <span className="text-[var(--accent-primary)]">{t("home.title2")}</span>
              </h1>

              {/* 描述 */}
              <p className="mb-8 max-w-lg text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg animate-fade-in-up stagger-3">
                {t("home.description1")}
                <br className="hidden sm:block" />
                {t("home.description2")}
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
                  {t("home.startReading")}
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
                  {t("home.aboutMe")}
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
              {t("home.latestPosts")}
            </h2>
            <span className="text-sm text-[var(--text-tertiary)]">
              {t("home.totalPosts", { count: total })}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] px-8 py-16 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                {t("home.noPosts")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {posts.map((post, index) => (
                  <ArticleCard key={post.id} post={post} index={index} locale={locale} />
                ))}
              </div>

              {/* 分页控件 */}
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
