import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { TagManager } from "@/components/admin/tag-manager";

export default async function AdminTagsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: tags } = await supabase
    .from("tags")
    .select("id, slug, name_zh, name_en")
    .order("name_zh");

  // 获取每个标签的文章数
  const { data: tagCounts } = await supabase
    .from("post_tags")
    .select("tag_id");

  const countMap: Record<string, number> = {};
  (tagCounts || []).forEach((pt: any) => {
    countMap[pt.tag_id] = (countMap[pt.tag_id] || 0) + 1;
  });

  const tagsWithCount = (tags || []).map((t) => ({
    ...t,
    articleCount: countMap[t.id] || 0,
  }));

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        标签管理
      </h1>
      <TagManager tags={tagsWithCount} />
    </div>
  );
}
