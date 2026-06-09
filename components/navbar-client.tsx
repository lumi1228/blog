"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTrigger } from "@/components/search/SearchTrigger";

interface LinkItem {
  type: "link";
  href: string;
  label: string;
}

interface ColumnsItem {
  type: "columns";
  label: string;
  items: { href: string; label: string }[];
}

export type NavItem = LinkItem | ColumnsItem;

interface NavbarClientProps {
  navItems: NavItem[];
  locale: string;
}

export function NavbarClient({ navItems, locale }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setColumnDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = () => {
    const nextLocale = locale === "zh-CN" ? "en" : "zh-CN";
    router.replace(pathname, { locale: nextLocale });
  };

  const renderDesktopItem = (item: NavItem) => {
    if (item.type === "link") {
      return (
        <Link
          key={item.href}
          href={item.href}
          className="relative px-3 py-2 text-sm font-medium text-[var(--text-secondary)] 
                     transition-colors duration-[var(--duration-fast)]
                     hover:text-[var(--text-primary)]"
        >
          {item.label}
        </Link>
      );
    }

    // type === "columns"
    return (
      <div key="columns" ref={dropdownRef} className="relative">
        <button
          onClick={() => setColumnDropdownOpen(!columnDropdownOpen)}
          className="relative flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] 
                     transition-colors duration-[var(--duration-fast)]
                     hover:text-[var(--text-primary)]"
        >
          {item.label}
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
            {item.items.map((col) => (
              <Link
                key={col.href}
                href={col.href}
                className="block px-4 py-2.5 text-sm text-[var(--text-secondary)]
                           transition-colors duration-[var(--duration-fast)]
                           hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                onClick={() => setColumnDropdownOpen(false)}
              >
                {col.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMobileItem = (item: NavItem) => {
    if (item.type === "link") {
      return (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium 
                     text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)]
                     hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
          onClick={() => setMobileMenuOpen(false)}
        >
          {item.label}
        </Link>
      );
    }

    // type === "columns"
    return (
      <div key="columns">
        <div className="my-1 h-px bg-[var(--border-subtle)]" />
        <Link
          href="/columns"
          className="rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium 
                     text-[var(--text-tertiary)] transition-colors duration-[var(--duration-fast)]
                     hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
          onClick={() => setMobileMenuOpen(false)}
        >
          {item.label}
        </Link>
        {item.items.map((col) => (
          <Link
            key={col.href}
            href={col.href}
            className="rounded-[var(--radius-md)] px-6 py-2 text-sm font-medium 
                       text-[var(--text-tertiary)] transition-colors duration-[var(--duration-fast)]
                       hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            onClick={() => setMobileMenuOpen(false)}
          >
            {col.label}
          </Link>
        ))}
      </div>
    );
  };

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
          {navItems.map(renderDesktopItem)}
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2">
          <SearchTrigger locale={locale as "zh-CN" | "en"} />

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

          <ThemeToggle />

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
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--border-subtle)] px-6 py-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {navItems.map(renderMobileItem)}
          </div>
        </div>
      )}
    </header>
  );
}
