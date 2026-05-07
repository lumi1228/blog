import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { aboutConfig } from "@/config/about";

export const metadata: Metadata = {
  title: `关于 | ${aboutConfig.name}`,
  description: aboutConfig.tagline,
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero 区域 */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
          {/* 背景装饰 */}
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
                    background:
                      "linear-gradient(135deg, var(--accent-muted), var(--bg-tertiary))",
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
                    Hi, I&apos;m
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
          {/* 关于我 */}
          <section>
            <SectionTitle number="01" title="关于我" />
            <div className="space-y-4 text-base leading-[1.75] text-[var(--text-secondary)]">
              {aboutConfig.intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* 技术栈 */}
          <section>
            <SectionTitle number="02" title="技术栈" />
            <div className="grid gap-6 sm:grid-cols-2">
              {Object.entries(aboutConfig.skills).map(([category, items]) => (
                <div
                  key={category}
                  className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] 
                             bg-[var(--bg-secondary)] p-5"
                >
                  <h3
                    className="mb-3 text-sm font-semibold text-[var(--text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] 
                                   bg-[var(--bg-primary)] px-2.5 py-1 text-xs 
                                   text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)]
                                   hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-primary)]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 工作经历 */}
          <section>
            <SectionTitle number="03" title="成长轨迹" />
            <div className="relative">
              {/* 时间线竖线 */}
              <div
                className="absolute left-[7px] top-2 bottom-2 w-px"
                style={{
                  background:
                    "linear-gradient(to bottom, var(--accent-primary), transparent)",
                }}
              />
              <div className="space-y-8">
                {aboutConfig.timeline.map((item) => (
                  <div key={item.year} className="relative pl-8">
                    {/* 圆点 */}
                    <div
                      className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 
                                 border-[var(--accent-primary)] bg-[var(--bg-primary)]"
                      style={{ boxShadow: "var(--shadow-glow-accent)" }}
                    />
                    <div
                      className="mb-1 text-xs font-medium text-[var(--accent-primary)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.year}
                    </div>
                    <h3
                      className="mb-1 text-lg font-semibold text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 联系方式 */}
          <section>
            <SectionTitle number="04" title="联系我" />
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
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {item.label}
                    </div>
                    <div
                      className="text-sm font-medium text-[var(--text-primary)] 
                                 group-hover:text-[var(--accent-primary)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.handle}
                    </div>
                  </div>
                  <svg
                    className="h-4 w-4 text-[var(--text-tertiary)] transition-all duration-[var(--duration-fast)]
                               group-hover:translate-x-0.5 group-hover:text-[var(--accent-primary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
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

/**
 * 带编号的章节标题
 */
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
        style={{
          background:
            "linear-gradient(to right, var(--border-default), transparent)",
        }}
      />
    </div>
  );
}
