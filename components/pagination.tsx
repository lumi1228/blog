"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const t = useTranslations("pagination");
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  // 生成页码数组，最多显示 5 个页码按钮
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 始终显示第一页
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // 当前页附近的页码
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // 始终显示最后一页
      pages.push(totalPages);
    }

    return pages;
  };

  const buildHref = (page: number): string => {
    if (page === 1) return pathname;
    return `${pathname}?page=${page}`;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      {/* 上一页 */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-default)]
                     px-3 py-2 text-sm font-medium text-[var(--text-secondary)]
                     transition-all duration-[var(--duration-fast)]
                     hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
          aria-label={t("prev")}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">{t("prev")}</span>
        </Link>
      ) : (
        <span
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)]
                     px-3 py-2 text-sm font-medium text-[var(--text-tertiary)] cursor-not-allowed"
          aria-disabled="true"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">{t("prev")}</span>
        </span>
      )}

      {/* 页码 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-[var(--text-tertiary)]"
            >
              ···
            </span>
          ) : page === currentPage ? (
            <span
              key={page}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]
                         bg-[var(--accent-primary)] text-sm font-medium text-[var(--bg-primary)]"
              aria-current="page"
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={buildHref(page)}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]
                         border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)]
                         transition-all duration-[var(--duration-fast)]
                         hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* 下一页 */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-default)]
                     px-3 py-2 text-sm font-medium text-[var(--text-secondary)]
                     transition-all duration-[var(--duration-fast)]
                     hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
          aria-label={t("next")}
        >
          <span className="hidden sm:inline">{t("next")}</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)]
                     px-3 py-2 text-sm font-medium text-[var(--text-tertiary)] cursor-not-allowed"
          aria-disabled="true"
        >
          <span className="hidden sm:inline">{t("next")}</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  );
}
