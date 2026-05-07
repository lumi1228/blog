import type { Post, Category, Tag } from "@/lib/types";

/**
 * Mock 数据 — 后续接入 Supabase 后替换为真实查询
 */

export const mockCategories: Category[] = [
  { id: "c1", name: "技术", slug: "tech", description: "前端、后端、工程化的技术笔记", articleCount: 2 },
  { id: "c2", name: "设计", slug: "design", description: "设计思考与视觉表达", articleCount: 1 },
  { id: "c3", name: "生活", slug: "life", description: "成长感悟与生活片段", articleCount: 1 },
];

export const mockTags: Tag[] = [
  { id: "t1", name: "React", slug: "react" },
  { id: "t2", name: "Next.js", slug: "nextjs" },
  { id: "t3", name: "前端", slug: "frontend" },
  { id: "t4", name: "架构", slug: "architecture" },
  { id: "t5", name: "设计系统", slug: "design-system" },
  { id: "t6", name: "色彩", slug: "color" },
  { id: "t7", name: "成长", slug: "growth" },
  { id: "t8", name: "女性开发者", slug: "women-in-tech" },
];

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "用 React 19 的 use() Hook 重新思考数据获取",
    slug: "react-19-use-hook-data-fetching",
    excerpt:
      "React 19 引入了 use() hook，它改变了我们在组件中处理异步数据的方式。本文深入探讨它的工作原理、最佳实践以及与 Suspense 的配合。",
    content: `## 前言

React 19 的 \`use()\` hook 是一个里程碑式的 API。它让组件可以直接"读取"Promise 或 Context，无需通过 \`useEffect\` + \`useState\` 的组合。

## 基础用法

\`\`\`tsx
import { use } from 'react';

function UserProfile({ userPromise }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
\`\`\`

## 与 Suspense 的配合

\`use()\` 会在 Promise 未 resolve 时抛出，交由上层 Suspense 捕获。

## 最佳实践

1. 不要在客户端组件中创建 Promise（会导致重复请求）
2. 优先在 Server Component 中 \`await\` 数据
3. 对于需要流式传输的场景，从 Server 传递 Promise 到 Client

## 总结

\`use()\` 不是 \`useEffect\` 的替代，而是配合 Suspense 使用的新范式。`,
    category: { name: "技术", slug: "tech" },
    tags: [
      { name: "React", slug: "react" },
      { name: "前端", slug: "frontend" },
    ],
    publishedAt: "2026-05-06",
    readingTime: 8,
    coverImage: null,
    viewCount: 1245,
  },
  {
    id: "2",
    title: "从零搭建个人博客：技术选型与架构设计",
    slug: "build-personal-blog-from-scratch",
    excerpt:
      "记录自己搭建博客的完整过程，包括为什么选择 Next.js 16 + Supabase 的组合，以及在设计系统上的思考。",
    content: `## 为什么再造一个博客

市面上博客平台很多，但都不是"我的"。自建博客意味着：

- 完全的数据控制权
- 自由的设计表达
- 技术栈与日常工作一致

## 技术选型

| 维度 | 选择 | 理由 |
|------|------|------|
| 框架 | Next.js 16 | App Router + SSG，SEO 友好 |
| 数据库 | Supabase | PostgreSQL + 开箱即用的认证 |
| 样式 | Tailwind CSS v4 | 快速迭代，与设计 Token 映射 |

## 设计系统优先

在写任何页面前，我先定义了完整的设计规范。这样后续新增页面时风格不会漂移。

## 踩坑记录

- Next.js 16 要求 Node.js >= 20.9.0
- Tailwind v4 的 \`@theme\` 语法与 v3 不兼容
- Supabase 的 RLS 需要仔细设计`,
    category: { name: "技术", slug: "tech" },
    tags: [
      { name: "Next.js", slug: "nextjs" },
      { name: "架构", slug: "architecture" },
    ],
    publishedAt: "2026-05-04",
    readingTime: 12,
    coverImage: null,
    viewCount: 892,
  },
  {
    id: "3",
    title: "设计系统中的色彩理论：如何让暗色主题不只是「黑底白字」",
    slug: "color-theory-in-dark-theme-design",
    excerpt:
      "暗色主题不是简单地反转颜色。本文分享我在设计博客暗色主题时的色彩选择逻辑，以及如何兼顾美感与可读性。",
    content: `## 暗色主题的常见误区

很多人做暗色主题就是把背景改成黑色、文字改成白色。但这样做出来的界面往往显得廉价、刺眼。

## 我的色彩原则

### 1. 不用纯黑

主背景使用 \`#0B0D11\` 而非 \`#000000\`。纯黑在 OLED 屏上虽然省电，但在 LCD 屏上会产生"光晕"效应，对比度过强。

### 2. 不用纯白文字

主文字使用 \`#E8E6E3\`（暖白）。纯白文字在暗色背景上会过于刺眼，长时间阅读容易疲劳。

### 3. 用光晕代替阴影

暗色模式下，阴影几乎不可见。使用微弱的色彩光晕（glow）来表达层级。

## 强调色的选择

我选择了玫瑰金（\`#E8A0BF\`）作为强调色。原因：

- 在深色背景上有足够对比度
- 不会像纯红那样刺眼
- 传达温暖、精致的气质`,
    category: { name: "设计", slug: "design" },
    tags: [
      { name: "设计系统", slug: "design-system" },
      { name: "色彩", slug: "color" },
    ],
    publishedAt: "2026-05-02",
    readingTime: 6,
    coverImage: null,
    viewCount: 567,
  },
  {
    id: "4",
    title: "作为女性开发者，我如何在技术社区找到自己的声音",
    slug: "finding-voice-as-female-developer",
    excerpt:
      "分享我作为女性开发者的成长经历，从最初的不自信到逐渐建立自己的技术影响力，以及一路上遇到的人和事。",
    content: `## 初入行业

刚毕业进入互联网公司时，整个部门只有我一个女生。开会时我很少发言，怕自己的观点不够"技术"。

## 改变的契机

一次技术分享会上，我鼓起勇气讲了自己做的一个性能优化方案。同事的反馈让我意识到：技术不分性别，思考的深度才是关键。

## 给同路人的建议

1. **不要自我设限** — 不要因为"我是女生"就默认自己不适合做某些事
2. **积极输出** — 写博客、做分享，让你的工作被看见
3. **找到同伴** — 加入女性开发者社区，互相支持

## 写在最后

技术世界需要更多元的声音。每一个认真写代码的女生，都是在为后来者铺路。`,
    category: { name: "生活", slug: "life" },
    tags: [
      { name: "成长", slug: "growth" },
      { name: "女性开发者", slug: "women-in-tech" },
    ],
    publishedAt: "2026-04-28",
    readingTime: 5,
    coverImage: null,
    viewCount: 2103,
  },
];

/**
 * 工具函数：根据 slug 查找文章
 */
export function getPostBySlug(slug: string): Post | undefined {
  return mockPosts.find((p) => p.slug === slug);
}

/**
 * 工具函数：根据分类 slug 查找文章
 */
export function getPostsByCategory(categorySlug: string): Post[] {
  return mockPosts.filter((p) => p.category.slug === categorySlug);
}

/**
 * 工具函数：根据标签 slug 查找文章
 */
export function getPostsByTag(tagSlug: string): Post[] {
  return mockPosts.filter((p) => p.tags.some((t) => t.slug === tagSlug));
}

/**
 * 工具函数：获取相邻文章（上一篇/下一篇）
 */
export function getAdjacentPosts(slug: string): {
  prev: Post | null;
  next: Post | null;
} {
  const index = mockPosts.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? mockPosts[index - 1] : null,
    next: index < mockPosts.length - 1 ? mockPosts[index + 1] : null,
  };
}
