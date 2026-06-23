import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArticleCard } from "@/components/article-card";
import { ColumnCard } from "@/components/column-card";
import { Pagination } from "@/components/pagination";
import { getPosts, getColumns } from "@/lib/db";
import { buildAlternates } from "@/lib/seo";
import type { Locale } from "@/i18n/config";
import { aboutConfig } from "@/config/about";
import Image from "next/image";

const PAGE_SIZE = 10;
const FEATURED_COLUMNS_COUNT = 3;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

const descriptions: Record<Locale, string> = {
  "zh-CN": "一个女性开发者的技术博客",
  en: "A female developer's tech blog",
};

const ogLocales: Record<Locale, string> = {
  "zh-CN": "zh_CN",
  en: "en_US",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const description = descriptions[typedLocale] ?? descriptions["zh-CN"];
  const alternates = buildAlternates("/", "/en");

  return {
    title: "Lumi's Blog",
    description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages as Record<string, string>,
    },
    openGraph: {
      type: "website",
      locale: ogLocales[typedLocale] ?? "zh_CN",
      title: "Lumi's Blog",
      description,
    },
  };
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  setRequestLocale(locale);

  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // 获取博客列表
  const { posts, total } = await getPosts({
    locale: locale as "zh-CN" | "en",
    limit: PAGE_SIZE,
    offset,
  });

  // 获取精选专栏（前3个）
  const allColumns = await getColumns(locale as Locale);
  const featuredColumns = allColumns.slice(0, FEATURED_COLUMNS_COUNT);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <HomeContent
      posts={posts}
      total={total}
      columns={featuredColumns}
      hasMoreColumns={allColumns.length > FEATURED_COLUMNS_COUNT}
      locale={locale}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}

