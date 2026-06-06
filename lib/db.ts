import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type {
  Post,
  Category,
  Tag,
  SearchIndexEntry,
  SitemapPost,
  SitemapCategoryOrTag,
} from "@/lib/types";

/**
 * 数据查询层
 * 封装所有 Supabase 查询，供 Server Component 直接调用
 */

type Locale = "zh-CN" | "en";

// 获取 Supabase 客户端（Server Component 中使用）
async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

// ============================================
// 文章查询
// ============================================

/**
 * 获取已发布文章列表
 */
export async function getPosts(options?: {
  locale?: Locale;
  limit?: number;
  offset?: number;
  categorySlug?: string;
  tagSlug?: string;
}): Promise<{ posts: Post[]; total: number }> {
  const { locale = "zh-CN", limit = 10, offset = 0, categorySlug, tagSlug } = options || {};
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  let query = supabase
    .from("posts")
    .select(
      `
      id, slug, cover_image, status, published_at, updated_at, reading_time, view_count,
      title_zh, title_en, excerpt_zh, excerpt_en, available_locales,
      categories!inner(id, slug, name_zh, name_en),
      post_tags(tags(id, slug, name_zh, name_en))
    `,
      { count: "exact" }
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("获取文章列表失败:", error);
    return { posts: [], total: 0 };
  }

  let posts: Post[] = (data || []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    title: isZh ? row.title_zh : (row.title_en || row.title_zh),
    excerpt: isZh ? row.excerpt_zh : (row.excerpt_en || row.excerpt_zh),
    coverImage: row.cover_image,
    publishedAt: row.published_at,
    updatedAt: row.updated_at ?? undefined,
    readingTime: row.reading_time,
    viewCount: row.view_count,
    availableLocales: row.available_locales ?? undefined,
    category: {
      name: isZh ? row.categories.name_zh : (row.categories.name_en || row.categories.name_zh),
      slug: row.categories.slug,
    },
    tags: (row.post_tags || []).map((pt: any) => ({
      name: isZh ? pt.tags.name_zh : (pt.tags.name_en || pt.tags.name_zh),
      slug: pt.tags.slug,
    })),
  }));

  // 如果按标签筛选，在应用层过滤（Supabase 嵌套关联过滤有限制）
  if (tagSlug) {
    posts = posts.filter((p) => p.tags.some((t) => t.slug === tagSlug));
  }

  return { posts, total: count || 0 };
}

/**
 * 根据 slug 获取文章详情（含正文）
 */
export async function getPostBySlug(
  slug: string,
  locale: Locale = "zh-CN"
): Promise<Post | null> {
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id, slug, cover_image, status, published_at, updated_at, reading_time, view_count,
      title_zh, title_en, excerpt_zh, excerpt_en, content_zh, content_en, available_locales,
      categories(id, slug, name_zh, name_en),
      post_tags(tags(id, slug, name_zh, name_en))
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  const cat = data.categories as any;
  return {
    id: data.id,
    slug: data.slug,
    title: isZh ? data.title_zh : (data.title_en || data.title_zh),
    excerpt: isZh ? data.excerpt_zh : (data.excerpt_en || data.excerpt_zh),
    content: isZh ? data.content_zh : (data.content_en || data.content_zh),
    coverImage: data.cover_image,
    publishedAt: data.published_at,
    updatedAt: data.updated_at ?? undefined,
    readingTime: data.reading_time,
    viewCount: data.view_count,
    availableLocales: data.available_locales ?? undefined,
    category: {
      name: isZh ? cat.name_zh : (cat.name_en || cat.name_zh),
      slug: cat.slug,
    },
    tags: (data.post_tags || []).map((pt: any) => ({
      name: isZh ? pt.tags.name_zh : (pt.tags.name_en || pt.tags.name_zh),
      slug: pt.tags.slug,
    })),
  };
}

/**
 * 获取相邻文章（上一篇/下一篇）
 */
