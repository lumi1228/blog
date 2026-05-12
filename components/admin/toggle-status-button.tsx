"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface ToggleStatusButtonProps {
  postId: string;
  currentStatus: string;
}

export function ToggleStatusButton({ postId, currentStatus }: ToggleStatusButtonProps) {
  const router = useRouter();

  const handleToggle = async () => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const supabase = createClient();

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === "published") {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", postId);

    if (error) {
      alert("操作失败：" + error.message);
      return;
    }

    router.refresh();
  };

  const isPublished = currentStatus === "published";

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-1 rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-medium transition-colors duration-[var(--duration-fast)] ${
        isPublished
          ? "bg-[var(--success)]/15 text-[var(--success)] hover:bg-[var(--success)]/25"
          : "bg-[var(--warning)]/15 text-[var(--warning)] hover:bg-[var(--warning)]/25"
      }`}
      title={isPublished ? "点击切换为草稿" : "点击发布"}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} />
      {isPublished ? "已发布" : "草稿"}
    </button>
  );
}
