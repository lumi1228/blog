import { useTranslations } from "next-intl";
import type { Column } from "@/lib/types";
import { DocsGateLink } from "@/components/docs/docs-gate-link";

interface HomeDocsSectionProps {
  columns: Column[];
  hasMore: boolean;
  totalCount: number;
  locale: string;
}

export function HomeDocsSection({
  columns,
  hasMore,
  totalCount,
  locale,
}: HomeDocsSectionProps) {
  const t = useTranslations();
  const count = columns.length;

  return (
    <section
      id="knowledge"
      className="relative flex flex-col overflow-hidden min-h-[calc(100dvh-4rem)]"
      style={{
        // 抬升色调渐变：中段使用更亮的 bg-tertiary，与上下两屏的 bg-primary 形成区分
        background:
          "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-tertiary) 22%, var(--bg-tertiary) 78%, var(--bg-primary) 100%)",
      }}
    >
      {/* 顶部分隔光带：明确上边界 */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
          opacity: 0.35,
        }}
      />

      {/* 装饰背景（强化层） */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* 主光晕 */}
        <div
          className="absolute -left-40 top-1/4 h-[560px] w-[560px] rounded-full opacity-[0.10] blur-[130px]"
          style={{ background: "var(--accent-primary)" }}
        />
        {/* 次光晕 */}
        <div
          className="absolute right-[-10%] bottom-[5%] h-[460px] w-[460px] rounded-full opacity-[0.08] blur-[120px]"
          style={{ background: "var(--accent-secondary)" }}
        />
        {/* 顶部柔光，强化与上一屏的色彩落差 */}
        <div
          className="absolute left-1/2 top-0 h-[300px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: "var(--accent-primary)" }}
        />
        {/* 点阵纹理（提高可见度） */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--text-secondary) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* 细网格线，营造"知识结构"的几何氛围 */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(var(--accent-primary) 1px, transparent 1px), linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)",
            backgroundSize: "120px 120px",
          }}
        />
      </div>

      {/* Zone 1：Header */}
      <div className="relative mx-auto w-full max-w-[1200px] flex-shrink-0 px-6 pt-12 pb-6 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            {/* eyebrow 徽章 */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--accent-primary)]/20 bg-[var(--accent-muted)] px-3.5 py-1 text-xs font-semibold tracking-wider text-[var(--accent-primary)]">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              {t("home.docsSection.title")}
            </div>
            <h2
              className="text-2xl font-bold leading-tight text-[var(--text-primary)] sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("home.docsSection.subtitle")}
            </h2>
          </div>

          {/* 统计徽章 */}
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)]/60 px-4 py-2 backdrop-blur-sm">
            <span
              className="text-2xl font-bold leading-none text-[var(--accent-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {totalCount}
            </span>
            <span className="text-xs leading-tight text-[var(--text-tertiary)]">
              {t("home.docsSection.title")}
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2：Cards + Highlights（flex-1，撑满剩余高度） */}
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-6 pb-6">
        {count === 0 ? (
          /* 空状态 */
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-muted)] border border-[var(--accent-primary)]/20">
              <svg
                className="h-7 w-7 text-[var(--accent-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">
              {t("home.docsSection.empty")}
            </p>
          </div>
        ) : (
          <>
            {/* 卡片区 */}
            <div
              className={
                count === 1
                  ? "grid grid-cols-1 gap-5"
                  : count === 2
                    ? "grid grid-cols-1 gap-5 sm:grid-cols-2"
                    : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              }
            >
              {columns.map((column, index) => (
                <DocsCard
                  key={column.id}
                  column={column}
                  locale={locale}
                  index={index}
                />
              ))}
            </div>

            {/* 特色亮点带（常驻，填充并丰富中屏内容） */}
            <DocsHighlights />
          </>
        )}
      </div>

      {/* Zone 3：Stats Footer */}
      <div className="relative mx-auto w-full max-w-[1200px] flex-shrink-0 border-t border-[var(--border-default)] px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-[var(--text-tertiary)]">
            {t("home.docsSection.docCount", { count: totalCount })}
          </span>
          <DocsGateLink
            href={`/${locale}/docs`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)]
                       bg-[var(--accent-muted)] px-4 py-2 text-xs font-semibold
                       text-[var(--accent-primary)] border border-[var(--accent-primary)]/20
                       transition-all duration-[var(--duration-fast)]
                       hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)]
                       hover:border-transparent hover:shadow-[0_0_20px_var(--glow-primary)]"
          >
            {t("home.docsSection.exploreAll")}
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </DocsGateLink>
        </div>
      </div>
    </section>
  );
}

// ─── 特色亮点带 ───────────────────────────────────────────────────────────────

