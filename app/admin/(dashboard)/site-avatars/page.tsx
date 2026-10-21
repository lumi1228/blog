/**
 * 主站头像独立后台路由文件。
 * --- @ty.aicoding@ ---
 */
import { cookies } from "next/headers";
import { SiteAvatarManager } from "@/components/admin/site-avatar-manager";
import { createClient } from "@/utils/supabase/server";

/**
 * 主站头像独立管理页。
 * --- @ty.aicoding@ ---
 */
export default async function AdminSiteAvatarsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase
    .from("site_avatars")
    .select("id, url, label, enabled, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        主站头像
      </h1>
      <SiteAvatarManager siteAvatars={data ?? []} />
    </div>
  );
}
