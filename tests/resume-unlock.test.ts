import { describe, it, expect, vi, beforeEach } from "vitest";

// 可变的 mock 数据：门禁开关 + 授权码列表
let gateEnabled = true;
let codeRows: { code: string; expires_at: string | null; enabled: boolean; resources: string[] }[] = [];

vi.mock("@/utils/supabase/server", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: (_column: string, value: string) =>
          table === "access_gate_settings"
            ? {
                maybeSingle: async () => ({
                  data: { enabled: gateEnabled, session_ttl_seconds: 604800 },
                  error: null,
                }),
              }
            : Promise.resolve({
                data: table === "access_codes"
                  ? codeRows.filter((row) => row.resources.includes(value))
                  : [],
                error: null,
              }),
      }),
    }),
  }),
}));

vi.mock("@/lib/db", () => ({
  getResume: vi.fn().mockResolvedValue({
    profile: { name: "张三" },
    skills: [],
    experiences: [],
    projects: [],
  }),
}));

import { POST } from "@/app/api/resume/unlock/route";

function req(body: unknown, ip = "1.1.1.1") {
  return new Request("http://localhost/api/resume/unlock", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0];
}

const future = new Date(Date.now() + 864e5).toISOString();
const past = new Date(Date.now() - 864e5).toISOString();

beforeEach(() => {
  gateEnabled = true;
  codeRows = [
    { code: "GOOD", expires_at: null, enabled: true, resources: ["resume"] },
    { code: "FUTURE", expires_at: future, enabled: true, resources: ["resume"] },
    { code: "EXPIRED", expires_at: past, enabled: true, resources: ["resume"] },
    { code: "DISABLED", expires_at: null, enabled: false, resources: ["resume"] },
    { code: "DOCS-ONLY", expires_at: null, enabled: true, resources: ["docs"] },
  ];
});

describe("POST /api/resume/unlock（DB 门禁）", () => {
  it("门禁关闭时无需授权码直接返回简历", async () => {
    gateEnabled = false;
    const res = await POST(req({}, "10.1.0.1"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.resume?.profile?.name).toBe("张三");
  });

  it("门禁开启 + 未传码 → 401 code_required", async () => {
    const res = await POST(req({}, "10.1.0.2"));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("code_required");
  });

  it("有效长期码返回 200", async () => {
    const res = await POST(req({ code: "GOOD" }, "10.1.0.3"));
    expect(res.status).toBe(200);
  });

  it("未过期的限期码返回 200", async () => {
    const res = await POST(req({ code: "FUTURE" }, "10.1.0.4"));
    expect(res.status).toBe(200);
  });

  it("已过期码返回 401", async () => {
    const res = await POST(req({ code: "EXPIRED" }, "10.1.0.5"));
    expect(res.status).toBe(401);
  });

  it("已停用码返回 401", async () => {
    const res = await POST(req({ code: "DISABLED" }, "10.1.0.6"));
    expect(res.status).toBe(401);
  });

  it("错误码返回 401", async () => {
    const res = await POST(req({ code: "NOPE" }, "10.1.0.7"));
    expect(res.status).toBe(401);
  });

  it("只有知识库范围的授权码不能解锁简历", async () => {
    const res = await POST(req({ code: "DOCS-ONLY" }, "10.1.0.8"));
    expect(res.status).toBe(401);
  });

  it("同一 IP 错误码尝试过多触发 429", async () => {
    const ip = "10.1.0.99";
    let last = 0;
    for (let i = 0; i < 11; i++) {
      const res = await POST(req({ code: "NOPE" }, ip));
      last = res.status;
    }
    expect(last).toBe(429);
  });
});