function HomeContent({
  posts,
  total,
  columns,
  hasMoreColumns,
  locale,
  currentPage,
  totalPages,
}: {
  posts: any[];
  total: number;
  columns: any[];
  hasMoreColumns: boolean;
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
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] py-16 sm:py-20 lg:py-24">
          {/* 移动端背景加深层 */}
          <div className="absolute inset-0 bg-black/40 lg:bg-transparent pointer-events-none" />
          
          {/* 极简紫色光晕背景 + 流星动画 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* 主光晕 - 中央 (移动端隐藏，PC端降低透明度) */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-0 lg:opacity-8 blur-[140px] animate-aurora-1"
              style={{ background: "var(--accent-primary)" }}
            />
            {/* 次光晕 - 右上 (移动端隐藏，PC端降低透明度) */}
            <div
              className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full opacity-0 lg:opacity-6 blur-[120px] animate-aurora-2"
              style={{ background: "var(--accent-primary)" }}
            />
            
            {/* 流星效果 - 多条流星 */}
            <div 
              className="absolute top-[10%] -right-[10%] h-[2px] w-[150px] opacity-0"
              style={{
                background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                boxShadow: "0 0 8px var(--accent-primary)",
                animation: "shooting-star 3s ease-in-out infinite",
                animationDelay: "0s"
              }}
            />
            <div 
              className="absolute top-[30%] -right-[5%] h-[1.5px] w-[120px] opacity-0"
              style={{
                background: "linear-gradient(90deg, transparent, var(--accent-secondary), transparent)",
                boxShadow: "0 0 6px var(--accent-secondary)",
                animation: "shooting-star 4s ease-in-out infinite",
                animationDelay: "1.5s"
              }}
            />
            <div 
              className="absolute top-[60%] right-[20%] h-[2px] w-[100px] opacity-0"
              style={{
                background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                boxShadow: "0 0 8px var(--accent-primary)",
                animation: "shooting-star 3.5s ease-in-out infinite",
                animationDelay: "3s"
              }}
            />
            <div 
              className="absolute top-[20%] left-[10%] h-[1.5px] w-[130px] opacity-0"
              style={{
                background: "linear-gradient(90deg, transparent, var(--accent-tertiary), transparent)",
                boxShadow: "0 0 6px var(--accent-tertiary)",
                animation: "shooting-star 4.5s ease-in-out infinite",
                animationDelay: "2s"
              }}
            />
          </div>

          <div className="relative mx-auto max-w-[1200px] px-6">
            {/* 左右分栏布局容器 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* 左侧：文本内容 */}
              <div className="max-w-2xl relative z-10">
                {/* 极光微章 */}
                <div className="mb-6 animate-fade-in-up stagger-1 flex justify-start">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full 
                               bg-[var(--accent-muted)] px-3.5 py-1 text-xs font-semibold tracking-wider text-[var(--accent-primary)]
                               border border-[var(--accent-primary)]/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-ping" />
                    {t("home.badge")}
                  </span>
                </div>

              {/* 博客标题 */}
              <h1
                className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] 
                           sm:text-5xl lg:text-6xl animate-fade-in-up stagger-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("home.title1")}
                <br />
                <span className="bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] bg-clip-text text-transparent">
                  {t("home.title2")}
                </span>
              </h1>

              {/* 博客描述 */}
              <p className="mb-10 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg animate-fade-in-up stagger-3">
                {t("home.description1")}
                <br />
                {t("home.description2")}
              </p>

              {/* CTA 按钮组 */}
              <div className="flex flex-wrap items-start gap-4 animate-fade-in-up stagger-4">
                <a
                  href="#posts"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] 
                             bg-[var(--accent-primary)] px-7 py-3.5 text-sm font-semibold
                             text-[var(--bg-primary)] transition-all duration-[var(--duration-normal)]
                             hover:shadow-[0_0_30px_var(--glow-primary)] hover:scale-[1.03] active:scale-95"
                >
                  {t("home.startReading")}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <a
                  href={`/${locale}/about`}
                  className="frosted-glass inline-flex items-center gap-2 rounded-[var(--radius-md)] 
                             px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] 
                             transition-all duration-[var(--duration-fast)]
                             hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:scale-[1.03]"
                >
                  {t("home.aboutMe")}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* 右侧：头像艺术装置 */}
            {aboutConfig.avatar && (
              <div className="flex justify-center lg:justify-end">
                <div className="relative h-[400px] w-[400px] lg:h-[600px] lg:w-[600px]">
                  {/* 背景光晕圈 - 最外层 */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-20 blur-[100px] animate-pulse"
                    style={{ 
                      background: "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)",
                      animationDuration: "4s"
                    }}
                  />
                  
                  {/* 装饰圆环 1 - 外圈 */}
                  <div 
                    className="absolute inset-[8%] rounded-full border-2 border-[var(--accent-primary)]/10 opacity-30 lg:opacity-100"
                    style={{
                      background: "conic-gradient(from 0deg, transparent 0deg, var(--accent-primary) 60deg, transparent 120deg)",
                      animation: "spin 20s linear infinite"
                    }}
                  />
                  
                  {/* 装饰圆环 2 - 中圈（反向旋转）*/}
                  <div 
                    className="absolute inset-[18%] rounded-full border border-[var(--accent-primary)]/15 opacity-30 lg:opacity-100"
                    style={{
                      background: "conic-gradient(from 180deg, transparent 0deg, var(--accent-primary) 90deg, transparent 180deg)",
                      animation: "spin-reverse 15s linear infinite"
                    }}
                  />
                  
                  {/* 主头像 - 保留原色的半透明效果 */}
                  <div className="absolute inset-[28%] rounded-full overflow-hidden">
                    <Image
                      src={aboutConfig.avatar}
                      alt={aboutConfig.name}
                      fill
                      className="object-cover opacity-[0.35] dark:opacity-[0.42]"
                      style={{
                        filter: "saturate(1.1) contrast(1.05) brightness(1.05)"
                      }}
                      priority
                    />
                    {/* 头像上的轻微渐变遮罩 */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: "radial-gradient(circle at 30% 30%, transparent 40%, var(--bg-primary) 100%)",
                        opacity: 0.15
                      }}
                    />
                  </div>
                  
                  {/* 装饰粒子点 - 动态闪烁 */}
                  <div 
                    className="absolute top-[15%] right-[20%] h-2 w-2 rounded-full bg-[var(--accent-primary)] opacity-40 lg:opacity-100"
                    style={{
                      boxShadow: "0 0 20px var(--accent-primary)",
                      animation: "pulse 3s ease-in-out infinite",
                      animationDelay: "0s"
                    }}
                  />
                  <div 
                    className="absolute bottom-[25%] left-[15%] h-1.5 w-1.5 rounded-full bg-[var(--accent-secondary)] opacity-40 lg:opacity-100"
                    style={{
                      boxShadow: "0 0 15px var(--accent-secondary)",
                      animation: "pulse 3s ease-in-out infinite",
                      animationDelay: "1s"
                    }}
                  />
                  <div 
                    className="absolute top-[55%] right-[12%] h-1 w-1 rounded-full bg-[var(--accent-tertiary)] opacity-40 lg:opacity-100"
                    style={{
                      boxShadow: "0 0 10px var(--accent-tertiary)",
                      animation: "pulse 3s ease-in-out infinite",
                      animationDelay: "2s"
                    }}
                  />
                </div>
              </div>
            )}
            </div>
          </div>
        </section>

        {/* 精选专栏区 */}
        {columns.length > 0 && (
          <section id="columns" className="mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2
                  className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t("home.featuredColumns")}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                  {t("home.featuredColumnsDesc")}
                </p>
              </div>
              {hasMoreColumns && (
                <a
                  href={`/${locale}/columns`}
                  className="text-sm text-[var(--text-secondary)] transition-colors 
                             duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
                >
                  {t("home.allColumns")} →
                </a>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map((column, index) => (
                <ColumnCard key={column.id} column={column} locale={locale} index={index} />
              ))}
            </div>
          </section>
        )}

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
