import { createHash, timingSafeEqual } from "node:crypto";

/**
 * 授权码校验共享逻辑（简历门禁与知识库门禁共用）。
 *
 * - 授权码明文存储于 resume_access_codes，仅服务端用 service_role 读取（绕过 RLS）。
 * - 校验采用「先等长哈希再常量时间比较」，避免长度泄露与时序攻击。
 * - 限流为 best-effort 内存实现（冷启动会重置），各接口各自持有一个实例。
 *
 * 注意：本模块依赖 node:crypto，只能在 Node runtime 的 API route 中使用，
 * 不可在 edge 中间件引入。
 */

// 兼容 createAdminClient 返回的客户端，避免强耦合具体泛型
type AdminClient = {
  from: (table: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/** 从请求头解析客户端 IP（best-effort） */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function sha256(s: string): Buffer {
  return createHash("sha256").update(s).digest();
}

/** 常量时间比较（先哈希等长，避免长度泄露与时序攻击） */
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

/** 创建一个独立的内存限流器：每 IP 在窗口内最多 maxAttempts 次失败尝试 */
export function createRateLimiter(
  windowMs = 60_000,
  maxAttempts = 10
) {
  const attempts = new Map<string, { count: number; resetAt: number }>();
  return {
    tooMany(ip: string): boolean {
      const rec = attempts.get(ip);
      return !!rec && Date.now() <= rec.resetAt && rec.count >= maxAttempts;
    },
    record(ip: string): void {
      const now = Date.now();
      const rec = attempts.get(ip);
      if (!rec || now > rec.resetAt) {
        attempts.set(ip, { count: 1, resetAt: now + windowMs });
      } else {
        rec.count += 1;
      }
    },
  };
}

/** 读取简历门禁总开关（默认开启） */
export async function isResumeGateEnabled(
  supabase: AdminClient
): Promise<boolean> {
  const { data } = await supabase
    .from("resume_settings")
    .select("gate_enabled")
    .limit(1)
    .maybeSingle();
  return data?.gate_enabled ?? true;
}

/**
 * 校验授权码是否命中「启用 + 未过期 + 匹配」的记录。
 * 遍历全部记录（即便已命中也不提前 return），减少时序差异。
 */
export async function verifyAccessCode(
  supabase: AdminClient,
  code: string
): Promise<boolean> {
  const { data: codes } = await supabase
    .from("resume_access_codes")
    .select("code, expires_at, enabled");

  const now = Date.now();
  let valid = false;
  for (const row of (codes ?? []) as {
    code: string | null;
    expires_at: string | null;
    enabled: boolean;
  }[]) {
    if (!row.enabled) continue;
    const notExpired = !row.expires_at || now <= Date.parse(row.expires_at);
    if (safeEqual(code, row.code ?? "") && notExpired) valid = true;
  }
  return valid;
}
