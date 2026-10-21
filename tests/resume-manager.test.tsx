import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResumeManager } from "@/components/admin/resume-manager";

const { updateMock, eqMock } = vi.hoisted(() => {
  const eq = vi.fn().mockResolvedValue({ error: null });
  return {
    eqMock: eq,
    updateMock: vi.fn(() => ({ eq })),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    from: () => ({ update: updateMock }),
  }),
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
  skills_zh: "技能一\n技能二",
  skills_en: "Skill 1\nSkill 2",
};

const baseProps = {
  profile,
  experiences: [],
  projects: [],
  settings: { id: "s1", gate_enabled: true, show_project_tech_stack: true },
  codes: [],
  siteAvatars: [],
};

describe("ResumeManager", () => {
  /**
   * --- @ty.aicoding@ ---
   */
  beforeEach(() => {
    updateMock.mockClear();
    eqMock.mockClear();
  });

  it("默认展示基本信息表单并回填姓名", () => {
    render(<ResumeManager {...baseProps} />);
    expect(screen.getByText("保存基本信息")).toBeInTheDocument();
    expect(screen.getByDisplayValue("张三")).toBeInTheDocument();
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("切换到专业技能 Tab 展示双语多行文本与保存按钮", () => {
    render(<ResumeManager {...baseProps} />);
    fireEvent.click(screen.getByText("专业技能"));
    const [skillsZh, skillsEn] = screen.getAllByRole("textbox");
    expect(skillsZh).toHaveValue("技能一\n技能二");
    expect(skillsEn).toHaveValue("Skill 1\nSkill 2");
    expect(screen.getByText("保存专业技能")).toBeInTheDocument();
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("保存专业技能时更新 resume_profile 的双语多行字段", async () => {
    render(<ResumeManager {...baseProps} />);
    fireEvent.click(screen.getByText("专业技能"));
    const [skillsZh] = screen.getAllByRole("textbox");
    fireEvent.change(skillsZh, { target: { value: "技能甲\n\n技能乙  " } });
    fireEvent.click(screen.getByText("保存专业技能"));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith({
        skills_zh: "技能甲\n\n技能乙",
        skills_en: "Skill 1\nSkill 2",
      });
      expect(eqMock).toHaveBeenCalledWith("id", "1");
    });
  });

  it("点击新增工作经历展示表单字段", () => {
    render(<ResumeManager {...baseProps} />);
    fireEvent.click(screen.getByText("工作经历"));
    fireEvent.click(screen.getByText("新增工作经历"));
    expect(screen.getByText("公司（中文）*")).toBeInTheDocument();
    expect(screen.getByText("工作要点（中文，每行一条）")).toBeInTheDocument();
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("工作经历 Tab 渲染每条经历的展示开关状态", () => {
    const experiences = [
      { id: "e1", sort: 0, is_visible: true, period: "2022-至今", company_zh: "某公司", company_en: null, role_zh: "前端工程师", role_en: null, highlights_zh: "负责平台建设", highlights_en: null },
      { id: "e2", sort: 1, is_visible: false, period: "2020-2022", company_zh: "历史公司", company_en: null, role_zh: "开发工程师", role_en: null, highlights_zh: null, highlights_en: null },
    ];
    render(<ResumeManager {...baseProps} experiences={experiences} />);
    fireEvent.click(screen.getByText("工作经历"));
    expect(screen.getByRole("switch", { name: /某公司/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("switch", { name: /历史公司/ })).toHaveAttribute("aria-checked", "false");
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("项目经验 Tab 渲染已有项目及展示开关状态", () => {
    const projects = [
      { id: "p1", sort: 0, is_visible: true, name_zh: "某中台系统", name_en: null, summary_zh: "中台", summary_en: null, tech_stack_zh: "React、TypeScript", tech_stack_en: null, contributions_zh: "a\nb", contributions_en: null },
      { id: "p2", sort: 1, is_visible: false, name_zh: "内部项目", name_en: null, summary_zh: null, summary_en: null, tech_stack_zh: null, tech_stack_en: null, contributions_zh: null, contributions_en: null },
    ];
    render(<ResumeManager {...baseProps} projects={projects} />);
    fireEvent.click(screen.getByText("项目经验"));
    expect(screen.getByText("某中台系统")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "前台展示项目技术栈" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("switch", { name: /某中台系统/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("switch", { name: /内部项目/ })).toHaveAttribute("aria-checked", "false");
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("新增项目表单在项目简介后提供双语技术栈字段", () => {
    render(<ResumeManager {...baseProps} />);
    fireEvent.click(screen.getByText("项目经验"));
    fireEvent.click(screen.getByText("新增项目"));
    expect(screen.getByText("技术栈（中文）")).toBeInTheDocument();
    expect(screen.getByText("技术栈（英文）")).toBeInTheDocument();
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("访问控制 Tab：门禁开启但无码时显示警告", () => {
    render(<ResumeManager {...baseProps} settings={{ id: "s1", gate_enabled: true, show_project_tech_stack: true }} codes={[]} />);
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
