import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { PostEditor } from "@/components/admin/post-editor";

export default async function NewPostPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 获取分类和标签列表
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_zh")
    .order("sort");

  const { data: tags } = await supabase
    .from("tags")
    .select("id, slug, name_zh")
    .order("name_zh");

  // 获取专栏和章节列表
  const { data: columns } = await supabase
    .from("columns")
    .select("id, slug, title_zh")
    .order("sort");

  const { data: chapters } = await supabase
    .from("column_chapters")
    .select("id, column_id, title_zh")
    .order("sort");

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        新建文章
      </h1>
      <PostEditor
        categories={categories || []}
        tags={tags || []}
        columns={columns || []}
        chapters={chapters || []}
      />
    </div>
  );
}
