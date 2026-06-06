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
