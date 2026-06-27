/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResumeModal } from "@/components/resume-modal";
import type { ResumeData } from "@/lib/types";

// next-intl：返回 key 透传 + 固定 locale
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "zh-CN",
}));

// 导出 PDF 依赖：mock 掉，断言生成与下载链路被调用
const save = vi.fn();
const addImage = vi.fn();
const addPage = vi.fn();
vi.mock("jspdf", () => ({
  default: class {
    internal = { pageSize: { getWidth: () => 595, getHeight: () => 842 } };
    addImage = addImage;
    addPage = addPage;
    save = save;
  },
}));
vi.mock("html2canvas-pro", () => ({
  default: vi.fn().mockResolvedValue({
    width: 800,
    height: 1000,
    toDataURL: () => "data:image/png;base64,AAAA",
  }),
}));

const resume: ResumeData = {
  profile: {
    avatar: "https://cdn.example.com/p.png",
    phone: "13800000000",
    email: "a@b.com",
    blogUrl: "http://blog",
    name: "张三",
    certificate: "软件设计师中级证书",
    jobIntention: "web 前端开发工程师",
    edu: "某大学 某专业",
  },
  skills: [{ id: "s1", content: "熟练掌握 HTML、CSS、JS" }],
  experiences: [
    { id: "e1", period: "2021.09-至今", company: "某公司", role: "前端", highlights: ["要点A"] },
  ],  projects: [{ id: "p1", name: "某中台系统", summary: "一站式平台", contributions: ["贡献1"] }],
};

const resp = (ok: boolean, status: number, body: unknown) => ({
  ok,
  status,
  json: async () => body,
});

// 门禁/响应可配置：probe（无码）与解锁（带码）走同一 mock，按 body 区分
let fetchConfig: { gateOpen: boolean; codeStatus?: number };

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    fillStyle: "",
  })) as unknown as HTMLCanvasElement["getContext"];
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,AAAA");
});

beforeEach(() => {
  save.mockClear();
  addImage.mockClear();
  fetchConfig = { gateOpen: true };
  (global.fetch as any) = vi.fn(async (_url: string, init: any) => {
    const body = JSON.parse(init.body);
    if (!fetchConfig.gateOpen) return resp(true, 200, { resume });
    if (!body.code) return resp(false, 401, { error: "code_required" });
    if (fetchConfig.codeStatus === 429) return resp(false, 429, { error: "too_many_attempts" });
    if (body.code === "right") return resp(true, 200, { resume });
    return resp(false, 401, { error: "invalid_code" });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ResumeModal（授权码门禁 + 打开探测）", () => {
  it("默认仅渲染触发按钮", () => {
    render(<ResumeModal />);
    expect(screen.getByText("viewResume")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("门禁开启：打开后显示授权码输入，不展示简历/导出", async () => {
    render(<ResumeModal />);
    fireEvent.click(screen.getByText("viewResume"));
    await screen.findByLabelText("codePlaceholder");
    expect(screen.getByText("lockTitle")).toBeInTheDocument();
    expect(screen.queryByText("张三")).not.toBeInTheDocument();
    expect(screen.queryByText("export")).not.toBeInTheDocument();
  });

  it("门禁关闭：打开后直接展示简历，无需输码", async () => {
    fetchConfig.gateOpen = false;
    render(<ResumeModal />);
    fireEvent.click(screen.getByText("viewResume"));
    await waitFor(() => expect(screen.getByText("张三")).toBeInTheDocument());
    expect(screen.queryByLabelText("codePlaceholder")).not.toBeInTheDocument();
  });

  it("授权码错误显示错误提示", async () => {
    render(<ResumeModal />);
    fireEvent.click(screen.getByText("viewResume"));
    const input = await screen.findByLabelText("codePlaceholder");
    fireEvent.change(input, { target: { value: "wrong" } });
    fireEvent.click(screen.getByText("unlock"));
    await waitFor(() => expect(screen.getByText("wrongCode")).toBeInTheDocument());
    expect(screen.queryByText("张三")).not.toBeInTheDocument();
  });

  it("尝试过多显示限流提示", async () => {
    fetchConfig.codeStatus = 429;
    render(<ResumeModal />);
    fireEvent.click(screen.getByText("viewResume"));
    const input = await screen.findByLabelText("codePlaceholder");
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.click(screen.getByText("unlock"));
    await waitFor(() => expect(screen.getByText("tooMany")).toBeInTheDocument());
  });

  it("授权码正确后渲染简历并可导出 PDF", async () => {
    render(<ResumeModal />);
    fireEvent.click(screen.getByText("viewResume"));
    const input = await screen.findByLabelText("codePlaceholder");
    fireEvent.change(input, { target: { value: "right" } });
    fireEvent.click(screen.getByText("unlock"));
    await waitFor(() => expect(screen.getByText("张三")).toBeInTheDocument());
    expect(document.getElementById("resume-print-area")).toBeTruthy();
    fireEvent.click(screen.getByText("export"));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  });

  it("关闭后再次打开需重新输入（不记忆）", async () => {
    render(<ResumeModal />);
    fireEvent.click(screen.getByText("viewResume"));
    const input = await screen.findByLabelText("codePlaceholder");
    fireEvent.change(input, { target: { value: "right" } });
    fireEvent.click(screen.getByText("unlock"));
    await waitFor(() => expect(screen.getByText("张三")).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText("close"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("viewResume"));
    await screen.findByLabelText("codePlaceholder");
    expect(screen.queryByText("张三")).not.toBeInTheDocument();
  });
});
