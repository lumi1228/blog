import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps } from "react";
import messages from "@/messages/zh-CN.json";
import { DocsSidebar } from "./docs-sidebar";
import { DocsTopbar } from "./docs-topbar";
import type { DocsDirectoryChapter } from "@/lib/types";

const navigation = vi.hoisted(() => ({ pathname: "/docs/react/setup" }));
vi.mock("@/i18n/routing", () => ({
  Link: ({ children, ...props }: ComponentProps<"a">) => <a {...props}>{children}</a>,
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/components/search/SearchTrigger", () => ({ SearchTrigger: () => null }));

const chapters: DocsDirectoryChapter[] = [
  {
    id: "ch1",
    columnId: "col1",
    sort: 1,
    title: "入门",
    posts: [{ id: "p1", slug: "intro", title: "介绍" }, { id: "p2", slug: "setup", title: "环境搭建" }],
  },
  {
    id: "ch2",
    columnId: "col1",
    sort: 2,
    title: "进阶",
    posts: [{ id: "p3", slug: "advanced", title: "进阶用法" }],
  },
];

/**
 * --- @ty.aicoding@ ---
 */
function sidebar() {
  return <NextIntlClientProvider locale="zh-CN" messages={messages}>
    <DocsSidebar setSlug="react" setTitle="React 深入" chapters={chapters} drawerLabel="文档目录" />
  </NextIntlClientProvider>;
}

beforeEach(() => { navigation.pathname = "/docs/react/setup"; });

describe("DocsSidebar", () => {
  it("文章链接保持原 URL，当前文章高亮，章节标题链接到章节目录", () => {
    render(sidebar());
    const setupLink = screen.getByRole("link", { name: "环境搭建" });
    expect(setupLink).toHaveAttribute("href", "/docs/react/setup");
    expect(setupLink).toHaveAttribute("aria-current", "page");
    const introLink = screen.getByRole("link", { name: "介绍" });
    expect(introLink).toHaveAttribute("href", "/docs/react/intro");
    expect(screen.getByRole("link", { name: "入门" })).toHaveAttribute("href", "/docs/react/chapters/ch1");
    expect(screen.getByRole("button", { name: "收起 入门" })).toHaveAttribute("aria-expanded", "true");
  });

  it("展开箭头只控制列表，折叠时不再有可聚焦文章链接", () => {
    render(sidebar());
    fireEvent.click(screen.getByRole("button", { name: "收起 入门" }));
    expect(screen.queryByRole("link", { name: "环境搭建" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "入门" })).toHaveAttribute("href", "/docs/react/chapters/ch1");
    fireEvent.click(screen.getByRole("button", { name: "展开 进阶" }));
    expect(screen.getByRole("link", { name: "进阶用法" })).toHaveAttribute("href", "/docs/react/advanced");
    expect(navigation.pathname).toBe("/docs/react/setup");
  });

  it("共享侧栏随客户端路由更新，目录页不高亮任意文章", () => {
    const view = render(sidebar());
    fireEvent.click(screen.getByRole("button", { name: "收起 入门" }));
    navigation.pathname = "/docs/react/chapters/ch2";
    view.rerender(sidebar());
    expect(screen.getByRole("link", { name: "进阶" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "收起 进阶" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "进阶用法" })).not.toHaveAttribute("aria-current");
    navigation.pathname = "/docs/react";
    view.rerender(sidebar());
    expect(screen.getByRole("link", { name: "概览" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "进阶用法" })).not.toBeInTheDocument();
  });

  it("移动抽屉中的章节链接关闭抽屉并恢复页面滚动", () => {
    render(sidebar());
    fireEvent.click(screen.getByRole("button", { name: "文档目录" }));
    const dialog = screen.getByRole("dialog", { name: "文档目录" });
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(within(dialog).getByRole("link", { name: "进阶" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });
});

describe("DocsTopbar", () => {
  it("桌面和移动端知识库切换均链接目录页", () => {
    render(<DocsTopbar tabs={[{ slug: "react", title: "React 深入" }, { slug: "next", title: "Next.js" }]} locale="zh-CN" docsLabel="知识库" />);
    expect(screen.getByRole("link", { name: "React 深入" })).toHaveAttribute("href", "/docs/react");
    expect(screen.getByRole("link", { name: "Next.js" })).toHaveAttribute("href", "/docs/next");
    fireEvent.click(screen.getByRole("button", { name: "知识库" }));
    expect(screen.getAllByRole("link", { name: "Next.js" })).toHaveLength(2);
    for (const link of screen.getAllByRole("link", { name: "Next.js" })) {
      expect(link).toHaveAttribute("href", "/docs/next");
    }
  });
});
