"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MarkdownPreview } from "./markdown-preview";
import { CoverImageField } from "@/components/admin/cover-image-field";
import { generatePostSlug } from "@/lib/markdown/slugify";

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

interface ColumnItem {
  id: string;
  slug: string;
  title_zh: string;
}

interface ChapterItem {
  id: string;
  column_id: string;
  title_zh: string;
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
  columnId: string;
  chapterId: string;
  showInList: boolean;
}

interface PostEditorProps {
  categories: Category[];
  tags: Tag[];
  columns: ColumnItem[];
  chapters: ChapterItem[];
  initialData?: PostData;
  onClose?: () => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function PostEditor({ categories, tags, columns, chapters, initialData, onClose }: PostEditorProps) {
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
      columnId: "",
      chapterId: "",
      showInList: false,
    }
  );

  // 根据选中的专栏过滤章节
  const filteredChapters = chapters.filter((ch) => ch.column_id === form.columnId);

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"zh" | "en">("zh");
  const [showPreview, setShowPreview] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<SaveStatus>("idle");
  const [uploading, setUploading] = useState(false);

  // 自动保存相关 ref
  const formRef = useRef(form);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const postIdRef = useRef<string | undefined>(initialData?.id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 保持 formRef 同步
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // ============================================
  // 自动保存逻辑（每 30 秒）
  // ============================================
  const performAutoSave = useCallback(async () => {
    const currentForm = formRef.current;
    // 没有标题则不保存
    if (!currentForm.titleZh.trim()) return;

    // 内容未变化则不保存
    const contentHash = JSON.stringify({
      titleZh: currentForm.titleZh,
      titleEn: currentForm.titleEn,
      contentZh: currentForm.contentZh,
      contentEn: currentForm.contentEn,
      excerptZh: currentForm.excerptZh,
      excerptEn: currentForm.excerptEn,
    });
    if (contentHash === lastSavedRef.current) return;

    setAutoSaveStatus("saving");
    const supabase = createClient();

    const postData = {
      slug: currentForm.slug || generatePostSlug(currentForm.titleEn, currentForm.titleZh),
      cover_image: currentForm.coverImage || null,
      status: currentForm.status === "published" ? "published" : "draft",
      category_id: currentForm.categoryId || null,
      column_id: currentForm.columnId || null,
      chapter_id: currentForm.chapterId || null,
      show_in_list: currentForm.showInList,
      title_zh: currentForm.titleZh,
      title_en: currentForm.titleEn || null,
      excerpt_zh: currentForm.excerptZh || null,
      excerpt_en: currentForm.excerptEn || null,
      content_zh: currentForm.contentZh || null,
      content_en: currentForm.contentEn || null,
      available_locales: currentForm.titleEn ? ["zh-CN", "en"] : ["zh-CN"],
      reading_time: Math.max(1, Math.ceil((currentForm.contentZh || "").length / 500)),
    };

    try {
      if (postIdRef.current) {
        // 更新已有文章
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", postIdRef.current);
        if (error) throw error;
      } else {
        // 新建文章（首次自动保存时创建草稿）
        const { data, error } = await supabase
          .from("posts")
          .insert({ ...postData, status: "draft" })
          .select("id")
          .single();
        if (error) throw error;
        postIdRef.current = data.id;
        // 更新标签关联
        if (currentForm.tagIds.length > 0) {
          await supabase.from("post_tags").insert(
            currentForm.tagIds.map((tagId) => ({
              post_id: data.id,
              tag_id: tagId,
            }))
          );
        }
      }
      lastSavedRef.current = contentHash;
      setAutoSaveStatus("saved");
      // 3 秒后恢复 idle 状态
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    } catch {
      setAutoSaveStatus("error");
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    }
  }, []);

  // 启动自动保存定时器
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(performAutoSave, 30000);
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [performAutoSave]);

  // ============================================
  // 图片上传逻辑
  // ============================================
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      alert("仅支持上传图片文件");
      return null;
    }
    // 限制 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过 5MB");
      return null;
    }

    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) {
      alert("上传失败：" + error.message);
      setUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(filePath);

    setUploading(false);
    return urlData.publicUrl;
  }, []);

  // 在 textarea 光标位置插入文本
  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const field = activeTab === "zh" ? "contentZh" : "contentEn";
    const currentValue = form[field];
    const newValue = currentValue.slice(0, start) + text + currentValue.slice(end);

    setForm((prev) => ({ ...prev, [field]: newValue }));

    // 恢复光标位置
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    });
  }, [activeTab, form]);

  // 处理粘贴图片
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        insertAtCursor("![上传中...]()\n");
        const url = await uploadImage(file);
        if (url) {
          // 替换占位文本
          const field = activeTab === "zh" ? "contentZh" : "contentEn";
          setForm((prev) => ({
            ...prev,
            [field]: prev[field].replace("![上传中...]()", `![image](${url})`),
          }));
        } else {
          const field = activeTab === "zh" ? "contentZh" : "contentEn";
          setForm((prev) => ({
            ...prev,
            [field]: prev[field].replace("![上传中...]()\n", ""),
          }));
        }
        break;
      }
    }
  }, [activeTab, insertAtCursor, uploadImage]);

  // 处理拖拽图片
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    insertAtCursor("![上传中...]()\n");
    const url = await uploadImage(file);
    if (url) {
      const field = activeTab === "zh" ? "contentZh" : "contentEn";
      setForm((prev) => ({
        ...prev,
        [field]: prev[field].replace("![上传中...]()", `![image](${url})`),
      }));
    } else {
      const field = activeTab === "zh" ? "contentZh" : "contentEn";
      setForm((prev) => ({
        ...prev,
        [field]: prev[field].replace("![上传中...]()\n", ""),
      }));
    }
  }, [activeTab, insertAtCursor, uploadImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // 手动上传图片（通过文件选择器）
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadImage(file);
      if (url) {
        insertAtCursor(`![image](${url})\n`);
      }
    };
    input.click();
  }, [uploadImage, insertAtCursor]);

  // ============================================
  // 标题和标签处理
  // ============================================
  const handleTitleChange = (value: string, locale: "zh" | "en") => {
    const updates: Partial<PostData> = {};
    if (locale === "zh") {
      updates.titleZh = value;
      // 编辑模式下 slug 锁定，新建时跟随标题自动生成
      if (!isEditing) {
        updates.slug = generatePostSlug(form.titleEn, value);
      }
    } else {
      updates.titleEn = value;
      // 英文标题优先：新建时只要有英文标题就用英文重新生成
      if (!isEditing) {
        updates.slug = generatePostSlug(value, form.titleZh);
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

  // ============================================
  // 保存/发布
  // ============================================
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
      slug: form.slug || generatePostSlug(form.titleEn, form.titleZh),
      cover_image: form.coverImage || null,
      status,
      category_id: form.categoryId,
      column_id: form.columnId || null,
      chapter_id: form.chapterId || null,
      show_in_list: form.showInList,
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

    let postId = postIdRef.current || initialData?.id;

    if (postId) {
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
      await supabase.from("post_tags").delete().eq("post_id", postId);
      if (form.tagIds.length > 0) {
        await supabase.from("post_tags").insert(
          form.tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId }))
        );
      }
    }

    setSaving(false);
    if (onClose) {
      onClose();
    } else {
      router.push("/admin/posts");
      router.refresh();
    }
  };

  // 当前编辑内容
  const currentContent = activeTab === "zh" ? form.contentZh : form.contentEn;

  return (
    <div className="space-y-6">
      {/* 顶部工具栏：语言切换 + 预览切换 + 自动保存状态 */}
      <div className="flex items-center justify-between">
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

        {/* 右侧：预览切换 + 自动保存状态 */}
        <div className="flex items-center gap-4">
          {/* 自动保存状态 */}
          <span className="text-xs text-[var(--text-tertiary)]">
            {autoSaveStatus === "saving" && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--warning)]" />
                自动保存中...
              </span>
            )}
            {autoSaveStatus === "saved" && (
              <span className="flex items-center gap-1 text-[var(--success)]">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已自动保存
              </span>
            )}
            {autoSaveStatus === "error" && (
              <span className="text-[var(--error)]">自动保存失败</span>
            )}
          </span>

          {/* 预览切换按钮 */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-1.5 text-xs font-medium transition-colors ${
              showPreview
                ? "border-[var(--accent-primary)] bg-[var(--accent-muted)] text-[var(--accent-primary)]"
                : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/50"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? "隐藏预览" : "显示预览"}
          </button>
        </div>
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

      {/* Slug - 只读预览 */}
      <div>
        <label className="mb-1 block text-xs text-[var(--text-tertiary)]">
          URL Slug（自动生成）
        </label>
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5">
          <span className="shrink-0 text-xs text-[var(--text-tertiary)]">/posts/</span>
          {form.slug ? (
            <span
              className="truncate text-sm text-[var(--text-secondary)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {form.slug}
            </span>
          ) : (
            <span className="text-xs italic text-[var(--text-tertiary)]">
              填写标题后自动生成
            </span>
          )}
          {isEditing && (
            <span className="ml-auto shrink-0 rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-xs text-[var(--text-tertiary)]">
              已锁定
            </span>
          )}
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

      {/* 正文编辑器 - 双栏布局 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs text-[var(--text-tertiary)]">
            {activeTab === "zh" ? "正文（Markdown）" : "Content (Markdown)"}
          </label>
          {/* 图片上传按钮 */}
          <button
            onClick={handleImageUpload}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-primary)]/50 hover:text-[var(--accent-primary)] disabled:opacity-50"
          >
            {uploading ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                上传中...
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                插入图片
              </>
            )}
          </button>
        </div>

        <div className={`grid gap-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] ${showPreview ? "grid-cols-2" : "grid-cols-1"}`}>
          {/* 编辑区 */}
          <div className={`relative ${showPreview ? "border-r border-[var(--border-default)]" : ""}`}>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2">
              <span className="text-xs font-medium text-[var(--text-tertiary)]">编辑</span>
              <span className="text-xs text-[var(--text-tertiary)]">
                支持粘贴/拖拽图片
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={currentContent}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  [activeTab === "zh" ? "contentZh" : "contentEn"]: e.target.value,
                }))
              }
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              placeholder={activeTab === "zh" ? "使用 Markdown 格式撰写正文...\n\n支持粘贴或拖拽图片直接上传" : "Write content in Markdown...\n\nSupports paste or drag & drop image upload"}
              className="h-[500px] w-full resize-none bg-[var(--bg-primary)] px-4 py-3 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>

          {/* 预览区 */}
          {showPreview && (
            <div className="flex flex-col">
              <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2">
                <span className="text-xs font-medium text-[var(--text-tertiary)]">预览</span>
              </div>
              <div className="h-[500px] overflow-y-auto bg-[var(--bg-primary)] px-6 py-4">
                {currentContent ? (
                  <MarkdownPreview content={currentContent} />
                ) : (
                  <p className="text-sm italic text-[var(--text-tertiary)]">
                    {activeTab === "zh" ? "在左侧输入 Markdown 内容，这里将实时显示预览..." : "Type Markdown on the left to see preview here..."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
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
        <div className="sm:col-span-2">
          <CoverImageField
            label="封面图"
            value={form.coverImage}
            onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
            hint="选填。留空时前台展示将回退到所属分类 / 章节的默认封面"
          />
        </div>

        {/* 专栏 */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            所属专栏
          </label>
          <select
            value={form.columnId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, columnId: e.target.value, chapterId: "" }))
            }
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
          >
            <option value="">不属于专栏</option>
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title_zh}
              </option>
            ))}
          </select>
        </div>

        {/* 章节 */}
        {form.columnId && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              所属章节
            </label>
            <select
              value={form.chapterId}
              onChange={(e) => setForm((prev) => ({ ...prev, chapterId: e.target.value }))}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            >
              <option value="">不归属章节</option>
              {filteredChapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.title_zh}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 在首页展示 */}
        {form.columnId && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={form.showInList}
                onChange={(e) => setForm((prev) => ({ ...prev, showInList: e.target.checked }))}
                className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
              />
              在首页文章列表展示
            </label>
          </div>
        )}

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
          onClick={() => onClose ? onClose() : router.back()}
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
