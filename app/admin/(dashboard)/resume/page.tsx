import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ResumeManager } from "@/components/admin/resume-manager";

export default async function AdminResumePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [profileRes, skillsRes, expRes, projRes, settingsRes, codesRes, siteAvatarsRes] = await Promise.all([
    supabase
      .from("resume_profile")
      .select(
        "id, avatar, phone, email, blog_url, name_zh, name_en, certificate_zh, certificate_en, job_intention_zh, job_intention_en, edu_zh, edu_en"
      )
      .limit(1)
      .maybeSingle(),
    supabase
      .from("resume_skills")
      .select("id, sort, content_zh, content_en")
      .order("sort", { ascending: true }),
    supabase
      .from("resume_experiences")
      .select(
        "id, sort, period, company_zh, company_en, role_zh, role_en, highlights_zh, highlights_en"
      )
      .order("sort", { ascending: true }),
    supabase
      .from("resume_projects")
      .select(
        "id, sort, name_zh, name_en, summary_zh, summary_en, contributions_zh, contributions_en"
      )
      .order("sort", { ascending: true }),
    supabase
      .from("resume_settings")
      .select("id, gate_enabled")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("resume_access_codes")
      .select("id, code, label, expires_at, enabled, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("site_avatars")
      .select("id, url, label, enabled, created_at")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        简历管理
      </h1>
      <ResumeManager
        profile={profileRes.data ?? null}
        skills={skillsRes.data ?? []}
        experiences={expRes.data ?? []}
        projects={projRes.data ?? []}
        settings={settingsRes.data ?? null}
        codes={codesRes.data ?? []}
        siteAvatars={siteAvatarsRes.data ?? []}
      />
    </div>
  );
}
