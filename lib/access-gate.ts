/**
 * Edge 运行时可用的资源门禁读取工具，供中间件判断知识库是否需要凭证。
 * 数据库或配置不可用时默认开启门禁，避免故障导致受保护内容意外公开。
 * --- @ty.aicoding@ ---
 */

/**
 * 从 Supabase REST API 读取知识库门禁状态。
 * DOCS_GATE_ENABLED=false 作为部署级紧急公开开关，优先级高于数据库。
 * --- @ty.aicoding@ ---
 */
export async function isDocsGateEnabled(): Promise<boolean> {
  if (process.env.DOCS_GATE_ENABLED === "false") return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return true;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/access_gate_settings?select=enabled&resource=eq.docs&limit=1`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: "no-store",
      }
    );
    if (!response.ok) return true;

    const rows = (await response.json()) as { enabled?: boolean }[];
    return rows[0]?.enabled ?? true;
  } catch {
    return true;
  }
}
