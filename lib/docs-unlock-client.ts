import { DOCS_UNLOCKED_FLAG } from "@/lib/docs-gate";

/**
 * 知识库门禁的客户端工具（供首页入口弹框与解锁页表单共用）。
 * 仅依赖无副作用的常量，不引入服务端签名逻辑。
 */

export type DocsUnlockResult = "ok" | "wrong" | "tooMany" | "error";

/** 调用解锁接口校验授权码；成功后服务端会下发凭证 cookie */
export async function requestDocsUnlock(code: string): Promise<DocsUnlockResult> {
  try {
    const res = await fetch("/api/docs/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) return "ok";
    if (res.status === 429) return "tooMany";
    if (res.status === 400 || res.status === 401) return "wrong";
    return "error";
  } catch {
    return "error";
  }
}

/** 读取非 httpOnly 的 UI 标记，判断是否已解锁（仅用于前端入口决策） */
export function isDocsUnlockedClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${DOCS_UNLOCKED_FLAG}=`));
}
