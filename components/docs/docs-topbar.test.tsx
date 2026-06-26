import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocsTopbar, type DocsTab } from "./docs-topbar";

// 受控的 pathname，用于测试激活态
let mockPathname = "/docs";

vi.mock("@/i18n/routing", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ replace: vi.fn() }),
}));

// 子组件桩，避免引入 theme/intl provider 依赖
vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle" />,
}));
vi.mock("@/components/search/SearchTrigger", () => ({
  SearchTrigger: () => <button data-testid="search-trigger" />,
}));

const tabs: DocsTab[] = [
  { slug: "react", title: "React 深入" },
  { slug: "node", title: "Node 实战" },
  { slug: "css", title: "CSS 艺术" },
];

describe("DocsTopbar", () => {
  beforeEach(() => {
    mockPathname = "/docs";
  });

  it("传入多个文档集时渲染对应数量的 Tab（桌面 + 移动各一份链接）", () => {
    render(<DocsTopbar tabs={tabs} locale="zh-CN" docsLabel="文档" />);
    // 每个 Tab 在桌面导航和移动下拉里各有一个 Link，但移动下拉默认未展开，
    // 因此默认只渲染桌面端的一组。
    tabs.forEach((tab) => {
      expect(screen.getByText(tab.title)).toBeInTheDocument();
    });
  });

  it("当前路径对应的文档集 Tab 高亮（accent 边框）", () => {
    mockPathname = "/docs/node/some-post";
    render(<DocsTopbar tabs={tabs} locale="zh-CN" docsLabel="文档" />);

    const activeLink = screen.getByText("Node 实战").closest("a");
    expect(activeLink?.className).toContain("border-[var(--accent-primary)]");

    const inactiveLink = screen.getByText("React 深入").closest("a");
    expect(inactiveLink?.className).toContain("border-transparent");
  });

  it("无文档集时不渲染 Tab 导航", () => {
    const { container } = render(
      <DocsTopbar tabs={[]} locale="zh-CN" docsLabel="文档" />
    );
    // 顶部 logo 仍在，但没有任何 Tab 文本
    expect(screen.getByText("文档")).toBeInTheDocument();
    expect(container.querySelector('nav[aria-label="文档"]')).toBeNull();
  });

  it("渲染文档标识、搜索与主题切换", () => {
    render(<DocsTopbar tabs={tabs} locale="zh-CN" docsLabel="文档" />);
    expect(screen.getByTestId("search-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });
});
