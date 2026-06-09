import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 服务端验证登录状态
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏 */}
      <AdminSidebar userEmail={user.email || ""} />

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
