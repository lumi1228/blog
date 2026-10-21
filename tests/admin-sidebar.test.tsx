/**
 * 后台侧边栏账号弹出菜单交互测试。
 * --- @ty.aicoding@ ---
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminSidebar } from "@/components/admin/sidebar";

const { pushMock, refreshMock, signOutMock, setThemeMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  signOutMock: vi.fn().mockResolvedValue(undefined),
  setThemeMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/resume",
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({ auth: { signOut: signOutMock } }),
}));

vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: setThemeMock }),
}));

describe("AdminSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("默认仅展示紧凑账号入口，点击后展开外观和退出操作", () => {
    render(<AdminSidebar userEmail="lumiva1228@gmail.com" />);

    expect(screen.queryByText("外观")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "打开账号菜单" }));

    expect(screen.getByText("外观")).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "浅色" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitem", { name: "退出登录" })).toBeInTheDocument();
  });

  it("可从弹出菜单切换深色主题", () => {
    render(<AdminSidebar userEmail="lumiva1228@gmail.com" />);
    fireEvent.click(screen.getByRole("button", { name: "打开账号菜单" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "深色" }));
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });

  it("退出登录后返回后台登录页", async () => {
    render(<AdminSidebar userEmail="lumiva1228@gmail.com" />);
    fireEvent.click(screen.getByRole("button", { name: "打开账号菜单" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "退出登录" }));

    await waitFor(() => expect(signOutMock).toHaveBeenCalled());
    expect(pushMock).toHaveBeenCalledWith("/admin/login");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("点击外部区域时关闭账号菜单", () => {
    render(<AdminSidebar userEmail="lumiva1228@gmail.com" />);
    fireEvent.click(screen.getByRole("button", { name: "打开账号菜单" }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByText("外观")).not.toBeInTheDocument();
  });
});
