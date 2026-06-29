/**
 * 知识库（/docs）访问门禁的签名凭证工具。
 *
 * 设计要点：
 * - 使用 Web Crypto（HMAC-SHA256）实现，edge 中间件与 node API route 通用，
 *   避免在中间件中引入 node:crypto。
 * - 凭证格式：`${exp}.${sig}`，其中 exp 为毫秒级过期时间戳，
 *   sig = base64url(HMAC-SHA256(secret, `${exp}`))。
 * - 校验时重算签名做常量时间比较，并检查未过期。签名防篡改，故无需服务端存储。
 *
 * 密钥来源：优先 DOCS_GATE_SECRET；缺省回退到 SUPABASE_SERVICE_ROLE_KEY（仅服务端可见）。
 * 两者都缺失时抛错，避免使用空密钥签发可被伪造的凭证。
 */

/** 门禁凭证 cookie 名 */
export const DOCS_GATE_COOKIE = "docs_access";

/**
 * UI 标记 cookie 名（非 httpOnly，可被客户端读取）。
 * 仅用于前端入口判断「是否已解锁」以决定弹框还是直接进入，不含任何凭证信息。
 * 伪造该标记无害：真正的内容访问仍由中间件校验 httpOnly 的 DOCS_GATE_COOKIE 签名凭证。
 */
export const DOCS_UNLOCKED_FLAG = "docs_unlocked";

/** 默认有效期：7 天 */
export const DOCS_GATE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret =
    process.env.DOCS_GATE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      "缺少 DOCS_GATE_SECRET（或 SUPABASE_SERVICE_ROLE_KEY）环境变量，无法签发知识库门禁凭证"
    );
  }
  return secret;
}

/** ArrayBuffer → base64url 字符串 */
function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa 在 edge 与 node 18+ 均可用
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toBase64Url(sig);
}

/** 常量时间字符串比较（长度不同直接 false，但仍遍历以减少时序差异） */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * 签发门禁凭证。
 * @param ttlMs 有效期（毫秒），默认 7 天
 * @returns 形如 `${exp}.${sig}` 的凭证字符串
 */
export async function signToken(ttlMs: number = DOCS_GATE_TTL_MS): Promise<string> {
  const exp = Date.now() + ttlMs;
  const sig = await hmac(String(exp));
  return `${exp}.${sig}`;
}

/**
 * 校验门禁凭证：签名正确且未过期。
 * @param token cookie 中的凭证字符串（可能为 undefined）
 */
export async function verifyToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;

  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  let expected: string;
  try {
    expected = await hmac(expStr);
  } catch {
    return false;
  }
  return safeEqual(sig, expected);
}
