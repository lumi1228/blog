"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Category {
  id: string;
  slug: string;
  sort: number;
  name_zh: string;
  name_en: string | null;
  description_zh: string | null;
  description_en: string | null;
  articleCount: number;
}

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    nameZh: "",
    nameEn: "",
    slug: "",
    descriptionZh: "",
    descriptionEn: "",
    sort: 0,
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ nameZh: "", nameEn: "", slug: "", descriptionZh: "", descriptionEn: "", sort: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (cat: Category) => {
    setForm({
      nameZh: cat.name_zh,
      nameEn: cat.name_en || "",
      slug: cat.slug,
      descriptionZh: cat.description_zh || "",
      descriptionEn: cat.description_en || "",
      sort: cat.sort,
    });
    setEditing(cat);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nameZh.trim() || !form.slug.trim()) {
      alert("请填写分类名称和 Slug");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const data = {
      name_zh: form.nameZh,
      name_en: form.nameEn || null,
      slug: form.slug,
      description_zh: form.descriptionZh || null,
      description_en: form.descriptionEn || null,
      sort: form.sort,
    };

    if (editing) {
      const { error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", editing.id);
      if (error) {
        alert("更新失败：" + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("categories").insert(data);
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

  const handleDelete = async (cat: Category) => {
    if (cat.articleCount > 0) {
      alert(`该分类下有 ${cat.articleCount} 篇文章，请先移动或删除文章`);
      return;
    }
    if (!confirm(`确定要删除分类「${cat.name_zh}」吗？`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", cat.id);
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
          新建分类
        </button>
      )}

      {/* 编辑表单 */}
      {showForm && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            {editing ? "编辑分类" : "新建分类"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
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
                placeholder="url-friendly-name"
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">排序</label>
              <input
                type="number"
                value={form.sort}
                onChange={(e) => setForm((p) => ({ ...p, sort: Number(e.target.value) }))}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">中文描述</label>
              <input
                value={form.descriptionZh}
                onChange={(e) => setForm((p) => ({ ...p, descriptionZh: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
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

      {/* 分类列表 */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">名称</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Slug</th>
              <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] sm:table-cell">文章数</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">排序</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t border-[var(--border-subtle)]">
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--text-primary)]">{cat.name_zh}</div>
                  {cat.name_en && <div className="text-xs text-[var(--text-tertiary)]">{cat.name_en}</div>}
                </td>
                <td className="px-4 py-3 text-[var(--text-tertiary)]" style={{ fontFamily: "var(--font-mono)" }}>
                  {cat.slug}
                </td>
                <td className="hidden px-4 py-3 text-[var(--text-secondary)] sm:table-cell">{cat.articleCount}</td>
                <td className="px-4 py-3 text-[var(--text-tertiary)]">{cat.sort}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--error)] hover:bg-[var(--error)]/10"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
