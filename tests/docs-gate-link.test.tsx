import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// mock next/navigation 的 useRouter
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

// mock next-intl 翻译，返回 key 便于断言
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { DocsGateLink } from "@/components/docs/docs-gate-link";

function setUnlockedCookie(on: boolean) {
  // jsdom 下可写 document.cookie
  if (on) {
    document.cookie = "docs_unlocked=1";
  } else {
    document.cookie = "docs_unlocked=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

beforeEach(() => {
  push.mockReset();
  setUnlockedCookie(false);
});

afterEach(() => {
  setUnlockedCookie(false);
});

describe("DocsGateLink 入口拦截", () => {
  it("未解锁点击 → 阻止导航并弹出门禁弹框", () => {
    render(
      <DocsGateLink href="/zh-CN/docs/foo">进入</DocsGateLink>
    );
    fireEvent.click(screen.getByText("进入"));
    // 弹框出现（标题用 docsGate.title key）
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("已解锁点击 → 不弹框，走默认导航（不触发拦截 push）", () => {
    setUnlockedCookie(true);
    render(
      <DocsGateLink href="/zh-CN/docs/foo">进入</DocsGateLink>
    );
    fireEvent.click(screen.getByText("进入"));
    // 已解锁不拦截：不弹框
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
