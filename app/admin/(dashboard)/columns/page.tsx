import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ColumnManager } from "@/components/admin/column-manager";

export default async function AdminColumnsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: columns } = await supabase
    .from("columns")
    .select("id, slug, sort, title_zh, title_en, description_zh, description_en, cover_image")
    .order("sort", { ascending: true });

  // 获取每个专栏的文章数
  const { data: postCounts } = await supabase
    .from("posts")
    .select("column_id")
    .not("column_id", "is", null);

  const countMap: Record<string, number> = {};
  (postCounts || []).forEach((p: any) => {
    countMap[p.column_id] = (countMap[p.column_id] || 0) + 1;
  });

  const columnsWithCount = (columns || []).map((c) => ({
    ...c,
    articleCount: countMap[c.id] || 0,
  }));

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        专栏管理
      </h1>
      <ColumnManager columns={columnsWithCount} />
    </div>
  );
}
