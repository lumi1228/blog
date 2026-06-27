import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResumeManager } from "@/components/admin/resume-manager";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({}),
}));

const profile = {
  id: "1",
  avatar: "/p.png",
  phone: "123",
  email: "a@b.com",
  blog_url: "http://b",
  name_zh: "张三",
  name_en: "Test",
  certificate_zh: "证书",
  certificate_en: null,
  job_intention_zh: "前端",
  job_intention_en: null,
  edu_zh: "某大学",
  edu_en: null,
};

const baseProps = {
  profile,
  skills: [],
  experiences: [],
  projects: [],
  settings: { id: "s1", gate_enabled: true },
  codes: [],
  siteAvatars: [],
};

describe("ResumeManager", () => {
  it("默认展示基本信息表单并回填姓名", () => {
    render(<ResumeManager {...baseProps} />);
    expect(screen.getByText("保存基本信息")).toBeInTheDocument();
    expect(screen.getByDisplayValue("张三")).toBeInTheDocument();
  });

  it("切换到专业技能 Tab 展示新增按钮与空状态", () => {
    render(<ResumeManager {...baseProps} />);
    fireEvent.click(screen.getByText("专业技能"));
    expect(screen.getByText("新增技能")).toBeInTheDocument();
    expect(screen.getByText("暂无数据，点击上方按钮新增")).toBeInTheDocument();
  });

  it("点击新增工作经历展示表单字段", () => {
    render(<ResumeManager {...baseProps} />);
    fireEvent.click(screen.getByText("工作经历"));
    fireEvent.click(screen.getByText("新增工作经历"));
    expect(screen.getByText("公司（中文）*")).toBeInTheDocument();
    expect(screen.getByText("工作要点（中文，每行一条）")).toBeInTheDocument();
  });

  it("项目经验 Tab 渲染已有项目", () => {
    const projects = [
      { id: "p1", sort: 0, name_zh: "某中台系统", name_en: null, summary_zh: "中台", summary_en: null, contributions_zh: "a\nb", contributions_en: null },
    ];
    render(<ResumeManager {...baseProps} projects={projects} />);
    fireEvent.click(screen.getByText("项目经验"));
    expect(screen.getByText("某中台系统")).toBeInTheDocument();
  });

  it("访问控制 Tab：门禁开启但无码时显示警告", () => {
    render(<ResumeManager {...baseProps} settings={{ id: "s1", gate_enabled: true }} codes={[]} />);
    fireEvent.click(screen.getByText("访问控制"));
    expect(screen.getByText("简历访问门禁")).toBeInTheDocument();
    expect(screen.getByText(/访客将无法查看简历/)).toBeInTheDocument();
    expect(screen.getByText("新增授权码")).toBeInTheDocument();
  });

  it("访问控制 Tab：渲染已有授权码并标注长期/已过期", () => {
    const codes = [
      { id: "c1", code: "GOOD", label: "给HR", expires_at: null, enabled: true, created_at: "2025-01-01" },
      { id: "c2", code: "OLD", label: null, expires_at: "2000-01-01T23:59:59Z", enabled: true, created_at: "2025-01-01" },
    ];
    render(<ResumeManager {...baseProps} codes={codes} />);
    fireEvent.click(screen.getByText("访问控制"));
    expect(screen.getByText("GOOD")).toBeInTheDocument();
    expect(screen.getByText("长期")).toBeInTheDocument();
    expect(screen.getByText("已过期")).toBeInTheDocument();
  });
});
