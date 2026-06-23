import Link from "next/link";
import { useTranslations } from "next-intl";

interface ColumnCardProps {
  column: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    coverImage: string | null;
  };
  locale: string;
  index?: number;
}

export function ColumnCard({ column, locale, index = 0 }: ColumnCardProps) {
  const t = useTranslations();

  return (
    <Link
      href={`/${locale}/columns/${column.slug}`}
      className="group frosted-glass relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] 
                 transition-all duration-[var(--duration-normal)]
                 hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)]
                 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 封面图 */}
      {column.coverImage && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)]">
          <img
            src={column.coverImage}
            alt={column.title}
            className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] 
                       group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/90 via-[#030712]/20 to-transparent" />
        </div>
      )}

      {/* 内容区 */}
      <div className="flex flex-1 flex-col p-6 relative">
        <h3
          className="mb-2 text-lg font-bold text-[var(--text-primary)] 
                     transition-colors duration-[var(--duration-fast)]
                     group-hover:text-[var(--accent-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {column.title}
        </h3>

        {column.description && (
          <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2">
            {column.description}
          </p>
        )}

        {/* 底部操作：冰晶箭头 */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
          <span className="text-xs font-semibold text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] transition-colors">
            {t("home.exploreColumn")}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] group-hover:border-[var(--accent-primary)]/30 group-hover:bg-[var(--accent-primary)]/10 transition-all">
            <svg
              className="h-4 w-4 text-[var(--text-tertiary)] transition-transform 
                         duration-[var(--duration-fast)] group-hover:translate-x-0.5 
                         group-hover:text-[var(--accent-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
