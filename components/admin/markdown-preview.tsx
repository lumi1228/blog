"use client";

import { useMemo } from "react";

interface MarkdownPreviewProps {
  content: string;
}

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang: string; content: string }
  | { type: "blockquote"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "image"; alt: string; src: string }
  | { type: "hr" };

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const blocks = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div className="prose-preview">
      {blocks.map((block, i) => (
        <RenderBlock key={i} block={block} />
      ))}
    </div>
  );
}

function parseMarkdown(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 代码块
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 跳过结束的 ```
      blocks.push({ type: "code", lang, content: codeLines.join("\n") });
      continue;
    }

    // 标题
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // 水平线
    if (/^-{3,}$|^\*{3,}$|^_{3,}$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 图片（独立行）
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      blocks.push({ type: "image", alt: imgMatch[1], src: imgMatch[2] });
      i++;
      continue;
    }

    // 引用块
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", lines: quoteLines });
      continue;
    }

    // 表格
    if (line.includes("|") && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      const headers = line.split("|").map((s) => s.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        const cells = lines[i].split("|").map((s) => s.trim()).filter(Boolean);
        rows.push(cells);
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // 有序/无序列表
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    const unorderedMatch = line.match(/^[-*+]\s+(.+)$/);
    if (orderedMatch || unorderedMatch) {
      const ordered = !!orderedMatch;
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(ordered ? /^\d+\.\s+(.+)$/ : /^[-*+]\s+(.+)$/);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // 段落
    if (line.trim()) {
      const paraLines: string[] = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].match(/^(#{1,6}\s|```|[-*+]\s|\d+\.\s|>\s?|-{3,}$|\*{3,}$|_{3,}$|!\[)/)
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "paragraph", text: paraLines.join("\n") });
      continue;
    }

    i++;
  }

  return blocks;
}

// 渲染行内 Markdown
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: Array<{
    regex: RegExp;
    render: (match: RegExpMatchArray, k: number) => React.ReactNode;
  }> = [
    {
      // 行内图片
      regex: /!\[([^\]]*)\]\(([^)]+)\)/,
      render: (m, k) => (
        <img key={k} src={m[2]} alt={m[1]} className="my-2 inline-block max-w-full rounded-[var(--radius-sm)]" />
      ),
    },
    {
      // 行内代码
      regex: /`([^`]+)`/,
      render: (m, k) => (
        <code
          key={k}
          className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[0.85em] text-[var(--accent-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {m[1]}
        </code>
      ),
    },
    {
      // 粗体
      regex: /\*\*([^*]+)\*\*/,
      render: (m, k) => (
        <strong key={k} className="font-semibold text-[var(--text-primary)]">{m[1]}</strong>
      ),
    },
    {
      // 斜体
      regex: /\*([^*]+)\*/,
      render: (m, k) => (
        <em key={k} className="italic">{m[1]}</em>
      ),
    },
    {
      // 链接
      regex: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m, k) => (
        <a
          key={k}
          href={m[2]}
          className="text-[var(--accent-secondary)] underline decoration-[var(--accent-secondary)]/40 underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          {m[1]}
        </a>
      ),
    },
  ];

  while (remaining) {
    let earliestMatch: {
      index: number;
      pattern: (typeof patterns)[0];
      match: RegExpMatchArray;
    } | null = null;

    for (const p of patterns) {
      const m = remaining.match(p.regex);
      if (m && m.index !== undefined) {
        if (!earliestMatch || m.index < earliestMatch.index) {
          earliestMatch = { index: m.index, pattern: p, match: m };
        }
      }
    }

    if (!earliestMatch) {
      parts.push(remaining);
      break;
    }

    if (earliestMatch.index > 0) {
      parts.push(remaining.slice(0, earliestMatch.index));
    }
    parts.push(earliestMatch.pattern.render(earliestMatch.match, key++));
    remaining = remaining.slice(earliestMatch.index + earliestMatch.match[0].length);
  }

  return parts.length === 1 ? parts[0] : parts;
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "heading": {
      const sizeClass =
        block.level === 1
          ? "text-2xl mt-6 mb-3"
          : block.level === 2
            ? "text-xl mt-5 mb-2"
            : block.level === 3
              ? "text-lg mt-4 mb-2"
              : "text-base mt-3 mb-1";
      const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag
          className={`${sizeClass} font-semibold text-[var(--text-primary)]`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {renderInline(block.text)}
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p className="my-2.5 text-sm leading-[1.8] text-[var(--text-secondary)]">
          {renderInline(block.text)}
        </p>
      );

    case "code":
      return (
        <div className="my-3 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          {block.lang && (
            <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-3 py-1.5">
              <span className="text-xs text-[var(--text-tertiary)]" style={{ fontFamily: "var(--font-mono)" }}>
                {block.lang}
              </span>
            </div>
          )}
          <pre
            className="overflow-x-auto border-l-[3px] border-[var(--accent-secondary)] px-3 py-3 text-xs leading-relaxed"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <code className="text-[var(--text-primary)]">{block.content}</code>
          </pre>
        </div>
      );

    case "blockquote":
      return (
        <blockquote className="my-3 border-l-[3px] border-[var(--accent-primary)] bg-[var(--accent-muted)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          {block.lines.map((line, j) => (
            <p key={j} className="my-1">{renderInline(line)}</p>
          ))}
        </blockquote>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={`my-2.5 space-y-1 pl-5 text-sm text-[var(--text-secondary)] ${
            block.ordered ? "list-decimal" : "list-disc"
          } marker:text-[var(--accent-primary)]`}
        >
          {block.items.map((item, j) => (
            <li key={j} className="leading-relaxed">{renderInline(item)}</li>
          ))}
        </Tag>
      );
    }

    case "image":
      return (
        <div className="my-3">
          <img
            src={block.src}
            alt={block.alt}
            className="max-w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)]"
          />
          {block.alt && (
            <p className="mt-1 text-center text-xs text-[var(--text-tertiary)]">{block.alt}</p>
          )}
        </div>
      );

    case "table":
      return (
        <div className="my-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
          <table className="w-full text-xs">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                {block.headers.map((h, j) => (
                  <th key={j} className="px-3 py-2 text-left font-semibold text-[var(--text-primary)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                <tr key={j} className="border-t border-[var(--border-subtle)]">
                  {row.map((cell, k) => (
                    <td key={k} className="px-3 py-2 text-[var(--text-secondary)]">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "hr":
      return (
        <hr
          className="my-5 border-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, var(--border-default), transparent)" }}
        />
      );
  }
}
