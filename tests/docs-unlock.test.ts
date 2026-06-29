/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

// 在导入被测模块前注入签名密钥
beforeAll(() => {
  process.env.DOCS_GATE_SECRET = "test-secret-for-docs-unlock";
});

// 可变 mock：授权码列表
let codeRows: { code: string; expires_at: string | null; enabled: boolean }[] = [];

vi.mock("@/utils/supabase/server", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        // resume_access_codes 用 await select()
        then: (resolve: (v: any) => void) =>
          resolve({ data: table === "resume_access_codes" ? codeRows : [], error: null }),
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
  codeRows = [
    { code: "GOOD", expires_at: null, enabled: true },
    { code: "FUTURE", expires_at: future, enabled: true },
    { code: "EXPIRED", expires_at: past, enabled: true },
    { code: "DISABLED", expires_at: null, enabled: false },
  ];
});

describe("POST /api/docs/unlock（知识库门禁）", () => {
  it("未传码 → 400", async () => {
    const res = await POST(req({}, "20.1.0.1"));
    expect(res.status).toBe(400);
  });

  it("正确码 → 200 且下发有效签名 cookie 与 UI 标记", async () => {
    const res = await POST(req({ code: "GOOD" }, "20.1.0.2"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);

    const token = res.cookies.get(DOCS_GATE_COOKIE)?.value;
    expect(token).toBeTruthy();
    expect(await verifyToken(token)).toBe(true);

    // 非 httpOnly UI 标记，供前端入口判断
    const flag = res.cookies.get(DOCS_UNLOCKED_FLAG);
    expect(flag?.value).toBe("1");
    expect(flag?.httpOnly).toBe(false);
  });

  it("未过期限期码 → 200", async () => {
    const res = await POST(req({ code: "FUTURE" }, "20.1.0.3"));
    expect(res.status).toBe(200);
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
