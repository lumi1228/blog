import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type {
  Post,
  Category,
  Tag,
  Column,
  ColumnChapter,
  ColumnDetail,
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
  /** 是否排除专栏文章（默认 true，首页/技术列表不显示专栏文章） */
  excludeColumnPosts?: boolean;
}): Promise<{ posts: Post[]; total: number }> {
  const { locale = "zh-CN", limit = 10, offset = 0, categorySlug, tagSlug, excludeColumnPosts = true } = options || {};
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  // 按分类筛选时使用 inner join，否则筛选条件无法过滤父表（posts）行，
  // 会导致返回所有已发布文章（即“该分类下无文章却展示了数据”的根因）
  const categoryJoin = categorySlug
    ? "category:categories!inner(id, slug, name_zh, name_en)"
    : "category:categories(id, slug, name_zh, name_en)";

  let query = supabase
    .from("posts")
    .select(
      `
      id, slug, cover_image, status, published_at, created_at, updated_at, reading_time, view_count,
      title_zh, title_en, excerpt_zh, excerpt_en, available_locales,
      column_id, chapter_id, column_order, show_in_list,
      ${categoryJoin},
      post_tags(tags(id, slug, name_zh, name_en))
    `,
      { count: "exact" }
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (categorySlug) {
    // 使用 select 中的别名 category 进行过滤
    query = query.eq("category.slug", categorySlug);
  }

  // 默认排除专栏文章（show_in_list 为 false 的专栏文章）
  if (excludeColumnPosts) {
    query = query.or("column_id.is.null,show_in_list.eq.true");
  }

  const { data, count, error } = await Promise.race([
    query,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("getPosts timeout")), 8000)
    ),
  ]).catch((err) => {
    console.error("获取文章列表超时或失败:", err?.message ?? err);
    return { data: null, count: 0, error: err };
  }) as Awaited<typeof query>;

  if (error) {
    console.error("获取文章列表失败 code:", (error as any).code, "message:", (error as any).message);
    return { posts: [], total: 0 };
  }

  let posts: Post[] = (data || []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    title: isZh ? row.title_zh : (row.title_en || row.title_zh),
    excerpt: isZh ? row.excerpt_zh : (row.excerpt_en || row.excerpt_zh),
    coverImage: row.cover_image,
    publishedAt: row.published_at || row.created_at,
    updatedAt: row.updated_at ?? undefined,
    readingTime: row.reading_time,
    viewCount: row.view_count,
    availableLocales: row.available_locales ?? undefined,
    columnId: row.column_id ?? null,
    chapterId: row.chapter_id ?? null,
    columnOrder: row.column_order ?? null,
    showInList: row.show_in_list ?? false,
    category: {
      name: isZh ? row.category?.name_zh : (row.category?.name_en || row.category?.name_zh),
      slug: row.category?.slug ?? "",
    },
    tags: (row.post_tags || []).map((pt: any) => ({
      name: isZh ? pt.tags?.name_zh : (pt.tags?.name_en || pt.tags?.name_zh),
      slug: pt.tags?.slug ?? "",
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
      id, slug, cover_image, status, published_at, created_at, updated_at, reading_time, view_count,
      title_zh, title_en, excerpt_zh, excerpt_en, content_zh, content_en, available_locales,
      column_id, chapter_id, column_order, show_in_list,
      category:categories(id, slug, name_zh, name_en),
      post_tags(tags(id, slug, name_zh, name_en))
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  const cat = data.category as any;
  return {
    id: data.id,
    slug: data.slug,
    title: isZh ? data.title_zh : (data.title_en || data.title_zh),
    excerpt: isZh ? data.excerpt_zh : (data.excerpt_en || data.excerpt_zh),
    content: isZh ? data.content_zh : (data.content_en || data.content_zh),
    coverImage: data.cover_image,
    publishedAt: data.published_at || data.created_at,
    updatedAt: data.updated_at ?? undefined,
    readingTime: data.reading_time,
    viewCount: data.view_count,
    availableLocales: data.available_locales ?? undefined,
    columnId: data.column_id ?? null,
    chapterId: data.chapter_id ?? null,
    columnOrder: data.column_order ?? null,
    showInList: data.show_in_list ?? false,
    category: {
      name: isZh ? cat.name_zh : (cat.name_en || cat.name_zh),
      slug: cat.slug,
    },
    tags: (data.post_tags || []).map((pt: any) => ({
      name: isZh ? pt.tags?.name_zh : (pt.tags?.name_en || pt.tags?.name_zh),
      slug: pt.tags?.slug ?? "",
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

  // 上一篇（比当前更新的），排除专栏文章
  const { data: prevData } = await supabase
    .from("posts")
    .select("id, slug, title_zh, title_en")
    .eq("status", "published")
    .is("column_id", null)
    .gt("published_at", current.published_at)
    .order("published_at", { ascending: true })
    .limit(1)
    .single();

  // 下一篇（比当前更旧的），排除专栏文章
  const { data: nextData } = await supabase
    .from("posts")
    .select("id, slug, title_zh, title_en")
    .eq("status", "published")
    .is("column_id", null)
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

// ============================================
// 专栏查询
// ============================================

/**
 * 获取所有专栏列表
 */
export async function getColumns(locale: Locale = "zh-CN"): Promise<Column[]> {
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  const { data, error } = await supabase
    .from("columns")
    .select("id, slug, sort, title_zh, title_en, description_zh, description_en, cover_image")
    .order("sort", { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    sort: row.sort,
    title: isZh ? row.title_zh : (row.title_en || row.title_zh),
    description: isZh ? row.description_zh : (row.description_en || row.description_zh),
    coverImage: row.cover_image ?? null,
  }));
}

/**
 * 根据 slug 获取专栏详情（含章节和文章）
 */
export async function getColumnBySlug(
  columnSlug: string,
  locale: Locale = "zh-CN"
): Promise<ColumnDetail | null> {
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  // 获取专栏基本信息
  const { data: columnData, error: columnError } = await supabase
    .from("columns")
    .select("id, slug, sort, title_zh, title_en, description_zh, description_en, cover_image")
    .eq("slug", columnSlug)
    .single();

  if (columnError || !columnData) return null;

  // 获取章节列表
  const { data: chapters, error: chaptersError } = await supabase
    .from("column_chapters")
    .select("id, column_id, sort, title_zh, title_en")
    .eq("column_id", columnData.id)
    .order("sort", { ascending: true });

  if (chaptersError) {
    console.error("获取专栏章节失败:", chaptersError);
    return null;
  }

  // 获取该专栏下所有已发布文章
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      `
      id, slug, cover_image, status, published_at, created_at, updated_at, reading_time, view_count,
      title_zh, title_en, excerpt_zh, excerpt_en, available_locales,
      column_id, chapter_id, column_order, show_in_list,
      category:categories(id, slug, name_zh, name_en),
      post_tags(tags(id, slug, name_zh, name_en))
    `
    )
    .eq("column_id", columnData.id)
    .eq("status", "published")
    .order("column_order", { ascending: true });

  if (postsError) {
    console.error("获取专栏文章失败:", postsError);
  }

  const mapPost = (row: any): Post => ({
    id: row.id,
    slug: row.slug,
    title: isZh ? row.title_zh : (row.title_en || row.title_zh),
    excerpt: isZh ? row.excerpt_zh : (row.excerpt_en || row.excerpt_zh),
    coverImage: row.cover_image,
    publishedAt: row.published_at || row.created_at,
    updatedAt: row.updated_at ?? undefined,
    readingTime: row.reading_time,
    viewCount: row.view_count,
    availableLocales: row.available_locales ?? undefined,
    columnId: row.column_id ?? null,
    chapterId: row.chapter_id ?? null,
    columnOrder: row.column_order ?? null,
    showInList: row.show_in_list ?? false,
    category: {
      name: isZh ? row.category?.name_zh : (row.category?.name_en || row.category?.name_zh),
      slug: row.category?.slug ?? "",
    },
    tags: (row.post_tags || []).map((pt: any) => ({
      name: isZh ? pt.tags?.name_zh : (pt.tags?.name_en || pt.tags?.name_zh),
      slug: pt.tags?.slug ?? "",
    })),
  });

  const allPosts = (posts || []).map(mapPost);

  // 将文章按章节分组
  const chapterPostsMap = new Map<string, Post[]>();
  // 无章节的文章归入 "uncategorized"
  const uncategorized: Post[] = [];

  for (const post of allPosts) {
    if (post.chapterId) {
      const list = chapterPostsMap.get(post.chapterId) || [];
      list.push(post);
      chapterPostsMap.set(post.chapterId, list);
    } else {
      uncategorized.push(post);
    }
  }

  const chapterList = (chapters || []).map((ch: any) => ({
    id: ch.id,
    columnId: ch.column_id,
    sort: ch.sort,
    title: isZh ? ch.title_zh : (ch.title_en || ch.title_zh),
    posts: chapterPostsMap.get(ch.id) || [],
  }));

  // 如果有未归类文章，添加一个虚拟章节
  if (uncategorized.length > 0) {
    chapterList.push({
      id: "__uncategorized__",
      columnId: columnData.id,
      sort: 9999,
      title: isZh ? "未分类" : "Uncategorized",
      posts: uncategorized,
    });
  }

  // 按 sort 排序
  chapterList.sort((a, b) => a.sort - b.sort);

  return {
    id: columnData.id,
    slug: columnData.slug,
    sort: columnData.sort,
    title: isZh ? columnData.title_zh : (columnData.title_en || columnData.title_zh),
    description: isZh ? columnData.description_zh : (columnData.description_en || columnData.description_zh),
    coverImage: columnData.cover_image ?? null,
    chapters: chapterList,
  };
}

/**
 * 在专栏内获取相邻文章（按 column_order）
 */
export async function getColumnAdjacentPosts(
  columnSlug: string,
  postSlug: string,
  locale: Locale = "zh-CN"
): Promise<{ prev: Post | null; next: Post | null }> {
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  // 获取当前文章的专栏、章节、排序信息
  const { data: current } = await supabase
    .from("posts")
    .select("id, column_order, column_id, chapter_id")
    .eq("slug", postSlug)
    .single();

  if (!current || !current.column_id || current.column_order === null) {
    return { prev: null, next: null };
  }

  // 验证专栏 slug 匹配
  const { data: column } = await supabase
    .from("columns")
    .select("id")
    .eq("slug", columnSlug)
    .single();

  if (!column || column.id !== current.column_id) return { prev: null, next: null };

  // 基础查询条件：限定在同一章节内（chapter_id 相同）
  // 若文章没有 chapter_id，则退回到同一专栏范围

  // 查询上一篇（chapter 内 column_order 更小的最大一条）
  let prevQuery = supabase
    .from("posts")
    .select("id, slug, title_zh, title_en")
    .eq("status", "published")
    .not("column_order", "is", null)
    .lt("column_order", current.column_order)
    .order("column_order", { ascending: false })
    .limit(1);

  if (current.chapter_id) {
    prevQuery = prevQuery.eq("chapter_id", current.chapter_id) as typeof prevQuery;
  } else {
    prevQuery = prevQuery.eq("column_id", current.column_id).is("chapter_id", null) as typeof prevQuery;
  }

  const { data: prevData } = await prevQuery.single();

  // 查询下一篇（chapter 内 column_order 更大的最小一条）
  let nextQuery = supabase
    .from("posts")
    .select("id, slug, title_zh, title_en")
    .eq("status", "published")
    .not("column_order", "is", null)
    .gt("column_order", current.column_order)
    .order("column_order", { ascending: true })
    .limit(1);

  if (current.chapter_id) {
    nextQuery = nextQuery.eq("chapter_id", current.chapter_id) as typeof nextQuery;
  } else {
    nextQuery = nextQuery.eq("column_id", current.column_id).is("chapter_id", null) as typeof nextQuery;
  }

  const { data: nextData } = await nextQuery.single();

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
