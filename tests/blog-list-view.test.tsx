import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// 根命名空间翻译：返回 key，count 拼到末尾便于断言
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: { count?: number }) =>
    params?.count !== undefined ? `${key}:${params.count}` : key,
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// 子组件打桩，隔离 BlogListView 自身逻辑
vi.mock("@/components/article-card", () => ({
  ArticleCard: ({ post }: any) => <div data-testid="article-card">{post.title}</div>,
}));
vi.mock("@/components/blog-tabs", () => ({
  BlogTabs: ({ activeSlug }: any) => (
    <div data-testid="blog-tabs">{activeSlug ?? "all"}</div>
  ),
}));
vi.mock("@/components/pagination", () => ({
  Pagination: ({ currentPage, totalPages }: any) => (
    <div data-testid="pagination">
      {currentPage}/{totalPages}
    </div>
  ),
}));

import { BlogListView } from "@/components/blog-list-view";
import type { Category, Post } from "@/lib/types";

const categories: Category[] = [{ id: "1", slug: "tech", name: "技术分享" }];

function makePost(id: string): Post {
  return {
    id,
    slug: `post-${id}`,
    title: `标题${id}`,
    excerpt: "摘要",
    coverImage: null,
    publishedAt: "2026-01-01",
    readingTime: 5,
    category: { name: "技术分享", slug: "tech" },
    tags: [],
  } as unknown as Post;
}

describe("BlogListView", () => {
  it("渲染传入的文章卡片", () => {
    const posts = [makePost("1"), makePost("2"), makePost("3")];
    render(
      <BlogListView
        locale="zh-CN"
        categories={categories}
        activeSlug={null}
        posts={posts}
        total={3}
        currentPage={1}
        pageSize={10}
        title="博客"
      />
    );
    expect(screen.getAllByTestId("article-card")).toHaveLength(3);
  });

  it("分页 totalPages = ceil(total/pageSize)", () => {
    render(
      <BlogListView
        locale="zh-CN"
        categories={categories}
        activeSlug={null}
        posts={[makePost("1")]}
        total={25}
        currentPage={2}
        pageSize={10}
        title="博客"
      />
    );
    expect(screen.getByTestId("pagination")).toHaveTextContent("2/3");
  });

  it("全部模式无文章时显示 blog.noPosts，不渲染分页", () => {
    render(
      <BlogListView
        locale="zh-CN"
        categories={categories}
        activeSlug={null}
        posts={[]}
        total={0}
        currentPage={1}
        pageSize={10}
        title="博客"
      />
    );
    expect(screen.getByText("blog.noPosts")).toBeInTheDocument();
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  it("分类模式无文章时显示 post.noCategoryPosts", () => {
    render(
      <BlogListView
        locale="zh-CN"
        categories={categories}
        activeSlug="tech"
        posts={[]}
        total={0}
        currentPage={1}
        pageSize={10}
        title="技术分享"
      />
    );
    expect(screen.getByText("post.noCategoryPosts")).toBeInTheDocument();
  });

  it("标题转 sr-only h1（不可见但保留），并渲染计数", () => {
    render(
      <BlogListView
        locale="zh-CN"
        categories={categories}
        activeSlug="tech"
        posts={[makePost("1")]}
        total={7}
        currentPage={1}
        pageSize={10}
        title="技术分享"
      />
    );
    const h1 = screen.getByRole("heading", { level: 1, name: "技术分享" });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveClass("sr-only");
    expect(screen.getByText("blog.totalPosts:7")).toBeInTheDocument();
  });
});
