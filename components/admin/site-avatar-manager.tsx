/**
 * 独立的主站头像管理客户端组件文件。
 * --- @ty.aicoding@ ---
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * 主站头像池数据行。
 * --- @ty.aicoding@ ---
 */
export interface SiteAvatarRow {
  id: string;
  url: string;
  label: string | null;
  enabled: boolean;
  created_at: string;
}

/**
 * 主站头像管理组件参数。
 * --- @ty.aicoding@ ---
 */
interface SiteAvatarManagerProps {
  siteAvatars: SiteAvatarRow[];
}

/**
 * 渲染主站头像列表，并提供上传、启停和删除操作。
 * --- @ty.aicoding@ ---
 */
export function SiteAvatarManager({ siteAvatars }: SiteAvatarManagerProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  /**
   * 上传图片并将公开地址写入头像池。
   * --- @ty.aicoding@ ---
   */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
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
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload-site-avatar", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert("上传失败：" + (data.error || response.status));
        return;
      }

      const { url } = await response.json();
      const supabase = createClient();
      const { error } = await supabase
        .from("site_avatars")
        .insert({ url, enabled: true });
      if (error) {
        alert("保存失败：" + error.message);
        return;
      }
      router.refresh();
    } catch (error) {
      alert("上传失败：" + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUploading(false);
    }
  };

  /**
   * 切换单张主站头像的启用状态。
   * --- @ty.aicoding@ ---
   */
  const toggleEnabled = async (row: SiteAvatarRow) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("site_avatars")
      .update({ enabled: !row.enabled })
      .eq("id", row.id);
    if (error) {
      alert("操作失败：" + error.message);
      return;
    }
    router.refresh();
  };

  /**
   * 删除一条头像池记录，Storage 文件仍保留。
   * --- @ty.aicoding@ ---
   */
  const remove = async (row: SiteAvatarRow) => {
    if (!confirm("确定删除该头像吗？Storage 中的文件不会自动清理。")) return;
    const supabase = createClient();
    const { error } = await supabase.from("site_avatars").delete().eq("id", row.id);
    if (error) {
      alert("删除失败：" + error.message);
      return;
    }
    router.refresh();
  };

  const enabledCount = siteAvatars.filter((avatar) => avatar.enabled).length;

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
        <div className="mb-1 text-sm font-semibold text-[var(--text-primary)]">主站头像池</div>
        <p className="text-xs text-[var(--text-tertiary)]">
          上传多张头像后，主页和关于页每次加载时会随机展示其中一张已启用的头像。
          当前已启用{" "}
          <span className="font-medium text-[var(--text-primary)]">{enabledCount}</span> 张
          / 共 <span className="font-medium text-[var(--text-primary)]">{siteAvatars.length}</span> 张。
          与简历证件照独立存储，互不影响。
        </p>
      </div>

      {siteAvatars.length === 0 && (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] px-8 py-12 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">暂无头像，点击下方按钮上传第一张</p>
        </div>
      )}

      {siteAvatars.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {siteAvatars.map((item) => (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--bg-secondary)] ${
                item.enabled
                  ? "border-[var(--accent-primary)]/30"
                  : "border-[var(--border-subtle)] opacity-60"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.label || "主站头像"}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute right-2 top-2">
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    item.enabled
                      ? "bg-[var(--success)]/90 text-white"
                      : "bg-[var(--bg-tertiary)]/90 text-[var(--text-tertiary)]"
                  }`}
                >
                  {item.enabled ? "启用" : "停用"}
                </span>
              </div>
              <div className="space-y-1.5 p-2">
                <div className="truncate text-xs text-[var(--text-tertiary)]">{item.label || "—"}</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleEnabled(item)}
                    className="flex-1 rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)] px-2 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    {item.enabled ? "停用" : "启用"}
                  </button>
                  <button
                    onClick={() => remove(item)}
                    className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--bg-primary)] transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-glow-accent)]">
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {uploading ? "上传中..." : "上传头像"}
      </label>
    </div>
  );
}
