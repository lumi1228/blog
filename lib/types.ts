/**
 * 共享数据类型定义
 * 与 PRD 五、数据模型设计 保持一致
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort?: number;
  articleCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string; // Markdown 正文，详情页使用
  coverImage: string | null;
  category: Pick<Category, "name" | "slug">;
  tags: Pick<Tag, "name" | "slug">[];
  publishedAt: string;
  readingTime: number;
  viewCount?: number;
  /** 已有译文的语言列表，用于 SEO hreflang 与 sitemap */
  availableLocales?: ("zh-CN" | "en")[];
  /** 文章最后更新时间，用于 sitemap lastModified */
  updatedAt?: string;
  /** 专栏关联信息 */
  columnId?: string | null;
  chapterId?: string | null;
  columnOrder?: number | null;
  showInList?: boolean;
}

/** 专栏 */
export interface Column {
  id: string;
  slug: string;
  sort: number;
  title: string;
  description?: string;
  coverImage?: string | null;
}

/** 专栏章节 */
export interface ColumnChapter {
  id: string;
  columnId: string;
  sort: number;
  title: string;
}

/** 专栏详情（含章节与文章列表） */
export interface ColumnDetail extends Column {
  chapters: (ColumnChapter & { posts: Post[] })[];
}

/**
 * 专栏 + 首篇文章 slug（用于文档站 Tab 直达首篇 / 入口重定向）。
 * firstPostSlug 为 null 表示该文档集暂无已发布文章。
 */
export interface ColumnWithFirstPost extends Column {
  firstPostSlug: string | null;
}

/**
 * 搜索索引条目（精简字段，供 /api/search-index 输出）
 */
export interface SearchIndexEntry {
  slug: string;
  title: string;
  excerpt: string;
  /** 标签名数组（已按当前 locale 解析） */
  tags: string[];
  /** ISO 8601 发布时间 */
  publishedAt: string;
  /**
   * 可选的目标相对路径（不含 locale 前缀）。
   * 文档作用域条目会带上 /docs/[set]/[slug]；普通文章为空，
   * 由前端回退到 /posts/[slug]。
   */
  url?: string;
}

/**
 * 搜索索引接口响应体
 */
export interface SearchIndexResponse {
  locale: "zh-CN" | "en";
  /** ISO 8601 生成时间 */
  generatedAt: string;
  entries: SearchIndexEntry[];
}

/**
 * Sitemap 用文章数据子集
 */
export interface SitemapPost {
  slug: string;
  updatedAt: string;
  availableLocales: ("zh-CN" | "en")[];
}

/**
 * Sitemap 用分类/标签数据子集
 */
export interface SitemapCategoryOrTag {
  slug: string;
}

// ============================================
// 简历模块（已按 locale 解析后的前端类型）
// ============================================

/** 简历基本信息 */
export interface ResumeProfile {
  avatar: string | null;
  phone: string | null;
  email: string | null;
  blogUrl: string | null;
  /** 姓名 */
  name: string;
  /** 证书 */
  certificate: string | null;
  /** 求职意向 */
  jobIntention: string | null;
  /** 毕业院校（整段） */
  edu: string | null;
}

/** 专业技能条目 */
export interface ResumeSkill {
  id: string;
  content: string;
}

/** 工作经历条目 */
export interface ResumeExperience {
  id: string;
  period: string | null;
  company: string;
  role: string | null;
  /** 要点列表（已按行拆分） */
  highlights: string[];
}

/** 项目经验条目 */
export interface ResumeProject {
  id: string;
  name: string;
  summary: string | null;
  /** 核心贡献列表（已按行拆分） */
  contributions: string[];
}

/** 简历聚合数据 */
export interface ResumeData {
  profile: ResumeProfile | null;
  skills: ResumeSkill[];
  experiences: ResumeExperience[];
  projects: ResumeProject[];
}
