import { createAdminClient } from "@/utils/supabase/server";
import { PostsPageClient } from "@/components/admin/posts-page-client";

export default async function AdminPostsPage() {
  const supabase = createAdminClient();

  const [
    { data: posts },
    { data: categories },
    { data: tags },
    { data: columns },
    { data: chapters },
  ] = await Promise.all([
    supabase
      .from("posts")
      .select(`id, slug, status, created_at, title_zh, title_en, categories(name_zh)`)
      .is("column_id", null)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, slug, name_zh").order("sort"),
    supabase.from("tags").select("id, slug, name_zh").order("name_zh"),
    supabase.from("columns").select("id, slug, title_zh").order("sort"),
    supabase.from("column_chapters").select("id, column_id, title_zh").order("sort"),
  ]);

  return (
    <PostsPageClient
      initialPosts={(posts || []) as any}
      categories={categories || []}
      tags={tags || []}
      columns={columns || []}
      chapters={chapters || []}
    />
  );
}
