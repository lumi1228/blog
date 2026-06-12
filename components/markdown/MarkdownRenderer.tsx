/**
 * MarkdownRenderer — Server Component
 *
 * 使用 react-markdown + remark-gfm + rehype-raw + rehype-sanitize + @shikijs/rehype
 * 在服务端完成 GFM 语法解析 + shiki 双主题代码高亮，零客户端 runtime。
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.10, 1.11, 4.13
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";
import type { Components } from "react-markdown";
import { makeUniqueSlug } from "@/lib/markdown/slugify";
import { createRehypeShikiPlugin } from "@/lib/markdown/shiki";
import { CodeBlockWrapper } from "./CodeBlockWrapper";
import type { Element } from "hast";

// ─────────────────────────────────────────────
// 1. Sanitize schema
// ─────────────────────────────────────────────

/**
 * 基于 defaultSchema 的增量安全规则：
 * - tagNames 移除高危标签
 * - attributes 采用白名单机制，defaultSchema 本身不含 on* 事件属性，天然剥离
 * - 保留 code/pre/span 上 shiki 注入的 className、data-language、data-theme 与 style
 */
const BLOCKED_TAGS = new Set(["script", "iframe", "style", "object", "embed"]);

const sanitizeSchema: Schema = {
  ...defaultSchema,
  // 过滤掉高危标签
  tagNames: (defaultSchema.tagNames ?? []).filter(
    (tag) => !BLOCKED_TAGS.has(tag)
  ),
  attributes: {
    // 继承 defaultSchema 的属性白名单
    // defaultSchema 本身不包含 on* 事件属性，白名单机制天然剥离
    ...defaultSchema.attributes,
    // code/pre 额外保留 className 与 shiki 的 data-* 属性
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      "className",
      "data-language",
      "data-theme",
      "style",
    ],
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      "className",
      "data-language",
      "data-theme",
      "style",
    ],
    // span 保留 style（shiki 行内着色用）
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      "className",
      "style",
    ],
    // div 保留 className 和 data-* （shiki 输出 <div class="shiki ..."> 结构）
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      "className",
      "style",
      "data-language",
      "data-theme",
    ],
  },
};

// ─────────────────────────────────────────────
// 2. 工具函数
// ─────────────────────────────────────────────

/**
 * 判断链接是否为外链
 */
function isExternalUrl(href: string): boolean {
  try {
    // 以 http(s):// 或 // 开头的视为外链
    return /^https?:\/\/|^\/\//i.test(href);
  } catch {
    return false;
  }
}

/**
 * 从 hast 节点中提取 code 元素的原始文本内容与语言
 */
function extractCodeInfo(node: Element): { raw: string; lang: string } {
  // node 是 <pre> 元素，children[0] 应是 <code>
  const codeEl = node.children.find(
    (child): child is Element =>
      child.type === "element" && child.tagName === "code"
  );

  if (!codeEl) {
    return { raw: "", lang: "" };
  }

  // 提取 className 中的语言（shiki 格式：language-xxx）
  const classNames: string[] = Array.isArray(codeEl.properties?.className)
    ? (codeEl.properties.className as string[])
    : [];
  const langClass = classNames.find((c) => c.startsWith("language-"));
  const lang = langClass ? langClass.replace("language-", "") : "";

  // 提取原始文本
  const rawParts: string[] = [];
  const collectText = (nodes: typeof codeEl.children): void => {
    for (const child of nodes) {
      if (child.type === "text") {
        rawParts.push(child.value);
      } else if (child.type === "element") {
        collectText(child.children);
      }
    }
  };
  collectText(codeEl.children);

  return { raw: rawParts.join(""), lang };
}

// ─────────────────────────────────────────────
// 3. 组件接口
// ─────────────────────────────────────────────

interface MarkdownRendererProps {
  content: string | null | undefined;
  /** 用于 heading id 去重的 scope；默认每次渲染独立 scope */
  scope?: string;
}

// ─────────────────────────────────────────────
// 4. 主组件
// ─────────────────────────────────────────────

