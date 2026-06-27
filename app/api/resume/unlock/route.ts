import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/utils/supabase/server";
import { getResume } from "@/lib/db";

/**
 * 简历解锁接口（授权码门禁，配置全部存数据库，后台可维护）。
 *
 * 逻辑分支：
 * - 门禁关闭（resume_settings.gate_enabled = false）→ 直接返回简历（公开）。
 * - 门禁开启 + 未传码 → 401 code_required（供前端探测门禁状态，不计入限流）。
 * - 门禁开启 + 传码 → 在 resume_access_codes 中查找「启用 且 未过期 且 匹配」的码，
 *   命中返回简历；否则 401 invalid_code（计入限流）。
 *
 * 校验与取数均使用 service_role 客户端（绕过 RLS），简历表/授权码表均不对外公开。
 */

export const runtime = "nodejs";

// 简易内存限流（best-effort，冷启动会重置）：每 IP 60s 内最多 10 次「错误码」尝试
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

function tooManyAttempts(ip: string): boolean {
  const rec = attempts.get(ip);
  return !!rec && Date.now() <= rec.resetAt && rec.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    rec.count += 1;
  }
}

function sha256(s: string): Buffer {
  return createHash("sha256").update(s).digest();
}

/** 常量时间比较（先哈希等长，避免长度泄露与时序攻击） */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

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

    // 1) 读门禁开关
    const { data: settings } = await supabase
      .from("resume_settings")
      .select("gate_enabled")
      .limit(1)
      .maybeSingle();
    const gateEnabled = settings?.gate_enabled ?? true;

    // 2) 门禁关闭 → 直接公开
    if (!gateEnabled) {
      const resume = await getResume(locale, supabase);
      return NextResponse.json({ resume });
    }

    // 3) 门禁开启但未传码 → 提示前端需要授权码（不计入限流）
    if (!code) {
      return NextResponse.json({ error: "code_required" }, { status: 401 });
    }

    // 4) 限流拦截（针对错误码尝试）
    if (tooManyAttempts(ip)) {
      return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
    }

    // 5) 校验授权码：启用 + 未过期 + 匹配（常量时间比较，遍历全部避免时序差异）
    const { data: codes } = await supabase
      .from("resume_access_codes")
      .select("code, expires_at, enabled");

    const now = Date.now();
    let valid = false;
    for (const row of codes ?? []) {
      if (!row.enabled) continue;
      const notExpired = !row.expires_at || now <= Date.parse(row.expires_at);
      if (safeEqual(code, row.code ?? "") && notExpired) valid = true;
    }

    if (!valid) {
      recordAttempt(ip);
      return NextResponse.json({ error: "invalid_code" }, { status: 401 });
    }

    const resume = await getResume(locale, supabase);
    return NextResponse.json({ resume });
  } catch (err) {
    console.error("[resume/unlock] 处理失败:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
