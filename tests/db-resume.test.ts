/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- mock next/headers ----
vi.mock("next/headers", () => ({
  cookies: async () => ({}),
}));

// ---- mock supabase 客户端 ----
// 数据按表名提供；构造可链式调用且最终可 await 的 builder
let tableData: Record<string, any>;

function makeBuilder(table: string) {
  const result = { data: tableData[table] ?? null, error: null };
  const builder: any = {
    select: () => builder,
    order: () => Promise.resolve(result),
    eq: () => builder,
    limit: () => builder,
    maybeSingle: () =>
      Promise.resolve({
        data: Array.isArray(tableData[table])
          ? tableData[table][0] ?? null
          : tableData[table] ?? null,
        error: null,
      }),
  };
  return builder;
}

vi.mock("@/utils/supabase/server", () => ({
  createClient: () => ({
    from: (table: string) => makeBuilder(table),
  }),
}));

import { getResume } from "@/lib/db";

beforeEach(() => {
  tableData = {
    resume_profile: {
      avatar: "/p.png",
      phone: "123",
      email: "a@b.com",
      blog_url: "http://blog",
      name_zh: "张三",
      name_en: "Test User",
      certificate_zh: "软件设计师中级证书",
      certificate_en: null, // 用于验证 en 回退
      job_intention_zh: "web 前端开发工程师",
      job_intention_en: "Web Frontend Engineer",
      edu_zh: "某大学",
      edu_en: null,
    },
    resume_skills: [
      { id: "s1", content_zh: "技能一", content_en: "Skill 1" },
    ],
    resume_experiences: [
      {
        id: "e1",
        period: "2021.09-至今",
        company_zh: "某公司",
        company_en: "Some Co",
        role_zh: "工程师",
        role_en: "Engineer",
        highlights_zh: "  要点A\n要点B  \n\n要点C ",
        highlights_en: null,
      },
    ],
    resume_projects: [
      {
        id: "p1",
        name_zh: "项目甲",
        name_en: "Project A",
        summary_zh: "简介",
        summary_en: null,
        contributions_zh: "贡献1\n\n贡献2",
        contributions_en: null,
      },
    ],
  };
});

describe("getResume", () => {
  it("中文 locale 解析 _zh 字段", async () => {
    const r = await getResume("zh-CN");
    expect(r.profile?.name).toBe("张三");
    expect(r.profile?.certificate).toBe("软件设计师中级证书");
    expect(r.skills[0].content).toBe("技能一");
    expect(r.experiences[0].company).toBe("某公司");
    expect(r.projects[0].name).toBe("项目甲");
  });

  it("英文 locale 解析 _en，缺失时回退 _zh", async () => {
    const r = await getResume("en");
    expect(r.profile?.name).toBe("Test User");
    // certificate_en 为 null，回退到 zh
    expect(r.profile?.certificate).toBe("软件设计师中级证书");
    expect(r.profile?.edu).toBe("某大学"); // edu_en null 回退
    expect(r.skills[0].content).toBe("Skill 1");
    expect(r.experiences[0].company).toBe("Some Co");
    expect(r.projects[0].name).toBe("Project A");
  });

  it("要点/贡献字段按行拆分并去除空白与空行", async () => {
    const r = await getResume("zh-CN");
    expect(r.experiences[0].highlights).toEqual(["要点A", "要点B", "要点C"]);
    expect(r.projects[0].contributions).toEqual(["贡献1", "贡献2"]);
  });

  it("highlights_en 缺失时回退到中文并正常拆分", async () => {
    const r = await getResume("en");
    expect(r.experiences[0].highlights).toEqual(["要点A", "要点B", "要点C"]);
  });
});
