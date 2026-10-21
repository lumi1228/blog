import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import {
  createRateLimiter,
  getAccessGateSetting,
  getClientIp,
  verifyAccessCode,
} from "@/lib/access-code";
import {
  DOCS_GATE_COOKIE,
  DOCS_UNLOCKED_FLAG,
  signToken,
} from "@/lib/docs-gate";

/**
 * 知识库（/docs）解锁接口。
 *
 * 使用共享授权码基础设施，并只接受拥有 docs 范围的授权码。校验通过后按数据库
 * 配置的会话时长下发签名 cookie。中间件凭此放行 /docs 下的所有访问，即
 * 「入口处校验一次，进入后不再校验」。
 *
 * - 未传码 → 400 bad_request
 * - 错误码 → 401 invalid_code（计入限流）
 * - 超过限流 → 429 too_many_attempts
 * - 正确码 → 200 { ok: true } 并 Set-Cookie
 *
 * 授权码校验使用 service_role 客户端（绕过 RLS）。
 */

export const runtime = "nodejs";

// 简易内存限流（best-effort）：每 IP 60s 内最多 10 次「错误码」尝试
const limiter = createRateLimiter();

/**
 * 按知识库资源门禁设置处理授权码校验并签发访问凭证。
 * --- @ty.aicoding@ ---
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const gate = await getAccessGateSetting(supabase, "docs");
    if (!gate.enabled) {
      return NextResponse.json({ ok: true });
    }

    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!code) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    if (limiter.tooMany(ip)) {
      return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
    }

    if (!(await verifyAccessCode(supabase, code, "docs"))) {
      limiter.record(ip);
      return NextResponse.json({ error: "invalid_code" }, { status: 401 });
    }

    // 校验通过 → 下发签名凭证
    const token = await signToken(gate.sessionTtlSeconds * 1000);
    const res = NextResponse.json({ ok: true });
    const maxAge = gate.sessionTtlSeconds;
    // httpOnly 签名凭证：中间件凭此校验放行
    res.cookies.set(DOCS_GATE_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    // 非 httpOnly UI 标记：供前端入口判断是否已解锁（不含凭证信息）
    res.cookies.set(DOCS_UNLOCKED_FLAG, "1", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return res;
  } catch (err) {
    console.error("[docs/unlock] 处理失败:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
