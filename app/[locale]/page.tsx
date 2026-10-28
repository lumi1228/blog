import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HomeBlogSection } from "@/components/home-blog-section";
import { getPosts, getRandomSiteAvatar } from "@/lib/db";
import { buildAlternates } from "@/lib/seo";
import type { Post } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import Image from "next/image";

/** 首页 featured 博客展示数量（不分页） */
const FEATURED_POSTS_COUNT = 5;

interface PageProps {
  params: Promise<{ locale: string }>;
}

const descriptions: Record<Locale, string> = {
  "zh-CN": "一个女性开发者的技术博客",
  en: "A female developer's tech blog",
};

const ogLocales: Record<Locale, string> = {
  "zh-CN": "zh_CN",
  en: "en_US",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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

/**
 * 首页只加载公开博客与站点头像。
 * --- @ty.aicoding@ ---
 */
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 并行获取所有数据
  const [{ posts: featuredPosts, total: totalPosts }, siteAvatar] =
    await Promise.all([
      getPosts({
        locale: locale as Locale,
        limit: FEATURED_POSTS_COUNT,
        offset: 0,
      }),
      getRandomSiteAvatar(),
    ]);

  return (
    <HomeContent
      featuredPosts={featuredPosts}
      totalPosts={totalPosts}
      locale={locale}
      siteAvatar={siteAvatar}
    />
  );
}

/**
 * 首页展示个人介绍与公开博客，知识库通过导航授权访问。
 * --- @ty.aicoding@ ---
 */
function HomeContent({
  featuredPosts,
  totalPosts,
  locale,
  siteAvatar,
}: {
  featuredPosts: Post[];
  totalPosts: number;
  locale: string;
  siteAvatar: string | null;
}) {
  const t = useTranslations();

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* ── Module 1：Hero ─────────────────────────────────────────────────── */}
        <section className="home-hero relative flex min-h-[calc(100svh-12rem)] items-center overflow-hidden border-b border-[var(--border-subtle)] py-10 sm:py-14 lg:py-16">
          {/* 低速线流画布：以不同周期移动，减少首屏视觉噪声。 */}
          <div className="home-hero-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
          <div className="home-flow-field absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <span className="home-flow-line home-flow-line-1" />
            <span className="home-flow-line home-flow-line-2" />
            <span className="home-flow-line home-flow-line-3" />
            <span className="home-flow-line home-flow-line-4" />
            <span className="home-flow-line home-flow-line-5" />
          </div>

          <div className="relative mx-auto w-full max-w-[1200px] px-6">
            <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
              {/* 左侧：文字内容 */}
              <div className="max-w-2xl relative z-10">
                <div className="mb-6 animate-fade-in-up stagger-1 flex justify-start">
                  <span
                    className="home-hero-chip inline-flex items-center gap-1.5 rounded-full
                               border px-3.5 py-1 text-xs font-semibold tracking-wider"
                  >
                    <span className="home-hero-status h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                    {t("home.badge")}
                  </span>
                </div>

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

                <p className="mb-9 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg animate-fade-in-up stagger-3">
                  {t("home.description1")}
                  <br />
                  {t("home.description2")}
                </p>

                <div className="flex flex-wrap items-start gap-4 animate-fade-in-up stagger-4">
                  <a
                    href="#blog"
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
                    className="inline-flex items-center gap-2 rounded-[var(--radius-md)]
                               border border-[var(--border-default)] bg-[var(--bg-secondary)] px-7 py-3.5
                               text-sm font-semibold text-[var(--text-primary)]
                               transition-all duration-[var(--duration-fast)]
                               hover:border-[var(--accent-primary)]/40 hover:scale-[1.03]"
                  >
                    {t("home.aboutMe")}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* 右侧：扫描式头像框，不依赖首屏背景图片。 */}
              <div className="flex justify-center lg:justify-end">
                <div className="home-avatar-stage relative h-[220px] w-full max-w-[280px] sm:h-[300px] sm:max-w-[350px] lg:h-[430px] lg:max-w-[420px]">
                  <div className="home-avatar-axis home-avatar-axis-horizontal absolute" aria-hidden="true" />
                  <div className="home-avatar-axis home-avatar-axis-vertical absolute" aria-hidden="true" />
                  <div className="home-avatar-outline absolute inset-[6%]" aria-hidden="true" />
                  <div className="home-avatar-frame absolute inset-[12%] overflow-hidden bg-[var(--bg-secondary)]">
                    {siteAvatar ? (
                      <Image
                        src={siteAvatar}
                        alt="头像"
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-7xl font-bold text-[var(--accent-primary)]/30">
                        L
                      </div>
                    )}
                    <div className="home-avatar-scan absolute inset-x-0 top-0" aria-hidden="true" />
                  </div>
                  <span className="home-avatar-corner home-avatar-corner-tl absolute" aria-hidden="true" />
                  <span className="home-avatar-corner home-avatar-corner-tr absolute" aria-hidden="true" />
                  <span className="home-avatar-corner home-avatar-corner-bl absolute" aria-hidden="true" />
                  <span className="home-avatar-corner home-avatar-corner-br absolute" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Module 2：博客全屏 ──────────────────────────────────────────────── */}
        <HomeBlogSection
          posts={featuredPosts}
          total={totalPosts}
          locale={locale}
        />
      </main>

      <Footer />
    </>
  );
}
