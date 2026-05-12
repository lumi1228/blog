import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, sort, name_zh, name_en, description_zh, description_en")
    .order("sort", { ascending: true });

  // 获取每个分类的文章数
  const { data: postCounts } = await supabase
    .from("posts")
    .select("category_id")
    .eq("status", "published");

  const countMap: Record<string, number> = {};
  (postCounts || []).forEach((p: any) => {
    countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
  });

  const categoriesWithCount = (categories || []).map((c) => ({
    ...c,
    articleCount: countMap[c.id] || 0,
  }));

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        分类管理
      </h1>
      <CategoryManager categories={categoriesWithCount} />
    </div>
  );
}