function DocsHighlights() {
  const t = useTranslations();

  const items = [
    {
      title: t("home.docsSection.highlight1Title"),
      desc: t("home.docsSection.highlight1Desc"),
      path: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      title: t("home.docsSection.highlight2Title"),
      desc: t("home.docsSection.highlight2Desc"),
      path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      title: t("home.docsSection.highlight3Title"),
      desc: t("home.docsSection.highlight3Desc"),
      path: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    },
  ];

  return (
    <div className="flex flex-1 flex-col justify-center">
      {/* 分隔标题 */}
      <div className="mb-5 flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
          {t("home.docsSection.highlightsTitle")}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--accent-primary)]/25 to-transparent" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.title}
            className="group frosted-glass relative overflow-hidden rounded-[var(--radius-lg)] p-5
                       animate-fade-in-up transition-all duration-[var(--duration-normal)]
                       hover:border-[var(--accent-primary)]/30"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            {/* 序号水印 */}
            <span
              className="pointer-events-none absolute -right-2 -top-3 text-6xl font-bold text-[var(--accent-primary)]/[0.06] select-none"
              style={{ fontFamily: "var(--font-display)" }}
              aria-hidden="true"
            >
              0{index + 1}
            </span>

            <div className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-muted)] border border-[var(--accent-primary)]/20 transition-colors duration-[var(--duration-fast)] group-hover:bg-[var(--accent-primary)]/15">
              <svg
                className="h-5 w-5 text-[var(--accent-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
              </svg>
            </div>

            <h3
              className="relative mb-1.5 text-sm font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {item.title}
            </h3>
            <p className="relative text-xs leading-relaxed text-[var(--text-tertiary)]">
              {item.desc}
            </p>

            {/* 底部流光线 */}
            <div
              className="absolute bottom-0 left-5 right-5 h-[2px] origin-left scale-x-0
                         transition-transform duration-[var(--duration-normal)] group-hover:scale-x-100"
              style={{
                background:
                  "linear-gradient(to right, var(--accent-primary), transparent)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 内联卡片 ─────────────────────────────────────────────────────────────────

function DocsCard({
  column,
  locale,
  index,
  className = "",
}: {
  column: Column;
  locale: string;
  index: number;
  className?: string;
}) {
  const t = useTranslations();

  return (
    <DocsGateLink
      href={`/${locale}/docs/${column.slug}`}
      target="_blank"
      className={`group frosted-glass relative flex flex-col overflow-hidden
                 rounded-[var(--radius-lg)] animate-fade-in-up isolate
                 transition-all duration-[var(--duration-normal)]
                 hover:border-[var(--accent-primary)]/40
                 hover:shadow-[var(--shadow-glow-accent)] ${className}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 顶部 hover 高亮线 */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r
                    from-transparent via-[var(--accent-primary)]/60 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* 封面图 */}
      {column.coverImage && (
        <div
          className="relative h-[160px] flex-shrink-0 overflow-hidden
                      border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]"
        >
          <img
            src={column.coverImage}
            alt={column.title}
            className="h-full w-full object-cover transition-transform
                       duration-[var(--duration-slow)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/60 via-transparent to-transparent" />
        </div>
      )}

      {/* 内容区 */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3
          className="mb-2.5 text-lg font-bold text-[var(--text-primary)]
                     transition-all duration-[var(--duration-fast)]
                     group-hover:text-[var(--accent-primary)] group-hover:translate-x-0.5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {column.title}
        </h3>

        {column.description && (
          <p
            className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-3
                        transition-colors duration-[var(--duration-fast)]
                        group-hover:text-[var(--text-primary)]/80"
          >
            {column.description}
          </p>
        )}

        {/* 底部操作行 */}
        <div
          className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3
                      group-hover:border-[var(--accent-primary)]/30 transition-colors duration-500"
        >
          <span
            className="text-xs font-medium text-[var(--text-tertiary)]
                       group-hover:text-[var(--accent-primary)] transition-colors
                       duration-[var(--duration-fast)] group-hover:translate-x-0.5"
          >
            {t("home.exploreColumn")}
          </span>
          <div
            className="relative flex h-8 w-8 items-center justify-center rounded-full
                        border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/60
                        transition-all duration-[var(--duration-fast)]
                        group-hover:border-[var(--accent-primary)]/50
                        group-hover:bg-[var(--accent-primary)]/10
                        group-hover:scale-110"
          >
            <div
              className="absolute inset-0 rounded-full bg-[var(--accent-primary)]/20
                          opacity-0 group-hover:opacity-100 animate-ping"
              style={{ animationDuration: "1.5s" }}
            />
            <svg
              className="relative z-10 h-4 w-4 text-[var(--text-tertiary)]
                         transition-all duration-[var(--duration-fast)]
                         group-hover:translate-x-0.5 group-hover:text-[var(--accent-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>

      {/* 底部流光线 */}
      <div
        className="absolute bottom-0 left-5 right-5 h-[2px] origin-left scale-x-0
                   transition-transform duration-[var(--duration-normal)] group-hover:scale-x-100"
        style={{ background: "linear-gradient(to right, var(--accent-primary), transparent)" }}
      />
    </DocsGateLink>
  );
}
