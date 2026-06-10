/**
 * Markdown 标题锚点 slug 生成工具。
 *
 * 实现要点（对应 Requirements 1.3 与 design 第 1 节）：
 * - 转小写后保留中文 `\u4e00-\u9fa5` 与 `[a-z0-9]`，其余字符（含空白、控制符、emoji、标点）
 *   折叠为单个 `-`；
 * - 去除首尾 `-`；
 * - 输出形态保证幂等：`slugify(slugify(s)) === slugify(s)`。
 *
 * 仅运行在服务端（被 MarkdownRenderer 在构建/渲染期使用），不依赖任何浏览器 API。
 */

const KEEP_PATTERN = /[^a-z0-9\u4e00-\u9fa5]+/g;
const TRIM_DASH_PATTERN = /^-+|-+$/g;

/**
 * 把任意 Unicode 字符串转换为 URL 友好的 slug。
 *
 * @example
 * slugify("Hello World!")          // => "hello-world"
 * slugify("前言 · Introduction")    // => "前言-introduction"
 * slugify("---abc---")             // => "abc"
 * slugify("")                       // => ""
 */
export function slugify(text: string): string {
  if (!text) return "";

  // toLowerCase 仅影响 ASCII 字母与少量带大小写的拉丁/希腊字符；
  // 中文与数字保持不变，便于后续 KEEP_PATTERN 精准过滤。
  const lowered = text.toLowerCase();

  // 把所有不在保留范围内的连续字符折叠成单个连字符，等价于
  // 「替换为 `-` + 折叠连续 `-`」两步合并成一步。
  const collapsed = lowered.replace(KEEP_PATTERN, "-");

  // 去除首尾连字符。
  return collapsed.replace(TRIM_DASH_PATTERN, "");
}

/**
 * 专用于文章 URL slug 生成（只保留英文/数字，不含中文）。
 *
 * 优先使用英文标题生成语义化 slug；
 * 没有英文标题，或英文标题处理后无有效字符时，用时间戳兜底。
 *
 * 与 `slugify` 的区别：`slugify` 刻意保留中文字符用于 Markdown 锚点；
 * 本函数面向 URL 路由，不允许中文出现。
 *
 * @example
 * generatePostSlug("My React Notes 2026", "我的 React 笔记")
 *   // => "my-react-notes-2026"
 *
 * generatePostSlug("", "罗盘项目难点与亮点总结")
 *   // => "post-1749557234567"
 */
export function generatePostSlug(titleEn: string, titleZh: string): string {
  const base = titleEn.trim();

  if (base) {
    const slug = base
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // 只保留字母、数字、空格、连字符
      .trim()
      .replace(/[\s_]+/g, "-") // 空格/下划线转连字符
      .replace(/-+/g, "-") // 合并连续连字符
      .replace(/^-+|-+$/g, "") // 去首尾连字符
      .slice(0, 80);

    if (slug) return slug;
  }

  // 没有英文标题，或处理后为空（全是特殊字符）：时间戳兜底
  // 加入 titleZh 的长度作为随机因子，避免同一毫秒内创建多篇文章时碰撞
  return `post-${Date.now()}${titleZh.length > 0 ? `-${titleZh.length}` : ""}`;
}

/**
 * 在同一作用域内为重名标题生成唯一 slug。
 *
 * 行为：
 * - 先对原始文本调用 `slugify` 拿到 base slug；
 * - 若 base 不在 `used` 集合中，直接占用并返回；
 * - 若已占用，依次尝试 `${base}-2`、`${base}-3` ... 直到找到未占用项；
 * - 找到的最终 slug 会被加入 `used`，确保后续调用不会与之冲突。
 *
 * 注意：本函数会**就地修改**传入的 `used` 集合（这是设计预期，
 * 用于在一次 Markdown 渲染过程中跨多个标题串联使用）。
 */
export function makeUniqueSlug(text: string, used: Set<string>): string {
  const base = slugify(text);

  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  const unique = `${base}-${suffix}`;
  used.add(unique);
  return unique;
}
