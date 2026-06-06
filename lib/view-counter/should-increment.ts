/**
 * 阅读量统计去重纯函数
 *
 * 判断当前访问是否应触发 increment_view_count 调用。
 * 不依赖 React、Supabase、window，方便在 Property 5 测试中独立验证。
 */

export interface SessionStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

/**
 * 判断是否应为指定文章增加阅读量。
 *
 * @param postId      文章 UUID
 * @param now         当前时间戳（毫秒）
 * @param sessionStore  sessionStorage 的抽象接口（可替换为 Map 便于测试）
 * @returns 若应增加阅读量返回 true，并在 sessionStore 中记录当前时间；
 *          若 30 分钟内已统计过同篇文章则返回 false
 */
export function shouldIncrement(
  postId: string,
  now: number,
  sessionStore: SessionStore,
): boolean {
  const key = "viewed:" + postId;
  const last = Number(sessionStore.get(key));

  if (last && now - last < 30 * 60 * 1000) {
    return false;
  }

  sessionStore.set(key, String(now));
  return true;
}
