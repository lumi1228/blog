"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface CoverImageFieldProps {
  /** 当前封面 URL（受控值，空字符串表示无封面） */
  value: string;
  /** 封面变化回调（上传成功或手动输入 URL 时触发） */
  onChange: (url: string) => void;
  /** 字段标签，默认「封面图」 */
  label?: string;
  /** 是否必填（仅用于 UI 星号提示，实际校验由调用方在保存前完成） */
  required?: boolean;
  /** Storage 内的子路径前缀，默认 covers */
  pathPrefix?: string;
  /** 辅助说明文字 */
  hint?: string;
}

/**
 * 可复用封面录入控件：支持本地上传到 blog-images bucket（covers/ 路径）+ URL 手动输入兜底 + 预览。
 * 供文章编辑器、分类管理、章节弹框共用，统一上传逻辑。
 */
export function CoverImageField({
  value,
  onChange,
  label = "封面图",
  required = false,
  pathPrefix = "covers",
  hint,
}: CoverImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!file.type.startsWith("image/")) {
        setError("仅支持上传图片文件");
        return null;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("图片大小不能超过 5MB");
        return null;
      }

      setError(null);
      setUploading(true);
      const supabase = createClient();
      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `${pathPrefix}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError("上传失败：" + uploadError.message);
        setUploading(false);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      setUploading(false);
      return urlData.publicUrl;
    },
    [pathPrefix]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      // 重置 input，确保同一文件可再次选择触发 change
      if (inputRef.current) inputRef.current.value = "";
      if (!file) return;
      const url = await uploadImage(file);
      if (url) onChange(url);
    },
    [uploadImage, onChange]
  );

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--error)]">*</span>}
      </label>

      <div className="flex items-start gap-3">
        {/* 预览 / 占位 */}
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="封面预览" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--text-tertiary)]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* 操作区 */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
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
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  上传图片
                </>
              )}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-[var(--radius-md)] px-2 py-1.5 text-xs text-[var(--text-tertiary)] transition-colors hover:text-[var(--error)]"
              >
                移除
              </button>
            )}
          </div>

          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="或粘贴图片 URL：https://..."
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none"
          />

          {hint && <p className="text-xs text-[var(--text-tertiary)]">{hint}</p>}
          {error && <p className="text-xs text-[var(--error)]">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
