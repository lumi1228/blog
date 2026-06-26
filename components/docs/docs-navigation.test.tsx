import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocsSidebar } from "./docs-sidebar";
import type { Post, ColumnChapter } from "@/lib/types";

function makePost(id: string, slug: string, title: string): Post {
  return {
    id,
    slug,
    title,
    excerpt: "",
    coverImage: null,
    category: { name: "前端", slug: "frontend" },
    tags: [],
    publishedAt: "2024-01-01",
    readingTime: 5,
  };
}

const chapters: (ColumnChapter & { posts: Post[] })[] = [
  {
    id: "ch1",
    columnId: "col1",
    sort: 1,
    title: "入门",
    posts: [makePost("p1", "intro", "介绍"), makePost("p2", "setup", "环境搭建")],
  },
  {
    id: "ch2",
    columnId: "col1",
    sort: 2,
    title: "进阶",
    posts: [makePost("p3", "advanced", "进阶用法")],
  },
];

describe("DocsSidebar", () => {
  it("文章链接指向 /docs/[set]/[slug]，当前文章高亮", () => {
    render(
      <DocsSidebar
        setSlug="react"
        setTitle="React 深入"
        chapters={chapters}
        currentPostSlug="setup"
        drawerLabel="文档目录"
      />
    );

    const setupLink = screen.getAllByText("环境搭建")[0].closest("a");
    expect(setupLink).toHaveAttribute("href", "/docs/react/setup");
    expect(setupLink?.className).toContain("text-[var(--accent-primary)]");

    const introLink = screen.getAllByText("介绍")[0].closest("a");
    expect(introLink).toHaveAttribute("href", "/docs/react/intro");
  });
});
