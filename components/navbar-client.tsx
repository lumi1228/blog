"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTrigger } from "@/components/search/SearchTrigger";

interface NavLink {
  href: string;
  label: string;
}

interface NavbarClientProps {
  navLinks: NavLink[];
  locale: string;
  columnItems?: NavLink[];
}

export function NavbarClient({ navLinks, locale, columnItems = [] }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setColumnDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 切换语言
  const switchLocale = () => {
    const nextLocale = locale === "zh-CN" ? "en" : "zh-CN";
    router.replace(pathname, { locale: nextLocale });
  };

  // 专栏标签
  const columnsLabel = locale === "zh-CN" ? "专栏" : "Columns";
  const hasColumns = columnItems.length > 0;

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)]
                 bg-[var(--bg-primary)]/85 backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-[var(--text-primary)] 
                     transition-colors duration-[var(--duration-fast)] hover:text-[var(--accent-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="text-[var(--accent-primary)]">L</span>umi
        </Link>

        {/* 桌面端导航 */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-3 py-2 text-sm font-medium text-[var(--text-secondary)] 
                         transition-colors duration-[var(--duration-fast)]
                         hover:text-[var(--text-primary)]"
            >
              {link.label}
            </Link>
          ))}

          {/* 专栏下拉菜单 */}
          {hasColumns && (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setColumnDropdownOpen(!columnDropdownOpen)}
                className="relative flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] 
                           transition-colors duration-[var(--duration-fast)]
                           hover:text-[var(--text-primary)]"
              >
                {columnsLabel}
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-[var(--duration-fast)] ${
                    columnDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {columnDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-1 min-w-[160px] rounded-[var(--radius-md)] 
                              border border-[var(--border-subtle)] bg-[var(--bg-primary)] 
                              shadow-lg shadow-[var(--shadow-color)] animate-fade-in"
                >
                  {/* 专栏列表入口 */}
                  <Link
                    href="/columns"
                    className="block px-4 py-2.5 text-sm text-[var(--text-secondary)]
                               transition-colors duration-[var(--duration-fast)]
                               hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]
                               border-b border-[var(--border-subtle)]"
                    onClick={() => setColumnDropdownOpen(false)}
                  >
                    {locale === "zh-CN" ? "所有专栏" : "All Columns"}
                  </Link>
                  {columnItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-[var(--text-secondary)]
                                 transition-colors duration-[var(--duration-fast)]
                                 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                      onClick={() => setColumnDropdownOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2">
          {/* 搜索按钮 */}
          <SearchTrigger locale={locale as "zh-CN" | "en"} />

          {/* 语言切换按钮 */}
          <button
            onClick={switchLocale}
            className="flex h-9 items-center justify-center rounded-[var(--radius-md)] px-2
                       text-xs font-medium text-[var(--text-secondary)] 
                       transition-all duration-[var(--duration-fast)]
                       hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            title={locale === "zh-CN" ? "Switch to English" : "切换到中文"}
          >
            {locale === "zh-CN" ? "EN" : "中"}
          </button>

          {/* 主题切换 */}
          <ThemeToggle />

          {/* 移动端菜单按钮 */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]
                       text-[var(--text-secondary)] transition-all duration-[var(--duration-fast)]
                       hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="菜单"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--border-subtle)] px-6 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium 
                           text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)]
                           hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* 移动端专栏 */}
            {hasColumns && (
              <>
                <div className="my-1 h-px bg-[var(--border-subtle)]" />
                <Link
                  href="/columns"
                  className="rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium 
                             text-[var(--text-tertiary)] transition-colors duration-[var(--duration-fast)]
                             hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {columnsLabel}
                </Link>
                {columnItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[var(--radius-md)] px-6 py-2 text-sm font-medium 
                               text-[var(--text-tertiary)] transition-colors duration-[var(--duration-fast)]
                               hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
