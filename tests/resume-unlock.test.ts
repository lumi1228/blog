/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// 可变的 mock 数据：门禁开关 + 授权码列表
let gateEnabled = true;
let codeRows: { code: string; expires_at: string | null; enabled: boolean }[] = [];

vi.mock("@/utils/supabase/server", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        // resume_settings 用 .limit().maybeSingle()
        limit: () => ({
          maybeSingle: async () => ({
            data: table === "resume_settings" ? { gate_enabled: gateEnabled } : null,
            error: null,
          }),
        }),
        // resume_access_codes 用 await select()
        then: (resolve: (v: any) => void) =>
          resolve({ data: table === "resume_access_codes" ? codeRows : [], error: null }),
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
    { code: "GOOD", expires_at: null, enabled: true },
    { code: "FUTURE", expires_at: future, enabled: true },
    { code: "EXPIRED", expires_at: past, enabled: true },
    { code: "DISABLED", expires_at: null, enabled: false },
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
