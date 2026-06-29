"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTrigger } from "@/components/search/SearchTrigger";

// ----------------------------------------
// 类型定义
// ----------------------------------------

export interface NavDropdownChild {
  href: string;
  label: string;
}

export type NavItem =
  | {
      type: "link";
      href: string;
      label: string;
      external?: boolean;
    }
  | {
      type: "dropdown";
      label: string;
      children: NavDropdownChild[];
    };

interface NavbarClientProps {
  navItems: NavItem[];
  locale: string;
}

// ----------------------------------------
// 组件
// ----------------------------------------

export function NavbarClient({ navItems, locale }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // 当前展开的桌面端 dropdown label
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // 移动端展开的 dropdown label
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  // 用于延迟关闭桌面 dropdown
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const nextLocale = locale === "zh-CN" ? "en" : "zh-CN";
    router.replace(pathname, { locale: nextLocale });
  };

  // ---- 激活判断 ----

  /** 普通链接激活：首页精确，其他前缀 */
  const isLinkActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /** dropdown 激活：任一子项路径匹配时为 true */
  const isDropdownActive = (children: NavDropdownChild[]) =>
    children.some((child) => pathname.startsWith(child.href));

  // ---- 桌面端 dropdown 交互 ----

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  // ---- 渲染：桌面端普通链接 ----

  const renderDesktopLink = (item: Extract<NavItem, { type: "link" }>) => {
    const active = isLinkActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`relative px-3 py-2 text-sm transition-colors duration-[var(--duration-fast)]
                   ${
                     active
                       ? "font-semibold text-[var(--text-primary)]"
                       : "font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                   }`}
      >
        {item.label}
      </Link>
    );
  };

  // ---- 渲染：桌面端 dropdown ----

  const renderDesktopDropdown = (item: Extract<NavItem, { type: "dropdown" }>) => {
    const active = isDropdownActive(item.children);
    const isOpen = openDropdown === item.label;

    return (
      <div
        key={item.label}
        className="relative"
        onMouseEnter={() => handleMouseEnter(item.label)}
        onMouseLeave={handleMouseLeave}
      >
        {/* 触发按钮 */}
        <button
          className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors duration-[var(--duration-fast)]
                     ${
                       active
                         ? "font-semibold text-[var(--text-primary)]"
                         : "font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                     }`}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {item.label}
          {/* 下拉箭头 */}
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-[var(--duration-fast)]
                       ${isOpen ? "rotate-180" : "rotate-0"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 下拉面板 */}
        {isOpen && (
          <div
            className="absolute left-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden
                       rounded-[var(--radius-lg)] border border-[var(--border-subtle)]
                       bg-[var(--bg-primary)] py-1 shadow-lg
                       animate-fade-in"
            role="menu"
          >
            {item.children.map((child) => {
              const childActive = pathname.startsWith(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  role="menuitem"
                  className={`block px-4 py-2 text-sm transition-colors duration-[var(--duration-fast)]
                             ${
                               childActive
                                 ? "bg-[var(--accent-muted)] font-medium text-[var(--accent-primary)]"
                                 : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                             }`}
                  onClick={() => setOpenDropdown(null)}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ---- 渲染：移动端普通链接 ----

  const renderMobileLink = (item: Extract<NavItem, { type: "link" }>) => {
    const active = isLinkActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium
                   transition-colors duration-[var(--duration-fast)]
                   ${
                     active
                       ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                       : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                   }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        {item.label}
      </Link>
    );
  };

  // ---- 渲染：移动端 dropdown ----

  const renderMobileDropdown = (item: Extract<NavItem, { type: "dropdown" }>) => {
    const active = isDropdownActive(item.children);
    const isOpen = openMobileDropdown === item.label;

    return (
      <div key={item.label}>
        {/* 触发行 */}
        <button
          className={`flex w-full items-center justify-between rounded-[var(--radius-md)]
                     px-3 py-2.5 text-sm font-medium
                     transition-colors duration-[var(--duration-fast)]
                     ${
                       active
                         ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                         : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                     }`}
          onClick={() =>
            setOpenMobileDropdown(isOpen ? null : item.label)
          }
          aria-expanded={isOpen}
        >
          <span>{item.label}</span>
          <svg
            className={`h-4 w-4 transition-transform duration-[var(--duration-fast)]
                       ${isOpen ? "rotate-180" : "rotate-0"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 子项列表（inline 展开） */}
        {isOpen && (
          <div className="mt-1 flex flex-col gap-0.5 pl-3">
            {item.children.map((child) => {
              const childActive = pathname.startsWith(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`rounded-[var(--radius-md)] px-3 py-2 text-sm
                             transition-colors duration-[var(--duration-fast)]
                             ${
                               childActive
                                 ? "font-medium text-[var(--accent-primary)]"
                                 : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                             }`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setOpenMobileDropdown(null);
                  }}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ---- 统一渲染入口 ----

  const renderDesktopItem = (item: NavItem) => {
    if (item.type === "dropdown") return renderDesktopDropdown(item);
    return renderDesktopLink(item);
  };

  const renderMobileItem = (item: NavItem) => {
    if (item.type === "dropdown") return renderMobileDropdown(item);
    return renderMobileLink(item);
  };

  // ---- JSX ----

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

          {/* 移动端汉堡按钮 */}
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
