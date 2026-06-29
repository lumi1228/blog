import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { NextResponse } from "next/server";

beforeAll(() => {
  process.env.DOCS_GATE_SECRET = "test-secret-for-middleware";
});

// intl 中间件：返回带标记的响应，便于断言「放行」
vi.mock("next-intl/middleware", () => ({
  default: () => () =>
    new NextResponse(null, { headers: { "x-handler": "intl" } }),
}));

// admin 认证中间件：返回带标记的响应
vi.mock("@/utils/supabase/middleware", () => ({
  updateSession: async () =>
    new NextResponse(null, { headers: { "x-handler": "admin" } }),
}));

// 避免 createNavigation 在测试环境引入 next/navigation 客户端模块
vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["zh-CN", "en"], defaultLocale: "zh-CN" },
}));

import { proxy } from "@/proxy";
import { signToken, DOCS_GATE_COOKIE } from "@/lib/docs-gate";
import { NextRequest } from "next/server";

function makeReq(path: string, token?: string) {
  const req = new NextRequest(new URL(`http://localhost${path}`));
  if (token) req.cookies.set(DOCS_GATE_COOKIE, token);
  return req;
}

afterEach(() => {
  delete process.env.DOCS_GATE_ENABLED;
});

describe("proxy 知识库门禁", () => {
  it("无凭证访问 /docs → 重定向到 /unlock-docs 并带 next", async () => {
    const res = await proxy(makeReq("/docs"));
    expect([307, 308]).toContain(res.status);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/unlock-docs");
    expect(loc).toContain("next=%2Fdocs");
  });

  it("无凭证访问 /en/docs/foo → 重定向到 /en/unlock-docs", async () => {
    const res = await proxy(makeReq("/en/docs/set-a/post-1"));
    expect([307, 308]).toContain(res.status);
    const loc = res.headers.get("location")!;
    expect(loc).toContain("/en/unlock-docs");
    expect(loc).toContain("next=%2Fen%2Fdocs%2Fset-a%2Fpost-1");
  });

  it("持有效凭证访问 /docs → 放行交给 intl 中间件", async () => {
    const token = await signToken();
    const res = await proxy(makeReq("/docs/set-a/post-1", token));
    expect(res.headers.get("x-handler")).toBe("intl");
  });

  it("非知识库路径 /blog → 直接走 intl 中间件", async () => {
    const res = await proxy(makeReq("/blog"));
    expect(res.headers.get("x-handler")).toBe("intl");
  });

  it("/unlock-docs 自身不被门禁拦截", async () => {
    const res = await proxy(makeReq("/unlock-docs?next=%2Fdocs"));
    expect(res.headers.get("x-handler")).toBe("intl");
  });

  it("DOCS_GATE_ENABLED=false 时 /docs 无凭证也放行", async () => {
    process.env.DOCS_GATE_ENABLED = "false";
    const res = await proxy(makeReq("/docs"));
    expect(res.headers.get("x-handler")).toBe("intl");
  });

  it("/admin 路径走认证中间件", async () => {
    const res = await proxy(makeReq("/admin/dashboard"));
    expect(res.headers.get("x-handler")).toBe("admin");
  });

  it("过期凭证访问 /docs → 仍重定向", async () => {
    const expired = await signToken(-1000);
    const res = await proxy(makeReq("/docs", expired));
    expect([307, 308]).toContain(res.status);
    expect(res.headers.get("location")).toContain("/unlock-docs");
  });
});
