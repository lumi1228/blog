/**
 * 从 Markdown 字符串中提取标题列表，生成的 id 与 MarkdownRenderer 完全一致。
 *
 * 规则：
 * - 只提取 h1 ~ h3（TOC 通常不超过三级）
 * - 使用 makeUniqueSlug + 同一 Set 维护去重，保证与渲染侧的 id 完全对齐
 * - 纯服务端工具，不依赖浏览器 API
 */

import { makeUniqueSlug } from "./slugify";

export interface Heading {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

/**
 * 匹配 ATX 标题（# ~ ###），捕获层级数和标题文本。
 * 不匹配 setext 风格（===, --- 下划线），因为文章主要用 ATX。
 */
const HEADING_RE = /^(#{1,3})\s+(.+?)(?:\s+#+\s*)?$/gm;

/**
 * 提取 Markdown 中所有 h1 ~ h3 标题。
 *
 * @param content - 原始 Markdown 字符串
 * @returns 标题列表，id 与 MarkdownRenderer 渲染产物一致
 */
export function extractHeadings(content: string): Heading[] {
  if (!content) return [];

  const headings: Heading[] = [];
  const usedSlugs = new Set<string>();

  let match: RegExpExecArray | null;

  // 重置 lastIndex（全局正则复用时需要）
  HEADING_RE.lastIndex = 0;

  while ((match = HEADING_RE.exec(content)) !== null) {
    const hashes = match[1];
    const rawText = match[2].trim();
    const level = hashes.length as 1 | 2 | 3;

    // 去除行内 markdown 标记（加粗、斜体、行内代码、链接），只保留纯文本
    const text = rawText
      .replace(/`[^`]*`/g, (m) => m.slice(1, -1))    // `code` → code
      .replace(/\*\*(.+?)\*\*/g, "$1")               // **bold** → bold
      .replace(/\*(.+?)\*/g, "$1")                   // *italic* → italic
      .replace(/__(.+?)__/g, "$1")                   // __bold__ → bold
      .replace(/_(.+?)_/g, "$1")                     // _italic_ → italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")       // [text](url) → text
      .trim();

    const id = makeUniqueSlug(text, usedSlugs);

    headings.push({ id, text, level });
  }

  return headings;
}
