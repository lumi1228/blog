"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Tag {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string | null;
  articleCount: number;
}

interface TagManagerProps {
  tags: Tag[];
}

export function TagManager({ tags }: TagManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form, setForm] = useState({ nameZh: "", nameEn: "", slug: "" });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ nameZh: "", nameEn: "", slug: "" });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (tag: Tag) => {
    setForm({ nameZh: tag.name_zh, nameEn: tag.name_en || "", slug: tag.slug });
    setEditing(tag);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nameZh.trim() || !form.slug.trim()) {
      alert("请填写标签名称和 Slug");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const data = {
      name_zh: form.nameZh,
      name_en: form.nameEn || null,
      slug: form.slug,
    };

    if (editing) {
      const { error } = await supabase.from("tags").update(data).eq("id", editing.id);
      if (error) {
        alert("更新失败：" + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("tags").insert(data);
      if (error) {
        alert("创建失败：" + error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    resetForm();
    router.refresh();
  };

  const handleDelete = async (tag: Tag) => {
    if (tag.articleCount > 0) {
      if (!confirm(`标签「${tag.name_zh}」关联了 ${tag.articleCount} 篇文章，删除后文章不会被删除，仅移除标签关联。确定删除？`)) {
        return;
      }
    } else {
      if (!confirm(`确定要删除标签「${tag.name_zh}」吗？`)) return;
    }

    const supabase = createClient();
    // 先删除关联
    await supabase.from("post_tags").delete().eq("tag_id", tag.id);
    // 再删除标签
    const { error } = await supabase.from("tags").delete().eq("id", tag.id);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* 新建按钮 */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新建标签
        </button>
      )}

      {/* 编辑表单 */}
      {showForm && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            {editing ? "编辑标签" : "新建标签"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">中文名称 *</label>
              <input
                value={form.nameZh}
                onChange={(e) => setForm((p) => ({ ...p, nameZh: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">英文名称</label>
              <input
                value={form.nameEn}
                onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="tag-slug"
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-[var(--radius-md)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 标签列表（卡片式） */}
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="group flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2.5"
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {tag.name_zh}
            </span>
            {tag.name_en && (
              <span className="text-xs text-[var(--text-tertiary)]">({tag.name_en})</span>
            )}
            <span className="rounded-[var(--radius-full)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-xs text-[var(--text-tertiary)]">
              {tag.articleCount}
            </span>
            <div className="ml-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => startEdit(tag)}
                className="rounded p-0.5 text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(tag)}
                className="rounded p-0.5 text-[var(--error)] hover:bg-[var(--error)]/10"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
