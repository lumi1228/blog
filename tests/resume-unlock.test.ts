import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/**
 * --- @ty.aicoding@ ---
 */
beforeAll(() => {
  process.env.DOCS_GATE_SECRET = "test-secret-for-resume-unlock";
});

// 可变的 mock 数据：门禁开关 + 授权码列表
let gateEnabled = true;
let gateTtlSeconds = 604800;
let codeRows: { code: string; expires_at: string | null; enabled: boolean; resources: string[] }[] = [];

vi.mock("@/utils/supabase/server", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: (_column: string, value: string) =>
          table === "access_gate_settings"
            ? {
                maybeSingle: async () => ({
                  data: { enabled: gateEnabled, session_ttl_seconds: gateTtlSeconds },
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
import { RESUME_GATE_COOKIE, signToken, verifyToken } from "@/lib/docs-gate";

/**
 * 构造可选携带简历凭证的解锁请求。
 * --- @ty.aicoding@ ---
 */
function req(body: unknown, ip = "1.1.1.1", token?: string) {
  const request = new NextRequest("http://localhost/api/resume/unlock", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
  if (token) request.cookies.set(RESUME_GATE_COOKIE, token);
  return request;
}

const future = new Date(Date.now() + 864e5).toISOString();
const past = new Date(Date.now() - 864e5).toISOString();

/**
 * --- @ty.aicoding@ ---
 */
beforeEach(() => {
  gateEnabled = true;
  gateTtlSeconds = 604800;
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

  /**
   * --- @ty.aicoding@ ---
   */
  it("门禁开启 + 未传码 → 401，并附带简历自己的免验证时长", async () => {
    gateTtlSeconds = 259200;
    const res = await POST(req({}, "10.1.0.2"));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("code_required");
    expect(json.sessionTtlSeconds).toBe(259200);
    expect(json.resume).toBeUndefined();
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("有效长期码返回 200，并签发独立的简历凭证", async () => {
    const res = await POST(req({ code: "GOOD" }, "10.1.0.3"));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    const cookie = res.cookies.get(RESUME_GATE_COOKIE);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.maxAge).toBe(604800);
    expect(await verifyToken(cookie?.value, "resume")).toBe(true);
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("未过期的限期码返回 200，且会话不超过授权码剩余有效期", async () => {
    const res = await POST(req({ code: "FUTURE" }, "10.1.0.4"));
    expect(res.status).toBe(200);
    const maxAge = res.cookies.get(RESUME_GATE_COOKIE)?.maxAge ?? 0;
    expect(maxAge).toBeGreaterThan(86000);
    expect(maxAge).toBeLessThanOrEqual(86400);
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("持有效简历凭证时无需再次输入授权码", async () => {
    const token = await signToken("resume", 60_000);
    const res = await POST(req({}, "10.1.0.41", token));
    expect(res.status).toBe(200);
    expect((await res.json()).resume?.profile?.name).toBe("张三");
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("知识库凭证不能用于读取简历", async () => {
    const token = await signToken("docs", 60_000);
    const res = await POST(req({}, "10.1.0.42", token));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("code_required");
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
