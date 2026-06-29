import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));
vi.mock("@/components/search/SearchTrigger", () => ({
  SearchTrigger: () => <div data-testid="search-trigger" />,
}));
vi.mock("@/components/docs/docs-gate-link", () => ({
  DocsGateLink: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

import { NavbarClient, type NavItem } from "@/components/navbar-client";

const navItems: NavItem[] = [
  { type: "link", href: "/", label: "首页" },
  {
    type: "dropdown",
    label: "博客",
    href: "/blog",
    children: [
      { href: "/category/ai", label: "AI趋势" },
      { href: "/category/tech", label: "技术分享" },
    ],
  },
  { type: "link", href: "/docs", label: "知识库", gated: true },
];

describe("NavbarClient 博客下拉入口", () => {
  it("「博客」父级渲染为指向 /blog 的链接", () => {
    render(<NavbarClient navItems={navItems} locale="zh-CN" />);
    const blogLink = screen.getByText("博客").closest("a");
    expect(blogLink).toHaveAttribute("href", "/blog");
  });

  it("hover 展开后下拉子项只含分类（不含「全部博客」）", () => {
    render(<NavbarClient navItems={navItems} locale="zh-CN" />);
    // 默认折叠，hover 父级容器展开子项
    const wrapper = screen.getByText("博客").closest("div");
    fireEvent.mouseEnter(wrapper!);

    expect(screen.queryByText("全部博客")).not.toBeInTheDocument();
    expect(screen.getByText("AI趋势").closest("a")).toHaveAttribute(
      "href",
      "/category/ai"
    );
    expect(screen.getByText("技术分享").closest("a")).toHaveAttribute(
      "href",
      "/category/tech"
    );
  });
});
