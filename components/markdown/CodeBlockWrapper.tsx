/**
 * CodeBlockWrapper — Server Component（完整版）
 *
 * 外层容器提供 group/relative 上下文，支持：
 * - 语言标签条（lang 非空时渲染）
 * - 右上角 CopyButton（hover/focus-within 时可见）
 *
 * Server Component 可以直接 import 客户端组件（Client Island）。
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.10
 */

import { CopyButton } from "./CopyButton";

interface CodeBlockWrapperProps {
  /** shiki 渲染后的 <pre> 节点 */
  children: React.ReactNode;
  /** 原始未高亮 code 文本，用于复制 */
  raw: string;
  /** 语言别名（可能为空字符串） */
  lang?: string;
}

export function CodeBlockWrapper({ children, raw, lang }: CodeBlockWrapperProps) {
  const hasLang = !!lang && lang !== "text";

  return (
    <div
      className="group relative my-6 overflow-hidden rounded-[var(--radius-lg)]
                 border border-[var(--border-subtle)]"
    >
      {/* 语言标签条（lang 非空且非 "text" 时渲染） */}
      {hasLang ? (
        <div
          className="flex items-center justify-between border-b border-[var(--border-subtle)]
                     bg-[var(--bg-tertiary)] px-4 py-2"
        >
          {/* 左侧：语言名称 */}
          <span
            className="text-xs text-[var(--text-tertiary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {lang}
          </span>

          {/* 右侧：复制按钮（嵌在标签条中） */}
          <CopyButton
            text={raw}
            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                       motion-reduce:opacity-100 transition-opacity duration-[var(--duration-fast)]"
          />
        </div>
      ) : (
        /* 无语言标签时，CopyButton 绝对定位在右上角 */
        <CopyButton
          text={raw}
          className="absolute right-2 top-2 z-10
                     opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                     motion-reduce:opacity-100 transition-opacity duration-[var(--duration-fast)]"
        />
      )}

      {/* shiki 渲染后的 <pre> 节点 */}
      {children}
    </div>
  );
}
