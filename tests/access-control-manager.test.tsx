/**
 * 资源级访问控制后台组件测试。
 * --- @ty.aicoding@ ---
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AccessControlManager } from "@/components/admin/access-control-manager";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({}),
}));

const settings = [
  { resource: "resume" as const, enabled: true, session_ttl_seconds: 604800, updated_at: null },
  { resource: "docs" as const, enabled: true, session_ttl_seconds: 604800, updated_at: null },
];

describe("AccessControlManager", () => {
  it("分别展示简历与知识库门禁开关", () => {
    render(<AccessControlManager settings={settings} codes={[]} />);
    expect(screen.getByRole("switch", { name: "简历访问门禁" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("switch", { name: "知识库访问门禁" })).toHaveAttribute("aria-checked", "true");
  });

  it("按资源分别提示门禁开启但没有有效授权码", () => {
    render(<AccessControlManager settings={settings} codes={[]} />);
    expect(screen.getByText(/简历门禁已开启/)).toBeInTheDocument();
    expect(screen.getByText(/知识库门禁已开启/)).toBeInTheDocument();
  });

  it("授权码列表展示对应资源范围", () => {
    render(
      <AccessControlManager
        settings={settings}
        codes={[{
          id: "c1",
          code: "RESUME-ONLY",
          label: "招聘",
          expires_at: null,
          enabled: true,
          created_at: "2026-01-01",
          resources: ["resume"],
        }]}
      />
    );
    expect(screen.getByText("RESUME-ONLY")).toBeInTheDocument();
    expect(screen.getByText("简历")).toBeInTheDocument();
    expect(screen.getByText(/知识库门禁已开启/)).toBeInTheDocument();
    expect(screen.queryByText(/简历门禁已开启/)).not.toBeInTheDocument();
  });

  it("新增表单要求选择授权码的可访问范围", () => {
    render(<AccessControlManager settings={settings} codes={[]} />);
    fireEvent.click(screen.getByText("新增授权码"));
    expect(screen.getByText("可访问范围 *")).toBeInTheDocument();
    expect(screen.getByLabelText("简历")).toBeChecked();
    expect(screen.getByLabelText("知识库")).toBeChecked();
  });
});
