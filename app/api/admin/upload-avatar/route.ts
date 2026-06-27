import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";

/**
 * 后台证件照上传接口。
 *
 * - 仅已登录管理员可调用（用 cookie 会话校验）。
 * - 用 service_role 客户端上传到 Storage 公开 bucket `resume`，绕过 storage RLS，
 *   避免浏览器端直传被行级安全策略拦截。
 * - 返回可公开访问的图片 URL，供前端回填 resume_profile.avatar。
 */
export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  // 1) 校验管理员登录
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2) 取文件并校验
  let file: FormDataEntryValue | null;
  try {
    const form = await request.formData();
    file = form.get("file");
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "not_image" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "too_large" }, { status: 400 });
  }

  // 3) service_role 上传（绕过 RLS）
  try {
    const admin = createAdminClient();
    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `avatar-${Date.now()}.${ext || "png"}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from("resume")
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (uploadError) {
      console.error("[upload-avatar] 上传失败:", uploadError.message);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = admin.storage.from("resume").getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error("[upload-avatar] 处理失败:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
