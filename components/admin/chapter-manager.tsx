"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Chapter {
  id: string;
  column_id: string;
  sort: number;
  title_zh: string;
  title_en: string | null;
  articleCount: number;
}

interface ColumnInfo {
  id: string;
  title_zh: string;
  title_en: string | null;
  slug: string;
}

interface ChapterManagerProps {
  column: ColumnInfo;
  chapters: Chapter[];
}

export function ChapterManager({ column, chapters }: ChapterManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Chapter | null>(null);
  const [form, setForm] = useState({
    titleZh: "",
    titleEn: "",
    sort: 0,
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ titleZh: "", titleEn: "", sort: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (ch: Chapter) => {
    setForm({
      titleZh: ch.title_zh,
      titleEn: ch.title_en || "",
      sort: ch.sort,
    });
    setEditing(ch);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.titleZh.trim()) {
      alert("请填写章节名称");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const data = {
      column_id: column.id,
      title_zh: form.titleZh,
      title_en: form.titleEn || null,
      sort: form.sort,
    };

    if (editing) {
      const { error } = await supabase
        .from("column_chapters")
        .update(data)
        .eq("id", editing.id);
      if (error) {
        alert("更新失败：" + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("column_chapters").insert(data);
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

  const handleDelete = async (ch: Chapter) => {
    if (ch.articleCount > 0) {
      alert(`该章节下有 ${ch.articleCount} 篇文章，请先将文章移出章节再删除`);
      return;
    }
    if (!confirm(`确定要删除章节「${ch.title_zh}」吗？`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("column_chapters").delete().eq("id", ch.id);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* 返回 + 标题 */}
      <div className="flex items-center gap-3">
        <a
          href="/admin/columns"
          className="rounded-[var(--radius-md)] p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </a>
        <h1
          className="text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          章节管理
        </h1>
        <span className="text-sm text-[var(--text-tertiary)]">
          — {column.title_zh}
        </span>
      </div>

      {/* 新建按钮 */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新建章节
        </button>
      )}

      {/* 编辑表单 */}
      {showForm && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            {editing ? "编辑章节" : "新建章节"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">中文名称 *</label>
              <input
                value={form.titleZh}
                onChange={(e) => setForm((p) => ({ ...p, titleZh: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-tertiary)]">英文名称</label>
              <input
                value={form.titleEn}
                onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
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

      {/* 章节列表 */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">名称</th>
              <th className="hidden px-4 py-3 text-left font-medium text-[var(--text-secondary)] sm:table-cell">文章数</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">排序</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">操作</th>
            </tr>
          </thead>
          <tbody>
            {chapters.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-[var(--text-tertiary)]">
                  暂无章节，点击上方「新建章节」开始创建
                </td>
              </tr>
            ) : (
              chapters.map((ch) => (
                <tr key={ch.id} className="border-t border-[var(--border-subtle)]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--text-primary)]">{ch.title_zh}</div>
                    {ch.title_en && <div className="text-xs text-[var(--text-tertiary)]">{ch.title_en}</div>}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--text-secondary)] sm:table-cell">{ch.articleCount}</td>
                  <td className="px-4 py-3 text-[var(--text-tertiary)]">{ch.sort}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(ch)}
                        className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--accent-secondary)] hover:bg-[var(--accent-muted)]"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(ch)}
                        className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--error)] hover:bg-[var(--error)]/10"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
