import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// mock next-intl 翻译：返回带前缀的 key 便于断言
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `blog.${key}`,
}));

// mock i18n routing 的 Link 为普通 <a>
vi.mock("@/i18n/routing", () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { BlogTabs } from "@/components/blog-tabs";
import type { Category } from "@/lib/types";

const categories: Category[] = [
  { id: "1", slug: "ai", name: "AI趋势" },
  { id: "2", slug: "tech", name: "技术分享" },
];

describe("BlogTabs", () => {
  it("渲染「全部」+ 每个分类，共 N+1 个 Tab", () => {
    render(<BlogTabs categories={categories} activeSlug={null} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(categories.length + 1);
  });

  it("「全部」Tab 链接指向 /blog", () => {
    render(<BlogTabs categories={categories} activeSlug={null} />);
    const allTab = screen.getByText("blog.allTab");
    expect(allTab).toHaveAttribute("href", "/blog");
  });

  it("分类 Tab 链接指向 /category/[slug]", () => {
    render(<BlogTabs categories={categories} activeSlug="tech" />);
    expect(screen.getByText("技术分享")).toHaveAttribute("href", "/category/tech");
  });

  it("activeSlug=null 时「全部」带 aria-current=page", () => {
    render(<BlogTabs categories={categories} activeSlug={null} />);
    expect(screen.getByText("blog.allTab")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("AI趋势")).not.toHaveAttribute("aria-current");
  });

  it("activeSlug=分类 时对应分类 Tab 高亮，「全部」不高亮", () => {
    render(<BlogTabs categories={categories} activeSlug="ai" />);
    expect(screen.getByText("AI趋势")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("blog.allTab")).not.toHaveAttribute("aria-current");
  });
});
