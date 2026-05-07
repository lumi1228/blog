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
}