export async function getAdjacentPosts(
  slug: string,
  locale: Locale = "zh-CN"
): Promise<{ prev: Post | null; next: Post | null }> {
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  // 获取当前文章的发布时间
  const { data: current } = await supabase
    .from("posts")
    .select("published_at")
    .eq("slug", slug)
    .single();

  if (!current) return { prev: null, next: null };

  // 上一篇（比当前更新的）
  const { data: prevData } = await supabase
    .from("posts")
    .select("id, slug, title_zh, title_en")
    .eq("status", "published")
    .gt("published_at", current.published_at)
    .order("published_at", { ascending: true })
    .limit(1)
    .single();

  // 下一篇（比当前更旧的）
  const { data: nextData } = await supabase
    .from("posts")
    .select("id, slug, title_zh, title_en")
    .eq("status", "published")
    .lt("published_at", current.published_at)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  const mapSimplePost = (row: any): Post => ({
    id: row.id,
    slug: row.slug,
    title: isZh ? row.title_zh : (row.title_en || row.title_zh),
    excerpt: "",
    coverImage: null,
    publishedAt: "",
    readingTime: 0,
    category: { name: "", slug: "" },
    tags: [],
  });

  return {
    prev: prevData ? mapSimplePost(prevData) : null,
    next: nextData ? mapSimplePost(nextData) : null,
  };
}

// ============================================
// 分类查询
// ============================================

/**
 * 获取所有分类
 */
export async function getCategories(locale: Locale = "zh-CN"): Promise<Category[]> {
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, sort, name_zh, name_en, description_zh, description_en")
    .order("sort", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: isZh ? row.name_zh : (row.name_en || row.name_zh),
    description: isZh ? row.description_zh : (row.description_en || row.description_zh),
    sort: row.sort,
  }));
}

/**
 * 根据 slug 获取分类
 */
export async function getCategoryBySlug(
  slug: string,
  locale: Locale = "zh-CN"
): Promise<Category | null> {
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, sort, name_zh, name_en, description_zh, description_en")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: isZh ? data.name_zh : (data.name_en || data.name_zh),
    description: isZh ? data.description_zh : (data.description_en || data.description_zh),
    sort: data.sort,
  };
}

// ============================================
// 标签查询
// ============================================

/**
 * 获取所有标签
 */
export async function getTags(locale: Locale = "zh-CN"): Promise<Tag[]> {
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  const { data, error } = await supabase
    .from("tags")
    .select("id, slug, name_zh, name_en")
    .order("name_zh", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: isZh ? row.name_zh : (row.name_en || row.name_zh),
  }));
}

/**
 * 根据 slug 获取标签
 */
export async function getTagBySlug(
  slug: string,
  locale: Locale = "zh-CN"
): Promise<Tag | null> {
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  const { data, error } = await supabase
    .from("tags")
    .select("id, slug, name_zh, name_en")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: isZh ? data.name_zh : (data.name_en || data.name_zh),
  };
}

/**
 * 增加文章阅读量
 */
export async function incrementViewCount(postId: string): Promise<void> {
  const supabase = await getSupabase();
  await supabase.rpc("increment_view_count", { post_id: postId });
}

// ============================================
// 搜索索引
// ============================================

/**
 * 获取指定语言的搜索索引（供 /api/search-index 使用）
 * 仅返回已发布文章的精简字段，en 时额外过滤 availableLocales
 */
export async function getSearchIndex(locale: "zh-CN" | "en"): Promise<SearchIndexEntry[]> {
  const { posts } = await getPosts({ locale, limit: 1000 });

  return posts
    .filter((p) => {
      if (locale === "en") {
        return p.availableLocales?.includes("en") ?? false;
      }
      return true;
    })
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      tags: p.tags.map((t) => t.name),
      publishedAt: p.publishedAt,
    }));
}

// ============================================
// Sitemap 专用查询
// ============================================

/**
 * 获取所有已发布文章的 sitemap 所需字段
 */
export async function getAllPostsForSitemap(): Promise<SitemapPost[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("posts")
    .select("slug, updated_at, available_locales")
    .eq("status", "published");

  if (error || !data) {
    console.error("获取 sitemap 文章列表失败:", error);
    return [];
  }

  return data.map((row: any) => ({
    slug: row.slug,
    updatedAt: row.updated_at,
    availableLocales: row.available_locales ?? ["zh-CN"],
  }));
}

/**
 * 获取所有分类的 slug（用于 sitemap）
 */
export async function getAllCategoriesForSitemap(): Promise<SitemapCategoryOrTag[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("categories").select("slug");

  if (error || !data) {
    console.error("获取 sitemap 分类列表失败:", error);
    return [];
  }

  return data.map((row: any) => ({ slug: row.slug }));
}

/**
 * 获取所有标签的 slug（用于 sitemap）
 */
export async function getAllTagsForSitemap(): Promise<SitemapCategoryOrTag[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("tags").select("slug");

  if (error || !data) {
    console.error("获取 sitemap 标签列表失败:", error);
    return [];
  }

  return data.map((row: any) => ({ slug: row.slug }));
}
