import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Category } from "@/lib/types";

interface BlogTabsProps {
  /** 全部分类，按 sort 顺序 */
  categories: Category[];
  /** 当前激活的分类 slug；null 表示「全部」 */
  activeSlug: string | null;
}

/**
 * 博客列表页顶部的 Tab 切换栏。
 *
 * - 「全部」→ /blog；各分类 → /category/[slug]，均为真实链接（server 渲染、可分享）
 * - 当前 Tab 高亮，并带 aria-current="page"
 * - 窄屏可横向滚动
 */
export function BlogTabs({ categories, activeSlug }: BlogTabsProps) {
  const t = useTranslations("blog");

  const tabs: { key: string; slug: string | null; href: string; label: string }[] = [
    { key: "__all__", slug: null, href: "/blog", label: t("allTab") },
    ...categories.map((cat) => ({
      key: cat.slug,
      slug: cat.slug,
      href: `/category/${cat.slug}`,
      label: cat.name,
    })),
  ];

  return (
    <nav
      aria-label={t("tabsAriaLabel")}
      className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex items-center gap-1.5 whitespace-nowrap">
        {tabs.map((tab) => {
          const active = tab.slug === activeSlug;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center rounded-[var(--radius-full)] px-3.5 py-1.5
                            text-sm transition-all duration-[var(--duration-fast)]
                            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                            focus-visible:outline-[var(--accent-primary)]
                            ${
                              active
                                ? "bg-[var(--accent-primary)] font-semibold text-white shadow-[0_0_16px_var(--glow-primary)]"
                                : "bg-[var(--bg-tertiary)]/50 font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent-primary)]"
                            }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
