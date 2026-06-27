"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// ---- 原始数据行类型（双语字段） ----
interface ProfileRow {
  id: string;
  avatar: string | null;
  phone: string | null;
  email: string | null;
  blog_url: string | null;
  name_zh: string;
  name_en: string | null;
  certificate_zh: string | null;
  certificate_en: string | null;
  job_intention_zh: string | null;
  job_intention_en: string | null;
  edu_zh: string | null;
  edu_en: string | null;
}
interface SkillRow {
  id: string;
  sort: number;
  content_zh: string;
  content_en: string | null;
}
interface ExpRow {
  id: string;
  sort: number;
  period: string | null;
  company_zh: string;
  company_en: string | null;
  role_zh: string | null;
  role_en: string | null;
  highlights_zh: string | null;
  highlights_en: string | null;
}
interface ProjRow {
  id: string;
  sort: number;
  name_zh: string;
  name_en: string | null;
  summary_zh: string | null;
  summary_en: string | null;
  contributions_zh: string | null;
  contributions_en: string | null;
}
interface SettingsRow {
  id: string;
  gate_enabled: boolean;
}
interface CodeRow {
  id: string;
  code: string;
  label: string | null;
  expires_at: string | null;
  enabled: boolean;
  created_at: string;
}

interface ResumeManagerProps {
  profile: ProfileRow | null;
  skills: SkillRow[];
  experiences: ExpRow[];
  projects: ProjRow[];
  settings: SettingsRow | null;
  codes: CodeRow[];
}

const inputCls =
  "w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none";
const labelCls = "mb-1 block text-xs text-[var(--text-tertiary)]";

type Tab = "basic" | "skills" | "experiences" | "projects" | "access";

const TABS: { key: Tab; label: string }[] = [
  { key: "basic", label: "基本信息" },
  { key: "skills", label: "专业技能" },
  { key: "experiences", label: "工作经历" },
  { key: "projects", label: "项目经验" },
  { key: "access", label: "访问控制" },
];

