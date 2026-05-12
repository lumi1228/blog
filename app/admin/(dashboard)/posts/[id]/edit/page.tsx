import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PostEditor } from "@/components/admin/post-editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 获取文章数据
  const { data: post } = await supabase
    .from("posts")
    .select(
      `
      id, slug, cover_image, status, published_at, reading_time,
      title_zh, title_en, excerpt_zh, excerpt_en, content_zh, content_en,
      category_id, available_locales,
      post_tags(tag_id)
    `
    )
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  // 获取分类和标签列表
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_zh")
    .order("sort");

  const { data: tags } = await supabase
    .from("tags")
    .select("id, slug, name_zh")
    .order("name_zh");

  // 转换为编辑器需要的格式
  const initialData = {
    id: post.id,
    slug: post.slug,
    coverImage: post.cover_image || "",
    status: post.status as "draft" | "published",
    categoryId: post.category_id || "",
    tagIds: (post.post_tags || []).map((pt: any) => pt.tag_id),
    titleZh: post.title_zh || "",
    titleEn: post.title_en || "",
    excerptZh: post.excerpt_zh || "",
    excerptEn: post.excerpt_en || "",
    contentZh: post.content_zh || "",
    contentEn: post.content_en || "",
  };

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        编辑文章
      </h1>
      <PostEditor
        categories={categories || []}
        tags={tags || []}
        initialData={initialData}
      />
    </div>
  );
}
