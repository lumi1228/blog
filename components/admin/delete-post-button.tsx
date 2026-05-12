"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface DeletePostButtonProps {
  postId: string;
  title: string;
}

export function DeletePostButton({ postId, title }: DeletePostButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`确定要删除「${title}」吗？此操作不可撤销。`)) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      alert("删除失败：" + error.message);
      return;
    }

    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--error)] hover:bg-[var(--error)]/10"
    >
      删除
    </button>
  );
}
