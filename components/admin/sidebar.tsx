"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "@/components/theme-provider";

const navItems = [
  {
    label: "概览",
    href: "/admin/dashboard",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "文章",
    href: "/admin/posts",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: "分类",
    href: "/admin/categories",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
  },
  {
    label: "标签",
    href: "/admin/tags",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    label: "知识库",
    href: "/admin/columns",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    label: "简历",
    href: "/admin/resume",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l2.25 2.25L15 13.5m-9 5.25V18a2.25 2.25 0 012.25-2.25H9m4.5-13.5H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: "主站头像",
    href: "/admin/site-avatars",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z" />
      </svg>
    ),
  },
  {
    label: "访问控制",
    href: "/admin/access-control",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
];

interface AdminSidebarProps {
  userEmail: string;
}

/**
 * 渲染后台导航并处理管理员退出登录。
 * --- @ty.aicoding@ ---
 */
export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;

    /**
     * 点击账号区域外部时关闭弹出菜单。
     * --- @ty.aicoding@ ---
     */
    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    /**
     * 按 Escape 键关闭账号弹出菜单。
     * --- @ty.aicoding@ ---
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  /**
   * 退出后台登录并返回登录页。
   * --- @ty.aicoding@ ---
   */
  const handleLogout = async () => {
    setAccountMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const userInitial = (userEmail.trim()[0] || "A").toUpperCase();

  return (
    <aside className="flex w-56 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[var(--border-subtle)] px-5">
        <Link
          href="/admin/dashboard"
          className="text-lg font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="text-[var(--accent-primary)]">L</span>umi
          <span className="ml-2 text-xs font-normal text-[var(--text-tertiary)]">Admin</span>
        </Link>
      </div>

      {/* 导航 */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium
                         transition-colors duration-[var(--duration-fast)]
                         ${
                           isActive
                             ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                             : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                         }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 底部账号入口 */}
      <div ref={accountMenuRef} className="relative border-t border-[var(--border-subtle)] p-3">
        {accountMenuOpen && (
          <div
            id="admin-account-menu"
            role="menu"
            aria-label="账号操作"
            className="absolute bottom-[calc(100%+8px)] left-3 right-3 z-50 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-2 shadow-[var(--shadow-lg)] animate-fade-in"
          >
            <div className="flex items-center justify-between gap-2 px-2 py-2">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 15V21m9-9h-1.5M4.5 12H3m15.364 6.364-1.061-1.061M6.697 6.697 5.636 5.636m12.728 0-1.061 1.061M6.697 17.303l-1.061 1.061M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                </svg>
                <span>外观</span>
              </div>
              <div className="flex rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] p-1" aria-label="外观模式">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={resolvedTheme === "light"}
                  onClick={() => setTheme("light")}
                  className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium transition-all duration-[var(--duration-fast)] ${
                    resolvedTheme === "light"
                      ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  浅色
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={resolvedTheme === "dark"}
                  onClick={() => setTheme("dark")}
                  className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium transition-all duration-[var(--duration-fast)] ${
                    resolvedTheme === "dark"
                      ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  深色
                </button>
              </div>
            </div>

            <div className="my-1 border-t border-[var(--border-subtle)]" />

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 text-sm text-[var(--text-secondary)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--error)]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              退出登录
            </button>
          </div>
        )}

        <button
          type="button"
          aria-label={accountMenuOpen ? "关闭账号菜单" : "打开账号菜单"}
          aria-haspopup="menu"
          aria-controls="admin-account-menu"
          aria-expanded={accountMenuOpen}
          onClick={() => setAccountMenuOpen((open) => !open)}
          className={`flex h-11 w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 text-left transition-colors duration-[var(--duration-fast)] ${
            accountMenuOpen
              ? "bg-[var(--bg-tertiary)]"
              : "hover:bg-[var(--bg-tertiary)]"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-[var(--accent-muted)] text-sm font-semibold text-[var(--accent-primary)]">
            {userInitial}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-[var(--text-secondary)]">{userEmail}</span>
          <svg
            className={`h-4 w-4 shrink-0 text-[var(--text-tertiary)] transition-transform duration-[var(--duration-fast)] ${
              accountMenuOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
