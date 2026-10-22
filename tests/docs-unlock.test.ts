import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

// 在导入被测模块前注入签名密钥
beforeAll(() => {
  process.env.DOCS_GATE_SECRET = "test-secret-for-docs-unlock";
});

// 可变 mock：授权码列表
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

import { POST } from "@/app/api/docs/unlock/route";
import { DOCS_GATE_COOKIE, DOCS_UNLOCKED_FLAG, verifyToken } from "@/lib/docs-gate";

function req(body: unknown, ip = "1.1.1.1") {
  return new Request("http://localhost/api/docs/unlock", {
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
    { code: "GOOD", expires_at: null, enabled: true, resources: ["docs"] },
    { code: "FUTURE", expires_at: future, enabled: true, resources: ["docs"] },
    { code: "EXPIRED", expires_at: past, enabled: true, resources: ["docs"] },
    { code: "DISABLED", expires_at: null, enabled: false, resources: ["docs"] },
    { code: "RESUME-ONLY", expires_at: null, enabled: true, resources: ["resume"] },
  ];
});

describe("POST /api/docs/unlock（知识库门禁）", () => {
  it("未传码 → 400", async () => {
    const res = await POST(req({}, "20.1.0.1"));
    expect(res.status).toBe(400);
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("正确码 → 200 且下发有效签名 cookie 与 UI 标记", async () => {
    const res = await POST(req({ code: "GOOD" }, "20.1.0.2"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);

    const token = res.cookies.get(DOCS_GATE_COOKIE)?.value;
    expect(token).toBeTruthy();
    expect(await verifyToken(token, "docs")).toBe(true);
    expect(res.cookies.get(DOCS_GATE_COOKIE)?.maxAge).toBe(604800);

    // 非 httpOnly UI 标记，供前端入口判断
    const flag = res.cookies.get(DOCS_UNLOCKED_FLAG);
    expect(flag?.value).toBe("1");
    expect(flag?.httpOnly).toBe(false);
  });

  /**
   * --- @ty.aicoding@ ---
   */
  it("未过期限期码 → 会话不超过授权码剩余有效期", async () => {
    const res = await POST(req({ code: "FUTURE" }, "20.1.0.3"));
    expect(res.status).toBe(200);
    const maxAge = res.cookies.get(DOCS_GATE_COOKIE)?.maxAge ?? 0;
    expect(maxAge).toBeGreaterThan(86000);
    expect(maxAge).toBeLessThanOrEqual(86400);
  });

  it("已过期码 → 401", async () => {
    const res = await POST(req({ code: "EXPIRED" }, "20.1.0.4"));
    expect(res.status).toBe(401);
  });

  it("已停用码 → 401", async () => {
    const res = await POST(req({ code: "DISABLED" }, "20.1.0.5"));
    expect(res.status).toBe(401);
  });

  it("错误码 → 401 且不下发 cookie", async () => {
    const res = await POST(req({ code: "NOPE" }, "20.1.0.6"));
    expect(res.status).toBe(401);
    expect(res.cookies.get(DOCS_GATE_COOKIE)?.value).toBeFalsy();
  });

  it("只有简历范围的授权码不能解锁知识库", async () => {
    const res = await POST(req({ code: "RESUME-ONLY" }, "20.1.0.7"));
    expect(res.status).toBe(401);
  });

  it("知识库门禁关闭时无需授权码", async () => {
    gateEnabled = false;
    const res = await POST(req({}, "20.1.0.8"));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("同一 IP 错误码尝试过多触发 429", async () => {
    const ip = "20.1.0.99";
    let last = 0;
    for (let i = 0; i < 11; i++) {
      const res = await POST(req({ code: "NOPE" }, ip));
      last = res.status;
    }
    expect(last).toBe(429);
  });
});
