import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { getResume } from "@/lib/db";
import {
  createRateLimiter,
  getClientIp,
  isResumeGateEnabled,
  verifyAccessCode,
} from "@/lib/access-code";

/**
 * 简历解锁接口（授权码门禁，配置全部存数据库，后台可维护）。
 *
 * 逻辑分支：
 * - 门禁关闭（resume_settings.gate_enabled = false）→ 直接返回简历（公开）。
 * - 门禁开启 + 未传码 → 401 code_required（供前端探测门禁状态，不计入限流）。
 * - 门禁开启 + 传码 → 校验授权码，命中返回简历；否则 401 invalid_code（计入限流）。
 *
 * 校验与取数均使用 service_role 客户端（绕过 RLS），简历表/授权码表均不对外公开。
 */

export const runtime = "nodejs";

// 简易内存限流（best-effort）：每 IP 60s 内最多 10 次「错误码」尝试
const limiter = createRateLimiter();

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  let body: { code?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const locale = body.locale === "en" ? "en" : "zh-CN";

  try {
    const supabase = createAdminClient();

    // 1) 门禁关闭 → 直接公开
    if (!(await isResumeGateEnabled(supabase))) {
      const resume = await getResume(locale, supabase);
      return NextResponse.json({ resume });
    }

    // 2) 门禁开启但未传码 → 提示前端需要授权码（不计入限流）
    if (!code) {
      return NextResponse.json({ error: "code_required" }, { status: 401 });
    }

    // 3) 限流拦截（针对错误码尝试）
    if (limiter.tooMany(ip)) {
      return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
    }

    // 4) 校验授权码
    if (!(await verifyAccessCode(supabase, code))) {
      limiter.record(ip);
      return NextResponse.json({ error: "invalid_code" }, { status: 401 });
    }

    const resume = await getResume(locale, supabase);
    return NextResponse.json({ resume });
  } catch (err) {
    console.error("[resume/unlock] 处理失败:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
