/**
 * 资源级访问控制后台客户端组件文件。
 * --- @ty.aicoding@ ---
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { AccessResource } from "@/lib/access-code";

/**
 * 资源门禁设置数据行。
 * --- @ty.aicoding@ ---
 */
export interface AccessGateSettingRow {
  resource: AccessResource;
  enabled: boolean;
  session_ttl_seconds: number;
  updated_at: string | null;
}

/**
 * 带资源范围的授权码数据行。
 * --- @ty.aicoding@ ---
 */
export interface AccessCodeRow {
  id: string;
  code: string;
  label: string | null;
  expires_at: string | null;
  enabled: boolean;
  created_at: string;
  resources: AccessResource[];
}

/**
 * 访问控制管理组件参数。
 * --- @ty.aicoding@ ---
 */
interface AccessControlManagerProps {
  settings: AccessGateSettingRow[];
  codes: AccessCodeRow[];
}

const inputCls =
  "w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none";
const labelCls = "mb-1 block text-xs text-[var(--text-tertiary)]";
const RESOURCE_LABELS: Record<AccessResource, string> = {
  resume: "简历",
  docs: "知识库",
};

/**
 * 管理简历、知识库门禁，以及每个授权码可访问的资源范围。
 * --- @ty.aicoding@ ---
 */
