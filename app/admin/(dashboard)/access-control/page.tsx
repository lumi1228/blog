/**
 * 资源级访问控制独立后台路由文件。
 * --- @ty.aicoding@ ---
 */
import { cookies } from "next/headers";
import { AccessControlManager, type AccessCodeRow } from "@/components/admin/access-control-manager";
import type { AccessResource } from "@/lib/access-code";
import { createClient } from "@/utils/supabase/server";

/**
 * 访问控制独立管理页，加载资源门禁设置和带范围的授权码。
 * --- @ty.aicoding@ ---
 */
export default async function AdminAccessControlPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const [settingsResult, codesResult] = await Promise.all([
    supabase
      .from("access_gate_settings")
      .select("resource, enabled, session_ttl_seconds, updated_at")
      .order("resource"),
    supabase
      .from("access_codes")
      .select("id, code, label, expires_at, enabled, created_at, access_code_resources(resource)")
      .order("created_at", { ascending: false }),
  ]);

  const codes: AccessCodeRow[] = (codesResult.data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    label: row.label,
    expires_at: row.expires_at,
    enabled: row.enabled,
    created_at: row.created_at,
    resources: row.access_code_resources.map((scope) => scope.resource as AccessResource),
  }));

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        访问控制
      </h1>
      <AccessControlManager
        settings={(settingsResult.data ?? []) as Parameters<typeof AccessControlManager>[0]["settings"]}
        codes={codes}
      />
    </div>
  );
}
