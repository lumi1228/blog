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

      {/* 装饰背景 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div
          className="absolute -left-40 top-1/4 h-[560px] w-[560px] rounded-full opacity-[0.10] blur-[130px]"
          style={{ background: "var(--accent-primary)" }}
        />
        <div
          className="absolute right-[-10%] bottom-[5%] h-[460px] w-[460px] rounded-full opacity-[0.08] blur-[120px]"
          style={{ background: "var(--accent-secondary)" }}
        />
        <div
          className="absolute left-1/2 top-0 h-[300px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: "var(--accent-primary)" }}
        />
        {/* 点阵纹理 */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--text-secondary) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Header：左侧标题 + 右上角「查看全部」 */}
      <div className="relative mx-auto w-full max-w-[1200px] flex-shrink-0 px-6 pt-12 pb-2 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
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

          {/* 右上角：知识库数量 + 查看全部 */}
          <div className="flex items-center gap-3">
            {/* 数量指示 */}
            <span className="inline-flex items-baseline gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)]/60 px-3 py-2 backdrop-blur-sm">
              <span
                className="text-lg font-bold leading-none text-[var(--accent-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {totalCount}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {t("home.docsSection.title")}
              </span>
            </span>

            {/* 主操作：查看全部知识库 */}
            <DocsGateLink
              href={`/${locale}/docs`}
              target="_blank"
              className="group inline-flex items-center gap-1.5 rounded-[var(--radius-md)]
                         border border-[var(--accent-primary)]/20 bg-[var(--accent-muted)]
                         px-4 py-2 text-sm font-semibold text-[var(--accent-primary)]
                         transition-all duration-[var(--duration-fast)]
                         hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)]
                         hover:border-transparent hover:shadow-[0_0_20px_var(--glow-primary)]"
            >
              {t("home.docsSection.exploreAll")}
              <svg
                className="h-4 w-4 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5"
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
      </div>

      {/* Body：卡片区，在剩余高度内垂直居中 */}
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-6 pb-12 pt-6">
        {count === 0 ? (
          /* 空状态 */
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 py-12">
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
          <div
            className={
              count === 1
                ? "grid grid-cols-1 gap-6"
                : count === 2
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2"
                  : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
        )}
      </div>
    </section>
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
          className="relative h-[176px] flex-shrink-0 overflow-hidden
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