export function AccessControlManager({ settings, codes }: AccessControlManagerProps) {
  const router = useRouter();
  const [localSettings, setLocalSettings] = useState<Record<AccessResource, boolean>>({
    resume: settings.find((item) => item.resource === "resume")?.enabled ?? true,
    docs: settings.find((item) => item.resource === "docs")?.enabled ?? true,
  });
  const [toggling, setToggling] = useState<AccessResource | null>(null);
  const [editing, setEditing] = useState<AccessCodeRow | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [now] = useState(() => Date.now());
  const [form, setForm] = useState({
    code: "",
    label: "",
    expires_at: "",
    enabled: true,
    resume: true,
    docs: true,
  });

  /**
   * 保存指定资源的门禁开关。
   * --- @ty.aicoding@ ---
   */
  const toggleGate = async (resource: AccessResource) => {
    const next = !localSettings[resource];
    setToggling(resource);
    const supabase = createClient();
    const { error } = await supabase.from("access_gate_settings").upsert(
      {
        resource,
        enabled: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "resource" }
    );
    setToggling(null);
    if (error) {
      alert("保存失败：" + error.message);
      return;
    }
    setLocalSettings((current) => ({ ...current, [resource]: next }));
    router.refresh();
  };

  /**
   * 打开新增授权码表单。
   * --- @ty.aicoding@ ---
   */
  const openNew = () => {
    setForm({ code: "", label: "", expires_at: "", enabled: true, resume: true, docs: true });
    setEditing("new");
  };

  /**
   * 打开授权码编辑表单并回填资源范围。
   * --- @ty.aicoding@ ---
   */
  const openEdit = (row: AccessCodeRow) => {
    setForm({
      code: row.code,
      label: row.label ?? "",
      expires_at: row.expires_at ? row.expires_at.slice(0, 10) : "",
      enabled: row.enabled,
      resume: row.resources.includes("resume"),
      docs: row.resources.includes("docs"),
    });
    setEditing(row);
  };

  /**
   * 关闭授权码编辑表单。
   * --- @ty.aicoding@ ---
   */
  const cancel = () => setEditing(null);

  /**
   * 保存授权码基础信息和所选资源范围。
   * --- @ty.aicoding@ ---
   */
  const save = async () => {
    if (!editing) return;
    if (!form.code.trim()) {
      alert("请填写授权码");
      return;
    }

    const resources = (["resume", "docs"] as const).filter((resource) => form[resource]);
    if (resources.length === 0) {
      alert("请至少选择一个可访问资源");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const codeData = {
      code: form.code.trim(),
      label: form.label || null,
      expires_at: form.expires_at
        ? new Date(`${form.expires_at}T23:59:59.999Z`).toISOString()
        : null,
      enabled: form.enabled,
    };

    let codeId: string;
    if (editing === "new") {
      const { data, error } = await supabase
        .from("access_codes")
        .insert(codeData)
        .select("id")
        .single();
      if (error || !data) {
        setSaving(false);
        alert("保存失败：" + (error?.message || "未返回授权码 ID"));
        return;
      }
      codeId = data.id;
    } else {
      codeId = editing.id;
      const { error } = await supabase.from("access_codes").update(codeData).eq("id", codeId);
      if (error) {
        setSaving(false);
        alert("保存失败：" + error.message);
        return;
      }
    }

    const { error: scopeError } = await supabase.from("access_code_resources").upsert(
      resources.map((resource) => ({ code_id: codeId, resource })),
      { onConflict: "code_id,resource" }
    );
    if (scopeError) {
      if (editing === "new") {
        await supabase.from("access_codes").delete().eq("id", codeId);
      }
      setSaving(false);
      alert("保存访问范围失败：" + scopeError.message);
      return;
    }

    for (const resource of (["resume", "docs"] as const)) {
      if (!resources.includes(resource)) {
        const { error } = await supabase
          .from("access_code_resources")
          .delete()
          .eq("code_id", codeId)
          .eq("resource", resource);
        if (error) {
          setSaving(false);
          alert("更新访问范围失败：" + error.message);
          return;
        }
      }
    }

    setSaving(false);
    setEditing(null);
    router.refresh();
  };

  /**
   * 删除授权码，关联资源范围由数据库级联删除。
   * --- @ty.aicoding@ ---
   */
  const remove = async (row: AccessCodeRow) => {
    if (!confirm(`确定删除授权码「${row.label || row.code}」吗？`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("access_codes").delete().eq("id", row.id);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    router.refresh();
  };

  const validCounts = codes.reduce<Record<AccessResource, number>>(
    (counts, code) => {
      const valid = code.enabled && (!code.expires_at || Date.parse(code.expires_at) >= now);
      if (valid) {
        for (const resource of code.resources) counts[resource] += 1;
      }
      return counts;
    },
    { resume: 0, docs: 0 }
  );
  const docsTtl = settings.find((item) => item.resource === "docs")?.session_ttl_seconds ?? 604800;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <GateSwitch
          title="简历访问门禁"
          description={localSettings.resume ? "访客需输入拥有简历权限的授权码" : "简历对所有访客公开可见"}
          enabled={localSettings.resume}
          saving={toggling === "resume"}
          onToggle={() => toggleGate("resume")}
        />
        <GateSwitch
          title="知识库访问门禁"
          description={
            localSettings.docs
              ? `访客解锁后 ${Math.max(1, Math.round(docsTtl / 86400))} 天内可访问知识库`
              : "知识库对所有访客公开可见"
          }
          enabled={localSettings.docs}
          saving={toggling === "docs"}
          onToggle={() => toggleGate("docs")}
        />
      </div>

      {(["resume", "docs"] as const).map((resource) =>
        localSettings[resource] && validCounts[resource] === 0 ? (
          <div
            key={resource}
            className="rounded-[var(--radius-md)] border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--warning)]"
          >
            {RESOURCE_LABELS[resource]}门禁已开启，但没有任何启用、未过期且拥有对应范围的授权码。
          </div>
        ) : null
      )}

      {editing && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>授权码 *</label>
              <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>备注（如给谁用）</label>
              <input value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>到期日（留空 = 长期有效）</label>
              <input type="date" value={form.expires_at} onChange={(event) => setForm((current) => ({ ...current, expires_at: event.target.value }))} className={inputCls} />
            </div>
            <div className="space-y-2">
              <span className={labelCls}>可访问范围 *</span>
              <div className="flex flex-wrap gap-4">
                {(["resume", "docs"] as const).map((resource) => (
                  <label key={resource} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={form[resource]}
                      onChange={(event) => setForm((current) => ({ ...current, [resource]: event.target.checked }))}
                    />
                    {RESOURCE_LABELS[resource]}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] sm:col-span-2">
              <input type="checkbox" checked={form.enabled} onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))} />
              启用授权码
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} disabled={saving} className="rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] disabled:opacity-50">
              {saving ? "保存中..." : "保存"}
            </button>
            <button onClick={cancel} className="rounded-[var(--radius-md)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              取消
            </button>
          </div>
        </div>
      )}

      {!editing && (
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新增授权码
        </button>
      )}

      <ul className="divide-y divide-[var(--border-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        {codes.map((code) => {
          const expired = !!code.expires_at && Date.parse(code.expires_at) < now;
          return (
            <li key={code.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-mono)" }}>{code.code}</span>
                  {code.resources.map((resource) => <Badge key={resource} text={RESOURCE_LABELS[resource]} tone="scope" />)}
                  {!code.enabled && <Badge text="已停用" tone="muted" />}
                  {expired && <Badge text="已过期" tone="error" />}
                  {!code.expires_at && <Badge text="长期" tone="ok" />}
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                  {code.label || "—"}{code.expires_at && ` · 到期 ${code.expires_at.slice(0, 10)}`}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => openEdit(code)} className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]">编辑</button>
                <button onClick={() => remove(code)} className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--error)] hover:bg-[var(--error)]/10">删除</button>
              </div>
            </li>
          );
        })}
        {codes.length === 0 && <li className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">暂无数据，点击上方按钮新增</li>}
      </ul>
    </div>
  );
}

/**
 * 资源门禁开关面板。
 * --- @ty.aicoding@ ---
 */
function GateSwitch({ title, description, enabled, saving, onToggle }: { title: string; description: string; enabled: boolean; saving: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
      <div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">{title}</div>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={saving}
        role="switch"
        aria-label={title}
        aria-checked={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-[var(--duration-fast)] disabled:opacity-50 ${enabled ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-tertiary)]"}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-[var(--duration-fast)] ${enabled ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

/**
 * 授权码状态或资源范围标签。
 * --- @ty.aicoding@ ---
 */
function Badge({ text, tone }: { text: string; tone: "ok" | "error" | "muted" | "scope" }) {
  const cls = tone === "ok"
    ? "bg-[var(--success)]/15 text-[var(--success)]"
    : tone === "error"
      ? "bg-[var(--error)]/15 text-[var(--error)]"
      : tone === "scope"
        ? "bg-[var(--accent-muted)] text-[var(--accent-primary)]"
        : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]";
  return <span className={`rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>{text}</span>;
}
