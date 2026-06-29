import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ColumnsWorkspace } from "@/components/admin/columns-workspace";

export default async function AdminColumnsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // ① 专栏列表（含文章数）
  const [{ data: columns }, { data: postCounts }] = await Promise.all([
    supabase
      .from("columns")
      .select("id, slug, sort, title_zh, title_en, description_zh, description_en, cover_image")
      .order("sort", { ascending: true }),
    supabase.from("posts").select("column_id").not("column_id", "is", null),
  ]);

  const countMap: Record<string, number> = {};
  (postCounts || []).forEach((p: { column_id: string }) => {
    countMap[p.column_id] = (countMap[p.column_id] || 0) + 1;
  });

  const columnsWithCount = (columns || []).map((c) => ({
    ...c,
    articleCount: countMap[c.id] || 0,
  }));

  // ② 第一个专栏的第一个章节的文章（作为右栏初始内容）
  const firstColumn = columnsWithCount[0] ?? null;
  let initialChapters: {
    id: string;
    column_id: string;
    sort: number;
    title_zh: string;
    title_en: string | null;
    cover_image: string | null;
  }[] = [];
  let initialPosts: {
    id: string;
    slug: string;
    status: string;
    created_at: string;
    column_order: number | null;
    chapter_id: string | null;
    title_zh: string;
    title_en: string | null;
    post_tags: { tags: { name_zh: string } | null }[] | null;
  }[] = [];
  let initialChapterId: string | null = null;

  if (firstColumn) {
    const { data: chapters } = await supabase
      .from("column_chapters")
      .select("id, column_id, sort, title_zh, title_en, cover_image")
      .eq("column_id", firstColumn.id)
      .order("sort", { ascending: true });

    initialChapters = chapters ?? [];
    const firstChapter = initialChapters[0] ?? null;
    initialChapterId = firstChapter?.id ?? null;

    const { data: posts } = await supabase
      .from("posts")
      .select("id, slug, status, created_at, column_order, chapter_id, title_zh, title_en, post_tags(tags(name_zh))")
      .eq("column_id", firstColumn.id)
      .filter(
        "chapter_id",
        firstChapter ? "eq" : "is",
        firstChapter ? firstChapter.id : null
      )
      .order("column_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    initialPosts = (posts ?? []) as unknown as typeof initialPosts;
  }

  return (
    <ColumnsWorkspace
      columns={columnsWithCount}
      initialColumnId={firstColumn?.id ?? null}
      initialChapters={initialChapters}
      initialChapterId={initialChapterId}
      initialPosts={initialPosts}
    />
  );
}