export async function MarkdownRenderer({
  content,
}: MarkdownRendererProps): Promise<React.ReactElement> {
  // 空内容保护：null / undefined / 全空白时直接返回空容器
  if (content == null || content.trim() === "") {
    return <div className="prose-custom" />;
  }

  // 获取 shiki rehype 插件（内部通过 React.cache 保证单例）
  const rehypeShiki = await createRehypeShikiPlugin();

  // heading id 去重集合（每次渲染独立，避免不同文章间冲突）
  const usedSlugs = new Set<string>();

  // ── 自定义 components 映射 ──

  const components: Components = {
    // h1 ~ h6：生成稳定 id，支持锚点跳转
    h1: ({ children, ...props }) => {
      const text = typeof children === "string" ? children : String(children ?? "");
      const id = makeUniqueSlug(text, usedSlugs);
      return (
        <h1
          id={id}
          className="scroll-mt-24 mt-12 mb-4 text-3xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }) => {
      const text = typeof children === "string" ? children : String(children ?? "");
      const id = makeUniqueSlug(text, usedSlugs);
      return (
        <h2
          id={id}
          className="scroll-mt-24 mt-10 mb-4 text-2xl font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }) => {
      const text = typeof children === "string" ? children : String(children ?? "");
      const id = makeUniqueSlug(text, usedSlugs);
      return (
        <h3
          id={id}
          className="scroll-mt-24 mt-8 mb-3 text-xl font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
          {...props}
        >
          {children}
        </h3>
      );
    },
    h4: ({ children, ...props }) => {
      const text = typeof children === "string" ? children : String(children ?? "");
      const id = makeUniqueSlug(text, usedSlugs);
      return (
        <h4
          id={id}
          className="scroll-mt-24 mt-6 mb-2 text-lg font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
          {...props}
        >
          {children}
        </h4>
      );
    },
    h5: ({ children, ...props }) => {
      const text = typeof children === "string" ? children : String(children ?? "");
      const id = makeUniqueSlug(text, usedSlugs);
      return (
        <h5
          id={id}
          className="scroll-mt-24 mt-5 mb-2 text-base font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
          {...props}
        >
          {children}
        </h5>
      );
    },
    h6: ({ children, ...props }) => {
      const text = typeof children === "string" ? children : String(children ?? "");
      const id = makeUniqueSlug(text, usedSlugs);
      return (
        <h6
          id={id}
          className="scroll-mt-24 mt-4 mb-2 text-sm font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
          {...props}
        >
          {children}
        </h6>
      );
    },

    // a：自动判断外链，添加 target/rel
    a: ({ href, children, ...props }) => {
      const isExternal = href ? isExternalUrl(href) : false;
      return (
        <a
          href={href}
          className="text-[var(--accent-secondary)] underline decoration-[var(--accent-secondary)]/40
                     underline-offset-2 transition-colors duration-[var(--duration-fast)]
                     hover:text-[var(--accent-secondary-hover)] hover:decoration-[var(--accent-secondary)]"
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...props}
        >
          {children}
        </a>
      );
    },

    // img：lazy loading + 保证 alt 存在
    img: ({ src, alt, ...props }) => {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          className="my-4 max-w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)]"
          {...props}
        />
      );
    },

    // code：区分行内代码 vs 代码块（代码块由 pre 处理）
    code: ({ children, className, style, ...props }) => {
      // Shiki 输出的代码块 <code> 可能没有 language-* className，
      // 但 children 会是 span/line 元素；只有纯字符串才按行内代码处理。
      const isInline = !className && typeof children === "string";

      if (isInline) {
        return (
          <code
            className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)]
                       bg-[var(--bg-secondary)] px-1.5 py-0.5 text-[0.875em]
                       text-[var(--accent-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
            {...props}
          >
            {children}
          </code>
        );
      }

      // 代码块内的 code 元素，保留 shiki 颜色并强制背景透明
      return (
        <code
          className={className}
          {...props}
          style={{ ...style, backgroundColor: "transparent" }}
        >
          {children}
        </code>
      );
    },

    // pre：委托给 CodeBlockWrapper，传入原始文本和语言
    pre: ({ children, node, className, style, ...props }) => {
      // 从 hast node 中提取原始文本和语言信息
      let raw = "";
      let lang = "";

      if (node && node.type === "element") {
        const info = extractCodeInfo(node as Element);
        raw = info.raw;
        lang = info.lang;
      }

      const preClassName = [
        "shiki",
        className,
        "overflow-x-auto border-l-[3px] border-[var(--accent-secondary)] px-4 py-4 text-sm leading-relaxed",
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <CodeBlockWrapper raw={raw} lang={lang}>
          <pre
            {...props}
            className={preClassName}
            style={{
              ...style,
              fontFamily: "var(--font-mono)",
              background: "#24292e",
              backgroundColor: "#24292e",
            }}
          >
            {children}
          </pre>
        </CodeBlockWrapper>
      );
    },

    // blockquote
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="my-4 border-l-4 border-[var(--accent-primary)] pl-4 italic
                   text-[var(--text-secondary)]"
        {...props}
      >
        {children}
      </blockquote>
    ),

    // ul / ol
    ul: ({ children, ...props }) => (
      <ul
        className="my-4 list-disc space-y-2 pl-6 text-[var(--text-secondary)]
                   marker:text-[var(--accent-primary)]"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        className="my-4 list-decimal space-y-2 pl-6 text-[var(--text-secondary)]
                   marker:text-[var(--accent-primary)]"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    ),

    // table
    table: ({ children, ...props }) => (
      <div
        className="my-6 overflow-hidden rounded-[var(--radius-lg)]
                   border border-[var(--border-subtle)]"
      >
        <table className="w-full text-sm" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-[var(--bg-secondary)]" {...props}>
        {children}
      </thead>
    ),
    tr: ({ children, ...props }) => (
      <tr
        className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]
                   first:border-t-0"
        {...props}
      >
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th
        className="px-4 py-2.5 text-left font-semibold text-[var(--text-primary)]"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-2.5 text-[var(--text-secondary)]" {...props}>
        {children}
      </td>
    ),

    // hr
    hr: ({ ...props }) => (
      <hr
        className="my-8 h-px border-0"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--border-default), transparent)",
        }}
        {...props}
      />
    ),

    // p
    p: ({ children, ...props }) => (
      <p
        className="my-4 text-base leading-[1.8] text-[var(--text-secondary)]"
        {...props}
      >
        {children}
      </p>
    ),

    // strong / em
    strong: ({ children, ...props }) => (
      <strong
        className="font-semibold text-[var(--text-primary)]"
        {...props}
      >
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic text-[var(--text-secondary)]" {...props}>
        {children}
      </em>
    ),

    // del（GFM 删除线）
    del: ({ children, ...props }) => (
      <del className="line-through text-[var(--text-tertiary)]" {...props}>
        {children}
      </del>
    ),
  };

  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema] as any, rehypeShiki]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
