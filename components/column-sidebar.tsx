"use client";

import Link from "next/link";
import { useState } from "react";
import type { ColumnChapter, Post } from "@/lib/types";

interface ColumnSidebarProps {
  columnSlug: string;
  columnTitle: string;
  chapters: (ColumnChapter & { posts: Post[] })[];
  currentPostSlug: string;
}

export function ColumnSidebar({
  columnSlug,
  columnTitle,
  chapters,
  currentPostSlug,
}: ColumnSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all duration-[var(--duration-normal)] ${
        collapsed ? "w-12" : "w-64"
      } hidden lg:block`}
    >
      {/* 折叠按钮 + 标题 */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] 
                     text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]
                     transition-colors duration-[var(--duration-fast)]"
          title={collapsed ? "展开目录" : "收起目录"}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-[var(--duration-normal)] ${
              collapsed ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
        {!collapsed && (
          <Link
            href={`/columns/${columnSlug}`}
            className="text-sm font-semibold text-[var(--text-primary)] truncate hover:text-[var(--accent-primary)] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {columnTitle}
          </Link>
        )}
      </div>

      {/* 目录内容 */}
      {!collapsed && (
        <nav className="max-h-[calc(100vh-8rem)] overflow-y-auto p-3">
          <ul className="space-y-4">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <div className="mb-1.5 flex items-center gap-2 px-1">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[10px] font-bold text-[var(--accent-primary)]">
                    {chapter.sort < 9999 ? chapter.sort : "·"}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">
                    {chapter.title}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {chapter.posts.map((post) => {
                    const isActive = post.slug === currentPostSlug;
                    return (
                      <li key={post.id}>
                        <Link
                          href={`/columns/${columnSlug}/${post.slug}`}
                          className={`block rounded-[var(--radius-sm)] px-1 py-1.5 pl-8 text-xs leading-tight transition-colors duration-[var(--duration-fast)]
                            ${
                              isActive
                                ? "bg-[var(--accent-muted)] text-[var(--accent-primary)] font-medium"
                                : "text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                            }`}
                        >
                          {post.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* 折叠时显示小提示 */}
      {collapsed && (
        <div className="flex justify-center pt-4">
          <Link
            href={`/columns/${columnSlug}`}
            className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] 
                       text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-primary)]
                       transition-colors duration-[var(--duration-fast)]"
            title={`返回 ${columnTitle}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </Link>
        </div>
      )}
    </aside>
  );
}
