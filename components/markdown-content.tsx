/**
 * 简化版 Markdown 渲染器
 * 
 * 当前实现：使用正则解析基础 Markdown 语法
 * Phase 2 升级：替换为 react-markdown + remark-gfm + shiki
 */

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const blocks = parseMarkdown(content);

  return (
    <div className="prose-custom">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}

type Block =
  | { type: "heading"; level: number; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang: string; content: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "hr" };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "");
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
      i++;
      blocks.push({ type: "code", lang, content: codeLines.join("\n") });
      continue;
    }

    // 标题
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      blocks.push({ type: "heading", level, text, id: slugify(text) });
      i++;
      continue;
    }

    // 水平线
    if (/^-{3,}$|^\*{3,}$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 表格
    if (line.includes("|") && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      const headers = line
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      i += 2; // 跳过表头和分隔线
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        const cells = lines[i]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
        rows.push(cells);
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // 有序/无序列表
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    if (orderedMatch || unorderedMatch) {
      const ordered = !!orderedMatch;
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(ordered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // 段落（连续非空行）
    if (line.trim()) {
      const paraLines: string[] = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].match(/^(#{1,6}\s|```|[-*]\s|\d+\.\s|-{3,}$)/)
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "paragraph", text: paraLines.join(" ") });
      continue;
    }

    i++;
  }

  return blocks;
}

/**
 * 渲染行内 Markdown（加粗、斜体、代码、链接）
 */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // 正则顺序：代码 → 粗体 → 斜体 → 链接
  const patterns: Array<{
    regex: RegExp;
    render: (match: RegExpMatchArray, k: number) => React.ReactNode;
  }> = [
    {
      regex: /`([^`]+)`/,
      render: (m, k) => (
        <code
          key={k}
          className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)]
                     bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[0.875em] text-[var(--accent-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {m[1]}
        </code>
      ),
    },
    {
      regex: /\*\*([^*]+)\*\*/,
      render: (m, k) => (
        <strong key={k} className="font-semibold text-[var(--text-primary)]">
          {m[1]}
        </strong>
      ),
    },
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m, k) => (
        <a
          key={k}
          href={m[2]}
          className="text-[var(--accent-secondary)] underline decoration-[var(--accent-secondary)]/40 
                     underline-offset-2 transition-colors duration-[var(--duration-fast)]
                     hover:decoration-[var(--accent-secondary)]"
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
    remaining = remaining.slice(
      earliestMatch.index + earliestMatch.match[0].length
    );
  }

  return parts;
}

function renderBlock(block: Block, i: number): React.ReactNode {
  switch (block.type) {
    case "heading": {
      const sizeClass =
        block.level === 1
          ? "text-3xl mt-12 mb-4"
          : block.level === 2
            ? "text-2xl mt-10 mb-4"
            : block.level === 3
              ? "text-xl mt-8 mb-3"
              : "text-lg mt-6 mb-2";
      const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag
          key={i}
          id={block.id}
          className={`${sizeClass} font-semibold text-[var(--text-primary)] scroll-mt-24`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {block.text}
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p
          key={i}
          className="my-4 text-base leading-[1.8] text-[var(--text-secondary)]"
        >
          {renderInline(block.text)}
        </p>
      );

    case "code":
      return (
        <div
          key={i}
          className="my-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]
                     bg-[var(--bg-secondary)]"
        >
          {block.lang && (
            <div
              className="flex items-center justify-between border-b border-[var(--border-subtle)] 
                         bg-[var(--bg-tertiary)] px-4 py-2"
            >
              <span
                className="text-xs text-[var(--text-tertiary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {block.lang}
              </span>
            </div>
          )}
          <pre
            className="overflow-x-auto border-l-[3px] border-[var(--accent-secondary)] px-4 py-4 text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <code className="text-[var(--text-primary)]">{block.content}</code>
          </pre>
        </div>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          key={i}
          className={`my-4 space-y-2 pl-6 text-[var(--text-secondary)] ${
            block.ordered ? "list-decimal" : "list-disc"
          } marker:text-[var(--accent-primary)]`}
        >
          {block.items.map((item, j) => (
            <li key={j} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </Tag>
      );
    }

    case "table":
      return (
        <div
          key={i}
          className="my-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]"
        >
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                {block.headers.map((h, j) => (
                  <th
                    key={j}
                    className="px-4 py-2.5 text-left font-semibold text-[var(--text-primary)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                <tr
                  key={j}
                  className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]"
                >
                  {row.map((cell, k) => (
                    <td
                      key={k}
                      className="px-4 py-2.5 text-[var(--text-secondary)]"
                    >
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
          key={i}
          className="my-8 border-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--border-default), transparent)",
          }}
        />
      );
  }
}
