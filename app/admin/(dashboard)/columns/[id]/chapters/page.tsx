import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ChapterManager } from "@/components/admin/chapter-manager";

export default async function AdminChaptersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 获取专栏信息
  const { data: column } = await supabase
    .from("columns")
    .select("id, title_zh, title_en, slug")
    .eq("id", id)
    .single();

  if (!column) notFound();

  // 获取章节列表
  const { data: chapters } = await supabase
    .from("column_chapters")
    .select("id, column_id, sort, title_zh, title_en")
    .eq("column_id", id)
    .order("sort", { ascending: true });

  // 获取每个章节的文章数
  const { data: postCounts } = await supabase
    .from("posts")
    .select("chapter_id")
    .eq("column_id", id)
    .not("chapter_id", "is", null);

  const countMap: Record<string, number> = {};
  (postCounts || []).forEach((p: any) => {
    countMap[p.chapter_id] = (countMap[p.chapter_id] || 0) + 1;
  });

  const chaptersWithCount = (chapters || []).map((ch) => ({
    ...ch,
    articleCount: countMap[ch.id] || 0,
  }));

  return (
    <ChapterManager
      column={{
        id: column.id,
        title_zh: column.title_zh,
        title_en: column.title_en,
        slug: column.slug,
      }}
      chapters={chaptersWithCount}
    />
  );
}
