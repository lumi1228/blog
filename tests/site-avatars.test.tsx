/**
 * 主站头像功能测试
 *
 * 分两部分：
 * 1. getRandomSiteAvatar — 服务端随机查询逻辑单元测试
 * 2. SiteAvatarsSection — 后台头像 Tab 渲染测试（通过 ResumeManager 入口）
 */

// ============================================================
// Part 1 — getRandomSiteAvatar 单元测试
// ============================================================

import { describe, it, expect, vi, beforeEach } from "vitest";

// mock Supabase 查询链：supabase.from().select().eq() → { data, error }
const mockEq = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: mockEq,
      })),
    })),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  })),
  createAdminClient: vi.fn(() => ({})),
}));

import { getRandomSiteAvatar } from "@/lib/db";

describe("getRandomSiteAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空列表时返回 null", async () => {
    mockEq.mockResolvedValue({ data: [], error: null });
    expect(await getRandomSiteAvatar()).toBeNull();
  });

  it("查询报错时返回 null", async () => {
    mockEq.mockResolvedValue({ data: null, error: new Error("db error") });
    expect(await getRandomSiteAvatar()).toBeNull();
  });

  it("data 为 null 时返回 null", async () => {
    mockEq.mockResolvedValue({ data: null, error: null });
    expect(await getRandomSiteAvatar()).toBeNull();
  });

  it("只有一张时返回该张的 url", async () => {
    mockEq.mockResolvedValue({
      data: [{ url: "https://cdn.example.com/avatar-1.png" }],
      error: null,
    });
    expect(await getRandomSiteAvatar()).toBe("https://cdn.example.com/avatar-1.png");
  });

  it("多张时返回列表内的某张 url（随机但合法）", async () => {
    const urls = [
      "https://cdn.example.com/a1.png",
      "https://cdn.example.com/a2.png",
      "https://cdn.example.com/a3.png",
    ];
    mockEq.mockResolvedValue({ data: urls.map((url) => ({ url })), error: null });
    const result = await getRandomSiteAvatar();
    expect(urls).toContain(result);
  });

  it("多次调用均返回列表内的合法 url（边界覆盖）", async () => {
    const urls = ["https://cdn.example.com/x.png", "https://cdn.example.com/y.png"];
    mockEq.mockResolvedValue({ data: urls.map((url) => ({ url })), error: null });
    for (let i = 0; i < 20; i++) {
      const result = await getRandomSiteAvatar();
      expect(urls).toContain(result);
    }
  });
});

// ============================================================
// Part 2 — SiteAvatarsSection 渲染测试（通过 ResumeManager）
// ============================================================

import { render, screen, fireEvent } from "@testing-library/react";
import { ResumeManager } from "@/components/admin/resume-manager";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({}),
}));

const baseManagerProps = {
  profile: null,
  skills: [],
  experiences: [],
  projects: [],
  settings: null,
  codes: [],
  siteAvatars: [],
};

describe("ResumeManager — 主站头像 Tab", () => {
  it("Tab 标签「主站头像」存在", () => {
    render(<ResumeManager {...baseManagerProps} />);
    expect(screen.getByText("主站头像")).toBeInTheDocument();
  });

  it("空头像时切换到 Tab 显示说明区域和空状态提示", () => {
    render(<ResumeManager {...baseManagerProps} />);
    fireEvent.click(screen.getByText("主站头像"));
    expect(screen.getByText("主站头像池")).toBeInTheDocument();
    expect(screen.getByText("暂无头像，点击下方按钮上传第一张")).toBeInTheDocument();
  });

  it("空头像时显示上传按钮", () => {
    render(<ResumeManager {...baseManagerProps} />);
    fireEvent.click(screen.getByText("主站头像"));
    expect(screen.getByText("上传头像")).toBeInTheDocument();
  });

  it("有头像时渲染头像列表和操作按钮", () => {
    const siteAvatars = [
      { id: "a1", url: "https://cdn.example.com/a.png", label: "日常版", enabled: true, created_at: "2025-01-01" },
      { id: "a2", url: "https://cdn.example.com/b.png", label: null, enabled: false, created_at: "2025-01-02" },
    ];
    render(<ResumeManager {...baseManagerProps} siteAvatars={siteAvatars} />);
    fireEvent.click(screen.getByText("主站头像"));
    // 有标签的显示标签，无标签显示 —
    expect(screen.getByText("日常版")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    // 每张各有一个删除按钮
    expect(screen.getAllByText("删除")).toHaveLength(2);
    // 上传按钮仍然存在
    expect(screen.getByText("上传头像")).toBeInTheDocument();
  });

  it("启用状态正确：已启用显示「停用」按钮，已停用显示「启用」按钮", () => {
    const siteAvatars = [
      { id: "a1", url: "https://cdn.example.com/a.png", label: null, enabled: true, created_at: "2025-01-01" },
      { id: "a2", url: "https://cdn.example.com/b.png", label: null, enabled: false, created_at: "2025-01-02" },
    ];
    render(<ResumeManager {...baseManagerProps} siteAvatars={siteAvatars} />);
    fireEvent.click(screen.getByText("主站头像"));

    // 第一张（启用）：角标 span「启用」+ 操作 button「停用」
    // 第二张（停用）：角标 span「停用」+ 操作 button「启用」
    // 因此「停用」和「启用」各出现两次（badge + button）
    expect(screen.getAllByText("停用")).toHaveLength(2);
    expect(screen.getAllByText("启用")).toHaveLength(2);
    // 操作按钮应各有 1 个
    expect(screen.getAllByRole("button", { name: "停用" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "启用" })).toHaveLength(1);
  });

  it("已启用/总数统计数字正确", () => {
    const siteAvatars = [
      { id: "a1", url: "https://cdn.example.com/a.png", label: null, enabled: true, created_at: "2025-01-01" },
      { id: "a2", url: "https://cdn.example.com/b.png", label: null, enabled: true, created_at: "2025-01-02" },
      { id: "a3", url: "https://cdn.example.com/c.png", label: null, enabled: false, created_at: "2025-01-03" },
    ];
    render(<ResumeManager {...baseManagerProps} siteAvatars={siteAvatars} />);
    fireEvent.click(screen.getByText("主站头像"));
    // 已启用 2 张 / 共 3 张 — span 内纯数字
    const numSpans = screen.getAllByText(/^\d+$/);
    const numbers = numSpans.map((el) => el.textContent);
    expect(numbers).toContain("2");
    expect(numbers).toContain("3");
  });
});
