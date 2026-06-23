import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { aboutConfig } from "@/config/about";
import { buildAlternates, SITE_NAME } from "@/lib/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  const isZh = locale === "zh-CN";
  const title = isZh ? `关于 | ${SITE_NAME}` : `About | ${SITE_NAME}`;
  const description = aboutConfig.tagline;
  const ogLocale = isZh ? "zh_CN" : "en_US";

  const { canonical, languages } = buildAlternates("/about", "/en/about");

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      title,
      description,
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations("about");

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero 区域 - 极光名片 */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] py-20 sm:py-32">
          {/* 极简紫色光晕背景 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* 主光晕 - 中央偏上 */}
            <div
              className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-20 blur-[130px] animate-aurora-1"
              style={{ background: "var(--accent-primary)" }}
            />
            {/* 次光晕 - 右侧 */}
            <div
              className="absolute right-0 bottom-1/4 h-[400px] w-[400px] rounded-full opacity-15 blur-[110px] animate-aurora-2"
              style={{ background: "var(--accent-primary)" }}
            />
          </div>

          <div className="relative mx-auto max-w-[1000px] px-6">
            <div className="flex flex-col items-center text-center">
              {/* 大头像 */}
              <div className="mb-8 animate-fade-in-up stagger-1">
                <div
                  className="relative flex h-36 w-36 items-center justify-center rounded-[var(--radius-full)] 
                             border-4 border-[var(--accent-primary)]/20 sm:h-40 sm:w-40
                             transition-all duration-[var(--duration-slow)]
                             hover:border-[var(--accent-primary)]/40 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-muted), var(--bg-tertiary))",
                    boxShadow: "0 0 40px var(--glow-primary)",
                  }}
                >
                  {aboutConfig.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={aboutConfig.avatar}
                      alt={aboutConfig.name}
                      className="h-full w-full rounded-[var(--radius-full)] object-cover"
                    />
                  ) : (
                    <span
                      className="text-6xl font-extrabold text-[var(--accent-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {aboutConfig.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {/* 呼吸光环 */}
                  <div className="absolute inset-0 rounded-[var(--radius-full)] border-2 border-[var(--accent-primary)]/30 animate-ping" />
                </div>
              </div>

              {/* 名字与标题 */}
              <div className="mb-6 animate-fade-in-up stagger-2">
                <div className="mb-2 flex items-center justify-center gap-3">
                  <h1
                    className="text-5xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-6xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {aboutConfig.name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--text-tertiary)]">
                  <span>{aboutConfig.profile.nickname}</span>
                  <span>·</span>
                  <span>{aboutConfig.profile.chineseName}</span>
                </div>
              </div>

              {/* 关键词标签云 */}
              <div className="mb-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up stagger-3">
                {["前端工程师", "Next.js 全栈", "AI Coding", "React", "TypeScript"].map((tag, i) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--accent-muted)] px-4 py-1.5 text-sm font-semibold text-[var(--accent-primary)]
                               border border-[var(--accent-primary)]/10
                               transition-all duration-[var(--duration-fast)]
                               hover:bg-[var(--accent-primary)] hover:text-[#030712] hover:scale-105"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Tagline */}
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] animate-fade-in-up stagger-4">
                {aboutConfig.tagline}
              </p>
            </div>
          </div>
        </section>

        {/* 内容区域 */}
        <div className="mx-auto max-w-[1100px] space-y-20 px-6 py-16 sm:py-24">
          {/* 技能矩阵 - 冰晶卡片 */}
          <section>
            <SectionTitle number="01" title={t("sectionSkills")} />
            <div className="grid gap-5 sm:grid-cols-2">
              {Object.entries(aboutConfig.skills).map(([category, data], index) => (
                <div
                  key={category}
                  className="frosted-glass group relative overflow-hidden rounded-[var(--radius-lg)] p-6
                             transition-all duration-[var(--duration-normal)]
                             hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)]
                             animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* 装饰性序号 */}
                  <div className="absolute right-4 top-4 text-6xl font-extrabold text-[var(--border-subtle)] opacity-50"
                       style={{ fontFamily: "var(--font-display)" }}>
                    0{index + 1}
                  </div>

                  <h3
                    className="relative mb-3 text-lg font-bold text-[var(--text-primary)]
                               transition-colors duration-[var(--duration-fast)]
                               group-hover:text-[var(--accent-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {category}
                  </h3>
                  <p className="relative mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {data.description}
                  </p>
                  <div className="relative flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] 
                                   bg-[var(--bg-primary)]/40 px-2.5 py-1 text-xs font-medium
                                   text-[var(--text-secondary)] transition-all duration-[var(--duration-fast)]
                                   hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)] 
                                   hover:bg-[var(--bg-primary)]/70 hover:scale-105"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Hover 时的极光流光底线 */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-[2px] origin-left scale-x-0 
                               transition-transform duration-[var(--duration-normal)]
                               group-hover:scale-x-100"
                    style={{
                      background: "linear-gradient(to right, var(--accent-primary), var(--accent-secondary), transparent)",
                    }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 合作服务 - 极光图标卡片 */}
          <section>
            <SectionTitle number="02" title={t("sectionCollaboration")} />
            <p className="mb-8 text-center text-base leading-relaxed text-[var(--text-secondary)] max-w-3xl mx-auto">
              {aboutConfig.collaboration.intro}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {aboutConfig.collaboration.offers.map((offer, index) => {
                const icons = [
                  // 项目合作
                  <svg key="project" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>,
                  // Next.js 全栈
                  <svg key="nextjs" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>,
                  // AI 实践
                  <svg key="ai" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>,
                  // 前端架构
                  <svg key="architecture" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>,
                  // 方案探讨
                  <svg key="discussion" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                ];

                return (
                  <div
                    key={offer.title}
                    className="frosted-glass group relative overflow-hidden rounded-[var(--radius-lg)] p-5
                               transition-all duration-[var(--duration-normal)]
                               hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)]
                               animate-fade-in-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {/* 图标容器 - 统一紫色 */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)]
                                    bg-[var(--accent-muted)] text-[var(--accent-primary)]
                                    border border-[var(--accent-primary)]/20
                                    transition-all duration-[var(--duration-normal)]
                                    group-hover:bg-[var(--accent-primary)] group-hover:text-[var(--bg-primary)] 
                                    group-hover:scale-110 group-hover:rotate-6">
                      {icons[index % icons.length]}
                    </div>

                    <h4 className="mb-2 text-base font-semibold text-[var(--text-primary)]
                                   transition-colors duration-[var(--duration-fast)]
                                   group-hover:text-[var(--accent-primary)]">
                      {offer.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {offer.description}
                    </p>

                    {/* 装饰性光晕 */}
                    <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full opacity-0 blur-[40px]
                                    transition-opacity duration-[var(--duration-slow)]
                                    group-hover:opacity-30"
                         style={{ background: "var(--accent-primary)" }} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* 联系方式 - 冰晶悬浮卡片 */}
          <section>
            <SectionTitle number="03" title={t("sectionContact")} />
            <div className="grid gap-4 sm:grid-cols-2">
              {aboutConfig.social.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="frosted-glass group relative flex items-center justify-between rounded-[var(--radius-lg)]
                             p-6 transition-all duration-[var(--duration-normal)]
                             hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)]
                             hover:scale-[1.02] animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
                      {item.label}
                    </div>
                    <div
                      className="text-base font-medium text-[var(--text-primary)] transition-colors
                                 group-hover:text-[var(--accent-primary)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.handle}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full 
                                  bg-[var(--accent-muted)] text-[var(--accent-primary)]
                                  transition-all duration-[var(--duration-normal)]
                                  group-hover:bg-[var(--accent-primary)] group-hover:text-[#030712] 
                                  group-hover:scale-110 group-hover:rotate-12">
                    <svg
                      className="h-5 w-5"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>

                  {/* Hover 极光流光边框 */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-[2px] origin-left scale-x-0 
                               transition-transform duration-[var(--duration-normal)]
                               group-hover:scale-x-100"
                    style={{
                      background: "linear-gradient(to right, var(--accent-primary), transparent)",
                    }}
                  />
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-10 flex items-center gap-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)]
                   bg-[var(--accent-primary)] text-lg font-extrabold text-[var(--bg-primary)] 
                   shadow-[0_0_30px_var(--glow-primary)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {number}
      </div>
      <h2
        className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div
        className="h-[2px] flex-1"
        style={{ background: "linear-gradient(to right, var(--accent-primary), transparent)" }}
      />
    </div>
  );
}