export function ResumeManager({ profile, skills, experiences, projects, settings, codes }: ResumeManagerProps) {
  const [tab, setTab] = useState<Tab>("basic");

  return (
    <div className="space-y-6">
      {/* Tab 切换 */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors duration-[var(--duration-fast)] ${
              tab === t.key
                ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basic" && <BasicInfoForm profile={profile} />}
      {tab === "skills" && <SkillsSection skills={skills} />}
      {tab === "experiences" && <ExperiencesSection experiences={experiences} />}
      {tab === "projects" && <ProjectsSection projects={projects} />}
      {tab === "access" && <AccessControlSection settings={settings} codes={codes} />}
    </div>
  );
}

// ============================================
// 基本信息
// ============================================
function BasicInfoForm({ profile }: { profile: ProfileRow | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    avatar: profile?.avatar ?? "",
    phone: profile?.phone ?? "",
    email: profile?.email ?? "",
    blog_url: profile?.blog_url ?? "",
    name_zh: profile?.name_zh ?? "",
    name_en: profile?.name_en ?? "",
    certificate_zh: profile?.certificate_zh ?? "",
    certificate_en: profile?.certificate_en ?? "",
    job_intention_zh: profile?.job_intention_zh ?? "",
    job_intention_en: profile?.job_intention_en ?? "",
    edu_zh: profile?.edu_zh ?? "",
    edu_en: profile?.edu_en ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  // 上传证件照：经服务端接口（service_role）上传到 Storage，回填公开 URL
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允许重复选择同一文件
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("图片不能超过 5MB");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-avatar", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert("上传失败：" + (data.error || res.status));
        return;
      }
      const { url } = await res.json();
      setForm((p) => ({ ...p, avatar: url }));
    } catch (err) {
      alert("上传失败：" + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name_zh.trim()) {
      alert("请填写中文姓名");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const data = {
      avatar: form.avatar || null,
      phone: form.phone || null,
      email: form.email || null,
      blog_url: form.blog_url || null,
      name_zh: form.name_zh,
      name_en: form.name_en || null,
      certificate_zh: form.certificate_zh || null,
      certificate_en: form.certificate_en || null,
      job_intention_zh: form.job_intention_zh || null,
      job_intention_en: form.job_intention_en || null,
      edu_zh: form.edu_zh || null,
      edu_en: form.edu_en || null,
    };

    const { error } = profile
      ? await supabase.from("resume_profile").update(data).eq("id", profile.id)
      : await supabase.from("resume_profile").insert(data);

    setSaving(false);
    if (error) {
      alert("保存失败：" + error.message);
      return;
    }
    router.refresh();
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>证件照</label>
          <div className="flex items-center gap-4">
            {form.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatar}
                alt="证件照预览"
                className="h-20 w-16 shrink-0 rounded-[var(--radius-sm)] border border-[var(--border-default)] object-cover"
              />
            ) : (
              <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--border-default)] text-[10px] text-[var(--text-tertiary)]">
                无照片
              </div>
            )}
            <div className="flex-1 space-y-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]">
                <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
                {uploading ? "上传中..." : "上传证件照"}
              </label>
              <input
                value={form.avatar}
                onChange={set("avatar")}
                placeholder="或填写图片 URL"
                className={inputCls}
              />
            </div>
          </div>
        </div>
        <div>
          <label className={labelCls}>姓名（中文）*</label>
          <input value={form.name_zh} onChange={set("name_zh")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>姓名（英文）</label>
          <input value={form.name_en} onChange={set("name_en")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>电话</label>
          <input value={form.phone} onChange={set("phone")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>邮箱</label>
          <input value={form.email} onChange={set("email")} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>博客 URL</label>
          <input value={form.blog_url} onChange={set("blog_url")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>证书（中文）</label>
          <input value={form.certificate_zh} onChange={set("certificate_zh")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>证书（英文）</label>
          <input value={form.certificate_en} onChange={set("certificate_en")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>求职意向（中文）</label>
          <input value={form.job_intention_zh} onChange={set("job_intention_zh")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>求职意向（英文）</label>
          <input value={form.job_intention_en} onChange={set("job_intention_en")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>毕业院校（中文）</label>
          <input value={form.edu_zh} onChange={set("edu_zh")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>毕业院校（英文）</label>
          <input value={form.edu_en} onChange={set("edu_en")} className={inputCls} />
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存基本信息"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// 专业技能
// ============================================
function SkillsSection({ skills }: { skills: SkillRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<SkillRow | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ content_zh: "", content_en: "", sort: 0 });

  const openNew = () => {
    setForm({ content_zh: "", content_en: "", sort: skills.length });
    setEditing("new");
  };
  const openEdit = (row: SkillRow) => {
    setForm({ content_zh: row.content_zh, content_en: row.content_en ?? "", sort: row.sort });
    setEditing(row);
  };
  const cancel = () => setEditing(null);

  const save = async () => {
    if (!form.content_zh.trim()) {
      alert("请填写中文技能内容");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const data = {
      content_zh: form.content_zh,
      content_en: form.content_en || null,
      sort: form.sort,
    };
    const { error } =
      editing === "new"
        ? await supabase.from("resume_skills").insert(data)
        : await supabase.from("resume_skills").update(data).eq("id", (editing as SkillRow).id);
    setSaving(false);
    if (error) {
      alert("保存失败：" + error.message);
      return;
    }
    setEditing(null);
    router.refresh();
  };

  const remove = async (row: SkillRow) => {
    if (!confirm("确定删除该技能条目吗？")) return;
    const supabase = createClient();
    const { error } = await supabase.from("resume_skills").delete().eq("id", row.id);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    router.refresh();
  };

  return (
    <SectionShell
      addLabel="新增技能"
      onAdd={openNew}
      showForm={editing !== null}
      form={
        <div className="space-y-4">
          <div>
            <label className={labelCls}>技能内容（中文）*</label>
            <textarea
              value={form.content_zh}
              onChange={(e) => setForm((p) => ({ ...p, content_zh: e.target.value }))}
              rows={2}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>技能内容（英文）</label>
            <textarea
              value={form.content_en}
              onChange={(e) => setForm((p) => ({ ...p, content_en: e.target.value }))}
              rows={2}
              className={inputCls}
            />
          </div>
          <SortField value={form.sort} onChange={(v) => setForm((p) => ({ ...p, sort: v }))} />
          <FormActions saving={saving} onSave={save} onCancel={cancel} />
        </div>
      }
    >
      <ul className="divide-y divide-[var(--border-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        {skills.map((s) => (
          <li key={s.id} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm text-[var(--text-primary)]">{s.content_zh}</div>
              {s.content_en && <div className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">{s.content_en}</div>}
            </div>
            <RowActions onEdit={() => openEdit(s)} onDelete={() => remove(s)} sort={s.sort} />
          </li>
        ))}
        {skills.length === 0 && <EmptyRow />}
      </ul>
    </SectionShell>
  );
}

// ============================================
// 工作经历
// ============================================
function ExperiencesSection({ experiences }: { experiences: ExpRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ExpRow | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    period: "",
    company_zh: "",
    company_en: "",
    role_zh: "",
    role_en: "",
    highlights_zh: "",
    highlights_en: "",
    sort: 0,
  });

  const openNew = () => {
    setForm({ period: "", company_zh: "", company_en: "", role_zh: "", role_en: "", highlights_zh: "", highlights_en: "", sort: experiences.length });
    setEditing("new");
  };
  const openEdit = (row: ExpRow) => {
    setForm({
      period: row.period ?? "",
      company_zh: row.company_zh,
      company_en: row.company_en ?? "",
      role_zh: row.role_zh ?? "",
      role_en: row.role_en ?? "",
      highlights_zh: row.highlights_zh ?? "",
      highlights_en: row.highlights_en ?? "",
      sort: row.sort,
    });
    setEditing(row);
  };
  const cancel = () => setEditing(null);

  const save = async () => {
    if (!form.company_zh.trim()) {
      alert("请填写中文公司名称");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const data = {
      period: form.period || null,
      company_zh: form.company_zh,
      company_en: form.company_en || null,
      role_zh: form.role_zh || null,
      role_en: form.role_en || null,
      highlights_zh: form.highlights_zh || null,
      highlights_en: form.highlights_en || null,
      sort: form.sort,
    };
    const { error } =
      editing === "new"
        ? await supabase.from("resume_experiences").insert(data)
        : await supabase.from("resume_experiences").update(data).eq("id", (editing as ExpRow).id);
    setSaving(false);
    if (error) {
      alert("保存失败：" + error.message);
      return;
    }
    setEditing(null);
    router.refresh();
  };

  const remove = async (row: ExpRow) => {
    if (!confirm(`确定删除「${row.company_zh}」这段工作经历吗？`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("resume_experiences").delete().eq("id", row.id);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    router.refresh();
  };

  return (
    <SectionShell
      addLabel="新增工作经历"
      onAdd={openNew}
      showForm={editing !== null}
      form={
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>时间段（如 2021.09-至今）</label>
              <input value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))} className={inputCls} />
            </div>
            <SortField value={form.sort} onChange={(v) => setForm((p) => ({ ...p, sort: v }))} />
            <div>
              <label className={labelCls}>公司（中文）*</label>
              <input value={form.company_zh} onChange={(e) => setForm((p) => ({ ...p, company_zh: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>公司（英文）</label>
              <input value={form.company_en} onChange={(e) => setForm((p) => ({ ...p, company_en: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>职位（中文）</label>
              <input value={form.role_zh} onChange={(e) => setForm((p) => ({ ...p, role_zh: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>职位（英文）</label>
              <input value={form.role_en} onChange={(e) => setForm((p) => ({ ...p, role_en: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>工作要点（中文，每行一条）</label>
            <textarea value={form.highlights_zh} onChange={(e) => setForm((p) => ({ ...p, highlights_zh: e.target.value }))} rows={4} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>工作要点（英文，每行一条）</label>
            <textarea value={form.highlights_en} onChange={(e) => setForm((p) => ({ ...p, highlights_en: e.target.value }))} rows={4} className={inputCls} />
          </div>
          <FormActions saving={saving} onSave={save} onCancel={cancel} />
        </div>
      }
    >
      <ul className="divide-y divide-[var(--border-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        {experiences.map((exp) => (
          <li key={exp.id} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {exp.company_zh}
                {exp.role_zh && <span className="ml-2 text-[var(--text-tertiary)]">· {exp.role_zh}</span>}
              </div>
              <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">{exp.period}</div>
            </div>
            <RowActions onEdit={() => openEdit(exp)} onDelete={() => remove(exp)} sort={exp.sort} />
          </li>
        ))}
        {experiences.length === 0 && <EmptyRow />}
      </ul>
    </SectionShell>
  );
}

// ============================================
// 项目经验
// ============================================
function ProjectsSection({ projects }: { projects: ProjRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ProjRow | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name_zh: "",
    name_en: "",
    summary_zh: "",
    summary_en: "",
    contributions_zh: "",
    contributions_en: "",
    sort: 0,
  });

  const openNew = () => {
    setForm({ name_zh: "", name_en: "", summary_zh: "", summary_en: "", contributions_zh: "", contributions_en: "", sort: projects.length });
    setEditing("new");
  };
  const openEdit = (row: ProjRow) => {
    setForm({
      name_zh: row.name_zh,
      name_en: row.name_en ?? "",
      summary_zh: row.summary_zh ?? "",
      summary_en: row.summary_en ?? "",
      contributions_zh: row.contributions_zh ?? "",
      contributions_en: row.contributions_en ?? "",
      sort: row.sort,
    });
    setEditing(row);
  };
  const cancel = () => setEditing(null);

  const save = async () => {
    if (!form.name_zh.trim()) {
      alert("请填写中文项目名称");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const data = {
      name_zh: form.name_zh,
      name_en: form.name_en || null,
      summary_zh: form.summary_zh || null,
      summary_en: form.summary_en || null,
      contributions_zh: form.contributions_zh || null,
      contributions_en: form.contributions_en || null,
      sort: form.sort,
    };
    const { error } =
      editing === "new"
        ? await supabase.from("resume_projects").insert(data)
        : await supabase.from("resume_projects").update(data).eq("id", (editing as ProjRow).id);
    setSaving(false);
    if (error) {
      alert("保存失败：" + error.message);
      return;
    }
    setEditing(null);
    router.refresh();
  };

  const remove = async (row: ProjRow) => {
    if (!confirm(`确定删除项目「${row.name_zh}」吗？`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("resume_projects").delete().eq("id", row.id);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    router.refresh();
  };

  return (
    <SectionShell
      addLabel="新增项目"
      onAdd={openNew}
      showForm={editing !== null}
      form={
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>项目名称（中文）*</label>
              <input value={form.name_zh} onChange={(e) => setForm((p) => ({ ...p, name_zh: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>项目名称（英文）</label>
              <input value={form.name_en} onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>项目简介（中文）</label>
            <textarea value={form.summary_zh} onChange={(e) => setForm((p) => ({ ...p, summary_zh: e.target.value }))} rows={2} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>项目简介（英文）</label>
            <textarea value={form.summary_en} onChange={(e) => setForm((p) => ({ ...p, summary_en: e.target.value }))} rows={2} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>核心贡献（中文，每行一条）</label>
            <textarea value={form.contributions_zh} onChange={(e) => setForm((p) => ({ ...p, contributions_zh: e.target.value }))} rows={5} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>核心贡献（英文，每行一条）</label>
            <textarea value={form.contributions_en} onChange={(e) => setForm((p) => ({ ...p, contributions_en: e.target.value }))} rows={5} className={inputCls} />
          </div>
          <SortField value={form.sort} onChange={(v) => setForm((p) => ({ ...p, sort: v }))} />
          <FormActions saving={saving} onSave={save} onCancel={cancel} />
        </div>
      }
    >
      <ul className="divide-y divide-[var(--border-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        {projects.map((proj) => (
          <li key={proj.id} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)]">{proj.name_zh}</div>
              {proj.summary_zh && <div className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">{proj.summary_zh}</div>}
            </div>
            <RowActions onEdit={() => openEdit(proj)} onDelete={() => remove(proj)} sort={proj.sort} />
          </li>
        ))}
        {projects.length === 0 && <EmptyRow />}
      </ul>
    </SectionShell>
  );
}

// ============================================
// 访问控制（门禁开关 + 授权码）
// ============================================
function AccessControlSection({ settings, codes }: { settings: SettingsRow | null; codes: CodeRow[] }) {
  const router = useRouter();
  const [gateEnabled, setGateEnabled] = useState(settings?.gate_enabled ?? true);
  const [toggling, setToggling] = useState(false);
  const [now] = useState(() => Date.now());

  // 授权码表单
  const [editing, setEditing] = useState<CodeRow | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", label: "", expires_at: "", enabled: true });

  const enabledValidCount = codes.filter(
    (c) => c.enabled && (!c.expires_at || Date.parse(c.expires_at) >= now)
  ).length;

  const toggleGate = async () => {
    setToggling(true);
    const next = !gateEnabled;
    const supabase = createClient();
    let error;
    if (settings) {
      ({ error } = await supabase
        .from("resume_settings")
        .update({ gate_enabled: next, updated_at: new Date().toISOString() })
        .eq("id", settings.id));
    } else {
      ({ error } = await supabase.from("resume_settings").insert({ gate_enabled: next }));
    }
    setToggling(false);
    if (error) {
      alert("保存失败：" + error.message);
      return;
    }
    setGateEnabled(next);
    router.refresh();
  };

  const openNew = () => {
    setForm({ code: "", label: "", expires_at: "", enabled: true });
    setEditing("new");
  };
  const openEdit = (row: CodeRow) => {
    setForm({
      code: row.code,
      label: row.label ?? "",
      // 转成 yyyy-MM-dd 供 date input
      expires_at: row.expires_at ? row.expires_at.slice(0, 10) : "",
      enabled: row.enabled,
    });
    setEditing(row);
  };
  const cancel = () => setEditing(null);

  const save = async () => {
    if (!form.code.trim()) {
      alert("请填写授权码");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const data = {
      code: form.code.trim(),
      label: form.label || null,
      // date input 给的是当天，存为当天 23:59:59 UTC（含当天有效）
      expires_at: form.expires_at ? new Date(`${form.expires_at}T23:59:59.999Z`).toISOString() : null,
      enabled: form.enabled,
    };
    const { error } =
      editing === "new"
        ? await supabase.from("resume_access_codes").insert(data)
        : await supabase.from("resume_access_codes").update(data).eq("id", (editing as CodeRow).id);
    setSaving(false);
    if (error) {
      alert("保存失败：" + error.message);
      return;
    }
    setEditing(null);
    router.refresh();
  };

  const remove = async (row: CodeRow) => {
    if (!confirm(`确定删除授权码「${row.label || row.code}」吗？`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("resume_access_codes").delete().eq("id", row.id);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* 门禁开关 */}
      <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
        <div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">简历访问门禁</div>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            {gateEnabled ? "已开启：访客需输入有效授权码才能查看简历" : "已关闭：简历对所有访客公开可见"}
          </p>
        </div>
        <button
          onClick={toggleGate}
          disabled={toggling}
          role="switch"
          aria-checked={gateEnabled}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-[var(--duration-fast)] disabled:opacity-50 ${
            gateEnabled ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-tertiary)]"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-[var(--duration-fast)] ${
              gateEnabled ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* 门禁开但无有效码警告 */}
      {gateEnabled && enabledValidCount === 0 && (
        <div className="rounded-[var(--radius-md)] border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--warning)]">
          门禁已开启，但当前没有任何启用且未过期的授权码，访客将无法查看简历。请新增授权码或关闭门禁。
        </div>
      )}

      {/* 授权码表单 */}
      {editing && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>授权码 *</label>
              <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>备注（如给谁用）</label>
              <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>到期日（留空 = 长期有效）</label>
              <input type="date" value={form.expires_at} onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))} className={inputCls} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))} />
                启用
              </label>
            </div>
          </div>
          <div className="mt-4">
            <FormActions saving={saving} onSave={save} onCancel={cancel} />
          </div>
        </div>
      )}

      {!editing && (
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新增授权码
        </button>
      )}

      {/* 授权码列表 */}
      <ul className="divide-y divide-[var(--border-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        {codes.map((c) => {
          const expired = !!c.expires_at && Date.parse(c.expires_at) < now;
          return (
            <li key={c.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-mono)" }}>
                    {c.code}
                  </span>
                  {!c.enabled && <Badge text="已停用" tone="muted" />}
                  {expired && <Badge text="已过期" tone="error" />}
                  {!c.expires_at && <Badge text="长期" tone="ok" />}
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                  {c.label || "—"}
                  {c.expires_at && ` · 到期 ${c.expires_at.slice(0, 10)}`}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => openEdit(c)} className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]">
                  编辑
                </button>
                <button onClick={() => remove(c)} className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--error)] hover:bg-[var(--error)]/10">
                  删除
                </button>
              </div>
            </li>
          );
        })}
        {codes.length === 0 && <EmptyRow />}
      </ul>
    </div>
  );
}

function Badge({ text, tone }: { text: string; tone: "ok" | "error" | "muted" }) {
  const cls =
    tone === "ok"
      ? "bg-[var(--success)]/15 text-[var(--success)]"
      : tone === "error"
      ? "bg-[var(--error)]/15 text-[var(--error)]"
      : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]";
  return <span className={`rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>{text}</span>;
}

// ============================================
// 复用小组件
// ============================================
function SectionShell({
  addLabel,
  onAdd,
  showForm,
  form,
  children,
}: {
  addLabel: string;
  onAdd: () => void;
  showForm: boolean;
  form: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      {!showForm && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {addLabel}
        </button>
      )}
      {showForm && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
          {form}
        </div>
      )}
      {children}
    </div>
  );
}

function SortField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className={labelCls}>排序（数字越小越靠前）</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputCls}
      />
    </div>
  );
}

function FormActions({ saving, onSave, onCancel }: { saving: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] disabled:opacity-50"
      >
        {saving ? "保存中..." : "保存"}
      </button>
      <button onClick={onCancel} className="rounded-[var(--radius-md)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        取消
      </button>
    </div>
  );
}

function RowActions({ onEdit, onDelete, sort }: { onEdit: () => void; onDelete: () => void; sort: number }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-xs text-[var(--text-tertiary)]">#{sort}</span>
      <button onClick={onEdit} className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]">
        编辑
      </button>
      <button onClick={onDelete} className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--error)] hover:bg-[var(--error)]/10">
        删除
      </button>
    </div>
  );
}

function EmptyRow() {
  return <li className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">暂无数据，点击上方按钮新增</li>;
}
