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
        {/* Hero 区域 */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
              style={{ background: "var(--glow-primary)" }}
            />
          </div>

          <div className="relative mx-auto max-w-[900px] px-6 py-16 sm:py-24">
            <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
              {/* 头像 */}
              <div className="shrink-0 animate-fade-in-up stagger-1">
                <div
                  className="relative flex h-28 w-28 items-center justify-center rounded-[var(--radius-full)] 
                             border-2 border-[var(--accent-primary)]/30 sm:h-32 sm:w-32"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-muted), var(--bg-tertiary))",
                    boxShadow: "var(--shadow-glow-accent)",
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
                      className="text-4xl font-bold text-[var(--accent-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {aboutConfig.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* 介绍文字 */}
              <div className="flex-1">
                <div className="mb-3 animate-fade-in-up stagger-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-[var(--accent-primary)]">
                    {t("greeting")}
                  </span>
                </div>
                <h1
                  className="mb-3 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl animate-fade-in-up stagger-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {aboutConfig.name}
                </h1>
                <p className="mb-4 text-lg text-[var(--text-secondary)] animate-fade-in-up stagger-4">
                  {aboutConfig.title}
                </p>
                <p className="text-sm italic text-[var(--text-tertiary)] animate-fade-in-up stagger-5">
                  &ldquo;{aboutConfig.tagline}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 内容区域 */}
        <div className="mx-auto max-w-[900px] space-y-16 px-6 py-12 sm:py-16">
          <section>
            <SectionTitle number="01" title={t("sectionAbout")} />
            
            {/* 个人信息卡片 */}
            <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-tertiary)]">英文名</div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{aboutConfig.profile.englishName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-tertiary)]">昵称</div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{aboutConfig.profile.nickname}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-tertiary)]">中文名</div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{aboutConfig.profile.chineseName}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-base leading-[1.75] text-[var(--text-secondary)]">
              {aboutConfig.intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle number="02" title={t("sectionSkills")} />
            <div className="grid gap-6 sm:grid-cols-2">
              {Object.entries(aboutConfig.skills).map(([category, data]) => (
                <div
                  key={category}
                  className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5"
                >
                  <h3
                    className="mb-3 text-sm font-semibold text-[var(--text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {category}
                  </h3>
                  <p className="mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {data.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] 
                                   bg-[var(--bg-primary)] px-2.5 py-1 text-xs 
                                   text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)]
                                   hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-primary)]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle number="03" title={t("sectionCollaboration")} />
            <div className="space-y-6">
              <p className="text-base leading-[1.75] text-[var(--text-secondary)]">
                {aboutConfig.collaboration.intro}
              </p>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                  你可以从我这里获得：
                </h3>
                <div className="space-y-3">
                  {aboutConfig.collaboration.offers.map((offer) => (
                    <div
                      key={offer.title}
                      className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4
                                 transition-all duration-[var(--duration-fast)] hover:border-[var(--accent-primary)]/30"
                    >
                      <h4 className="mb-1 text-sm font-medium text-[var(--text-primary)]">
                        {offer.title}
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {offer.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle number="04" title={t("sectionContact")} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {aboutConfig.social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-[var(--radius-lg)]
                             border border-[var(--border-subtle)] bg-[var(--bg-secondary)] 
                             px-4 py-3 transition-all duration-[var(--duration-fast)]
                             hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)]"
                >
                  <div>
                    <div className="text-xs text-[var(--text-tertiary)]">{item.label}</div>
                    <div
                      className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.handle}
                    </div>
                  </div>
                  <svg
                    className="h-4 w-4 text-[var(--text-tertiary)] transition-all duration-[var(--duration-fast)]
                               group-hover:translate-x-0.5 group-hover:text-[var(--accent-primary)]"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
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
    <div className="mb-6 flex items-baseline gap-3">
      <span
        className="text-xs font-medium text-[var(--accent-primary)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {number}
      </span>
      <h2
        className="text-2xl font-semibold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div
        className="h-px flex-1"
        style={{ background: "linear-gradient(to right, var(--border-default), transparent)" }}
      />
    </div>
  );
}
