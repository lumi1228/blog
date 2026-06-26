import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavbarClient, type NavItem } from "./navbar-client";

vi.mock("@/i18n/routing", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle" />,
}));
vi.mock("@/components/search/SearchTrigger", () => ({
  SearchTrigger: () => <button data-testid="search-trigger" />,
}));

const navItems: NavItem[] = [
  { type: "link", href: "/", label: "首页" },
  { type: "link", href: "/category/frontend", label: "前端" },
  { type: "link", href: "/docs", label: "文档" },
  { type: "link", href: "/about", label: "关于" },
];

describe("NavbarClient", () => {
  it("渲染「文档」入口且指向 /docs（桌面端）", () => {
    render(<NavbarClient navItems={navItems} locale="zh-CN" />);
    const docsLinks = screen
      .getAllByText("文档")
      .map((el) => el.closest("a"))
      .filter(Boolean);
    expect(docsLinks.length).toBeGreaterThan(0);
    expect(docsLinks[0]).toHaveAttribute("href", "/docs");
  });

  it("不再渲染专栏下拉按钮", () => {
    render(<NavbarClient navItems={navItems} locale="zh-CN" />);
    // 「文档」应是链接而非展开下拉的按钮
    const docsEl = screen.getAllByText("文档")[0];
    expect(docsEl.closest("a")).not.toBeNull();
  });
});
