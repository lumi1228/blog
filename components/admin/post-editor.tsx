"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Category {
  id: string;
  slug: string;
  name_zh: string;
}

interface Tag {
  id: string;
  slug: string;
  name_zh: string;
}

interface PostData {
  id?: string;
  slug: string;
  coverImage: string;
  status: "draft" | "published";
  categoryId: string;
  tagIds: string[];
  titleZh: string;
  titleEn: string;
  excerptZh: string;
  excerptEn: string;
  contentZh: string;
  contentEn: string;
}

interface PostEditorProps {
  categories: Category[];
  tags: Tag[];
  initialData?: PostData;
}

export function PostEditor({ categories, tags, initialData }: PostEditorProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState<PostData>(
    initialData || {
      slug: "",
      coverImage: "",
      status: "draft",
      categoryId: categories[0]?.id || "",
      tagIds: [],
      titleZh: "",
      titleEn: "",
      excerptZh: "",
      excerptEn: "",
      contentZh: "",
      contentEn: "",
    }
  );

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"zh" | "en">("zh");

  // 自动生成 slug
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }, []);

  const handleTitleChange = (value: string, locale: "zh" | "en") => {
    const updates: Partial<PostData> = {};
    if (locale === "zh") {
      updates.titleZh = value;
      // 如果 slug 为空或未手动修改，自动生成
      if (!form.slug || form.slug === generateSlug(form.titleEn || form.titleZh)) {
        updates.slug = generateSlug(value);
      }
    } else {
      updates.titleEn = value;
      // 英文标题优先用于 slug
      if (value) {
        updates.slug = generateSlug(value);
      }
    }
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleTagToggle = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : prev.tagIds.length < 5
          ? [...prev.tagIds, tagId]
          : prev.tagIds,
    }));
  };

  const handleSave = async (publishStatus?: "draft" | "published") => {
    if (!form.titleZh.trim()) {
      alert("请填写中文标题");
      return;
    }
    if (!form.categoryId) {
      alert("请选择分类");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const status = publishStatus || form.status;

    const postData = {
      slug: form.slug || generateSlug(form.titleEn || form.titleZh),
      cover_image: form.coverImage || null,
      status,
      category_id: form.categoryId,
      title_zh: form.titleZh,
      title_en: form.titleEn || null,
      excerpt_zh: form.excerptZh || null,
      excerpt_en: form.excerptEn || null,
      content_zh: form.contentZh || null,
      content_en: form.contentEn || null,
      available_locales: form.titleEn ? ["zh-CN", "en"] : ["zh-CN"],
      reading_time: Math.max(1, Math.ceil((form.contentZh || "").length / 500)),
      ...(status === "published" && !initialData?.status
        ? { published_at: new Date().toISOString() }
        : {}),
    };

    let postId = initialData?.id;

    if (isEditing && postId) {
      const { error } = await supabase
        .from("posts")
        .update(postData)
        .eq("id", postId);

      if (error) {
        alert("保存失败：" + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("posts")
        .insert(postData)
        .select("id")
        .single();

      if (error) {
        alert("创建失败：" + error.message);
        setSaving(false);
        return;
      }
      postId = data.id;
    }

    // 更新标签关联
    if (postId) {
      // 先删除旧关联
      await supabase.from("post_tags").delete().eq("post_id", postId);
      // 插入新关联
      if (form.tagIds.length > 0) {
        await supabase.from("post_tags").insert(
          form.tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId }))
        );
      }
    }

    setSaving(false);
    router.push("/admin/posts");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* 语言切换标签 */}
      <div className="flex gap-1 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] p-1">
        <button
          onClick={() => setActiveTab("zh")}
          className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTab === "zh"
              ? "bg-[var(--bg-primary)] text-[var(--accent-primary)] shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          中文
        </button>
        <button
          onClick={() => setActiveTab("en")}
          className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTab === "en"
              ? "bg-[var(--bg-primary)] text-[var(--accent-primary)] shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          English
        </button>
      </div>

      {/* 标题 */}
      <div>
        <input
          type="text"
          value={activeTab === "zh" ? form.titleZh : form.titleEn}
          onChange={(e) => handleTitleChange(e.target.value, activeTab)}
          placeholder={activeTab === "zh" ? "文章标题" : "Article Title"}
          className="w-full border-0 bg-transparent text-3xl font-bold text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
          style={{ fontFamily: "var(--font-display)" }}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1 block text-xs text-[var(--text-tertiary)]">
          URL Slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-tertiary)]">/posts/</span>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="article-slug"
            className="flex-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>
      </div>

      {/* 摘要 */}
      <div>
        <label className="mb-1 block text-xs text-[var(--text-tertiary)]">
          {activeTab === "zh" ? "摘要" : "Excerpt"}
        </label>
        <textarea
          value={activeTab === "zh" ? form.excerptZh : form.excerptEn}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              [activeTab === "zh" ? "excerptZh" : "excerptEn"]: e.target.value,
            }))
          }
          placeholder={activeTab === "zh" ? "文章摘要（200字以内）" : "Article excerpt (max 200 chars)"}
          rows={2}
          maxLength={200}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none"
        />
      </div>

      {/* 正文编辑器 */}
      <div>
        <label className="mb-1 block text-xs text-[var(--text-tertiary)]">
          {activeTab === "zh" ? "正文（Markdown）" : "Content (Markdown)"}
        </label>
        <textarea
          value={activeTab === "zh" ? form.contentZh : form.contentEn}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              [activeTab === "zh" ? "contentZh" : "contentEn"]: e.target.value,
            }))
          }
          placeholder={activeTab === "zh" ? "使用 Markdown 格式撰写正文..." : "Write content in Markdown..."}
          rows={20}
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-3 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </div>

      {/* 元数据面板 */}
      <div className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 sm:grid-cols-2">
        {/* 分类 */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            分类 *
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
          >
            <option value="">选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_zh}
              </option>
            ))}
          </select>
        </div>

        {/* 封面图 */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            封面图 URL
          </label>
          <input
            type="url"
            value={form.coverImage}
            onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
            placeholder="https://..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
        </div>

        {/* 标签 */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            标签（最多 5 个）
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = form.tagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`rounded-[var(--radius-full)] border px-3 py-1 text-xs font-medium transition-colors duration-[var(--duration-fast)] ${
                    isSelected
                      ? "border-[var(--accent-primary)] bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                      : "border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--accent-primary)]/50 hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {tag.name_zh}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-6">
        <button
          onClick={() => router.back()}
          className="rounded-[var(--radius-md)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          取消
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all duration-[var(--duration-fast)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存草稿"}
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)] disabled:opacity-50"
          >
            {saving ? "发布中..." : "发布"}
          </button>
        </div>
      </div>
    </div>
  );
}
