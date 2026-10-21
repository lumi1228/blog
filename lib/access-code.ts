import { createHash, timingSafeEqual } from "node:crypto";

/**
 * 授权码校验共享逻辑（简历门禁与知识库门禁共用基础设施）。
 *
 * - 授权码明文存储于 access_codes，并由 access_code_resources 声明资源范围。
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

/**
 * 可受访问门禁保护的资源。
 * --- @ty.aicoding@ ---
 */
export type AccessResource = "resume" | "docs";

/**
 * 资源门禁设置。
 * --- @ty.aicoding@ ---
 */
export interface AccessGateSetting {
  enabled: boolean;
  sessionTtlSeconds: number;
}

export const DEFAULT_GATE_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

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

/**
 * 读取指定资源的门禁设置；缺失或查询失败时默认开启并使用 7 天会话。
 * --- @ty.aicoding@ ---
 */
export async function getAccessGateSetting(
  supabase: AdminClient,
  resource: AccessResource
): Promise<AccessGateSetting> {
  const { data, error } = await supabase
    .from("access_gate_settings")
    .select("enabled, session_ttl_seconds")
    .eq("resource", resource)
    .maybeSingle();

  if (error || !data) {
    return {
      enabled: true,
      sessionTtlSeconds: DEFAULT_GATE_SESSION_TTL_SECONDS,
    };
  }

  return {
    enabled: data.enabled ?? true,
    sessionTtlSeconds:
      data.session_ttl_seconds ?? DEFAULT_GATE_SESSION_TTL_SECONDS,
  };
}

/**
 * 校验授权码是否命中「启用 + 未过期 + 匹配」的记录。
 * 遍历全部记录（即便已命中也不提前 return），减少时序差异。
 * --- @ty.aicoding@ ---
 */
export async function verifyAccessCode(
  supabase: AdminClient,
  code: string,
  resource: AccessResource
): Promise<boolean> {
  const { data: codes, error } = await supabase
    .from("access_codes")
    .select("code, expires_at, enabled, access_code_resources!inner(resource)")
    .eq("access_code_resources.resource", resource);

  if (error) return false;

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
