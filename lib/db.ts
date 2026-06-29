import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Post,
  Category,
  Tag,
  Column,
  ColumnDetail,
  ColumnWithFirstPost,
  SearchIndexEntry,
  SitemapPost,
  SitemapCategoryOrTag,
  ResumeData,
  SiteAvatar,
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
    ? "category:categories!inner(id, slug, name_zh, name_en, cover_image)"
    : "category:categories(id, slug, name_zh, name_en, cover_image)";

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
    coverImageFallback: row.category?.cover_image ?? null,
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
      category:categories(id, slug, name_zh, name_en, cover_image),
      chapter:column_chapters(id, cover_image),
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
  const chapter = data.chapter as { cover_image?: string | null } | null;
  return {
    id: data.id,
    slug: data.slug,
    title: isZh ? data.title_zh : (data.title_en || data.title_zh),
    excerpt: isZh ? data.excerpt_zh : (data.excerpt_en || data.excerpt_zh),
    content: isZh ? data.content_zh : (data.content_en || data.content_zh),
    coverImage: data.cover_image,
    // 展示回退：章节封面优先于分类封面（章节仅文档文章拥有，天然区分博客/文档语境）
    coverImageFallback: chapter?.cover_image ?? cat?.cover_image ?? null,
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
    .select("id, slug, sort, name_zh, name_en, description_zh, description_en, cover_image")
    .order("sort", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: isZh ? row.name_zh : (row.name_en || row.name_zh),
    description: isZh ? row.description_zh : (row.description_en || row.description_zh),
    sort: row.sort,
    coverImage: row.cover_image ?? null,
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
    .select("id, slug, sort, name_zh, name_en, description_zh, description_en, cover_image")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: isZh ? data.name_zh : (data.name_en || data.name_zh),
    description: isZh ? data.description_zh : (data.description_en || data.description_zh),
    sort: data.sort,
    coverImage: data.cover_image ?? null,
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

/**
 * 获取文档作用域的搜索索引（供文档子站搜索使用）。
 * 与站点搜索相反：仅包含归属文档集（专栏）的文章，
 * 并附带 /docs/[set]/[slug] 目标路径。
 * en 时按 availableLocales 过滤。
 */
export async function getDocsSearchIndex(
  locale: "zh-CN" | "en"
): Promise<SearchIndexEntry[]> {
  const columns = await getColumns(locale);

  const entries: SearchIndexEntry[] = [];

  for (const column of columns) {
    const detail = await getColumnBySlug(column.slug, locale);
    if (!detail) continue;

    for (const chapter of detail.chapters) {
      for (const post of chapter.posts) {
        if (locale === "en" && !(post.availableLocales?.includes("en") ?? false)) {
          continue;
        }
        entries.push({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          tags: post.tags.map((t) => t.name),
          publishedAt: post.publishedAt,
          url: `/docs/${column.slug}/${post.slug}`,
        });
      }
    }
  }

  return entries;
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
 * 获取文档站所有路径（用于 sitemap）。
 * 返回每个文档集（专栏）及其下文章的相对路径与可用语言。
 */
export async function getAllDocsForSitemap(): Promise<{
  setSlug: string;
  postSlugs: { slug: string; availableLocales: ("zh-CN" | "en")[]; updatedAt?: string }[];
}[]> {
  const columns = await getColumns("zh-CN");
  const result: {
    setSlug: string;
    postSlugs: { slug: string; availableLocales: ("zh-CN" | "en")[]; updatedAt?: string }[];
  }[] = [];

  for (const column of columns) {
    const detail = await getColumnBySlug(column.slug, "zh-CN");
    if (!detail) continue;

    const postSlugs: {
      slug: string;
      availableLocales: ("zh-CN" | "en")[];
      updatedAt?: string;
    }[] = [];

    for (const chapter of detail.chapters) {
      for (const post of chapter.posts) {
        postSlugs.push({
          slug: post.slug,
          availableLocales: post.availableLocales ?? ["zh-CN"],
          updatedAt: post.updatedAt,
        });
      }
    }

    result.push({ setSlug: column.slug, postSlugs });
  }

  return result;
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
 * 获取所有专栏列表，并附带每个专栏的「首篇文章」slug。
 *
 * 首篇定义与详情页/侧边栏展示顺序一致：
 * 按章节 sort 升序，章节内按 column_order 升序，未归类文章（无 chapter_id）排在最后。
 * 用于文档站顶栏 Tab 直达首篇，以及 /docs 入口重定向。
 *
 * firstPostSlug 为 null 表示该文档集暂无已发布文章。
 */
export async function getColumnsWithFirstPost(
  locale: Locale = "zh-CN"
): Promise<ColumnWithFirstPost[]> {
  const supabase = await getSupabase();
  const isZh = locale === "zh-CN";

  const { data: cols, error } = await supabase
    .from("columns")
    .select("id, slug, sort, title_zh, title_en, description_zh, description_en, cover_image")
    .order("sort", { ascending: true });

  if (error || !cols || cols.length === 0) return [];

  const columnIds = cols.map((c: any) => c.id);

  // 章节 sort 映射（chapter_id -> sort），用于确定首篇所在章节顺序
  const { data: chapters } = await supabase
    .from("column_chapters")
    .select("id, sort")
    .in("column_id", columnIds);

  const chapterSort = new Map<string, number>();
  (chapters || []).forEach((ch: any) => chapterSort.set(ch.id, ch.sort));

  // 各专栏已发布文章（仅取定位首篇所需字段）
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, column_id, chapter_id, column_order")
    .in("column_id", columnIds)
    .eq("status", "published");

  // 为每个专栏挑选最优候选（章节 sort 最小，其次 column_order 最小）
  const best = new Map<
    string,
    { chSort: number; order: number; slug: string }
  >();

  (posts || []).forEach((p: any) => {
    const chSort = p.chapter_id ? chapterSort.get(p.chapter_id) ?? 9999 : 9999;
    const order = p.column_order ?? Number.MAX_SAFE_INTEGER;
    const cur = best.get(p.column_id);
    if (
      !cur ||
      chSort < cur.chSort ||
      (chSort === cur.chSort && order < cur.order)
    ) {
      best.set(p.column_id, { chSort, order, slug: p.slug });
    }
  });

  return cols.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    sort: row.sort,
    title: isZh ? row.title_zh : (row.title_en || row.title_zh),
    description: isZh ? row.description_zh : (row.description_en || row.description_zh),
    coverImage: row.cover_image ?? null,
    firstPostSlug: best.get(row.id)?.slug ?? null,
  }));
}
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
    .select("id, column_id, sort, title_zh, title_en, cover_image")
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
      category:categories(id, slug, name_zh, name_en, cover_image),
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
    coverImageFallback: row.category?.cover_image ?? null,
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

  const chapterList = (chapters || []).map((ch: any) => {
    const chapterCover = ch.cover_image ?? null;
    const chapterPosts = chapterPostsMap.get(ch.id) || [];
    // 章节封面优先于分类封面，写入章节内文章的展示回退值
    if (chapterCover) {
      for (const p of chapterPosts) {
        p.coverImageFallback = chapterCover;
      }
    }
    return {
      id: ch.id,
      columnId: ch.column_id,
      sort: ch.sort,
      title: isZh ? ch.title_zh : (ch.title_en || ch.title_zh),
      coverImage: chapterCover,
      posts: chapterPosts,
    };
  });

  // 如果有未归类文章，添加一个虚拟章节
  if (uncategorized.length > 0) {
    chapterList.push({
      id: "__uncategorized__",
      columnId: columnData.id,
      sort: 9999,
      title: isZh ? "未分类" : "Uncategorized",
      coverImage: null,
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

// ============================================
// 简历查询
// ============================================

/** 将多行文本按换行拆分为去空白的非空数组 */
function splitLines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * 获取简历完整数据（基本信息 + 技能 + 工作经历 + 项目经验）。
 * 按 locale 解析双语字段（en 缺失时回退 zh），要点字段按行拆分为数组。
 * 供关于我页面简历弹框使用。
 *
 * @param supabase 可选的 Supabase 客户端；不传则使用受 RLS 限制的 cookie 客户端。
 *                 简历表已收紧 RLS，前台解锁接口需传入 service_role 客户端（createAdminClient）。
 */
export async function getResume(
  locale: Locale = "zh-CN",
  supabase?: SupabaseClient
): Promise<ResumeData> {
  const sb = supabase ?? (await getSupabase());
  const isZh = locale === "zh-CN";
  const pick = (zh: string | null, en: string | null) =>
    isZh ? zh : en || zh;

  const [profileRes, skillsRes, expRes, projRes] = await Promise.all([
    sb
      .from("resume_profile")
      .select(
        "avatar, phone, email, blog_url, name_zh, name_en, certificate_zh, certificate_en, job_intention_zh, job_intention_en, edu_zh, edu_en"
      )
      .limit(1)
      .maybeSingle(),
    sb
      .from("resume_skills")
      .select("id, content_zh, content_en")
      .order("sort", { ascending: true }),
    sb
      .from("resume_experiences")
      .select(
        "id, period, company_zh, company_en, role_zh, role_en, highlights_zh, highlights_en"
      )
      .order("sort", { ascending: true }),
    sb
      .from("resume_projects")
      .select(
        "id, name_zh, name_en, summary_zh, summary_en, contributions_zh, contributions_en"
      )
      .order("sort", { ascending: true }),
  ]);

  const p = profileRes.data as any;
  const profile = p
    ? {
        avatar: p.avatar ?? null,
        phone: p.phone ?? null,
        email: p.email ?? null,
        blogUrl: p.blog_url ?? null,
        name: pick(p.name_zh, p.name_en) ?? "",
        certificate: pick(p.certificate_zh, p.certificate_en) ?? null,
        jobIntention: pick(p.job_intention_zh, p.job_intention_en) ?? null,
        edu: pick(p.edu_zh, p.edu_en) ?? null,
      }
    : null;

  const skills = (skillsRes.data || []).map((row: any) => ({
    id: row.id,
    content: pick(row.content_zh, row.content_en) ?? "",
  }));

  const experiences = (expRes.data || []).map((row: any) => ({
    id: row.id,
    period: row.period ?? null,
    company: pick(row.company_zh, row.company_en) ?? "",
    role: pick(row.role_zh, row.role_en) ?? null,
    highlights: splitLines(pick(row.highlights_zh, row.highlights_en)),
  }));

  const projects = (projRes.data || []).map((row: any) => ({
    id: row.id,
    name: pick(row.name_zh, row.name_en) ?? "",
    summary: pick(row.summary_zh, row.summary_en) ?? null,
    contributions: splitLines(pick(row.contributions_zh, row.contributions_en)),
  }));

  return { profile, skills, experiences, projects };
}

// ============================================
// 主站头像查询
// ============================================

/**
 * 随机获取一张已启用的主站头像 URL。
 *
 * 供主页、关于页服务端渲染使用，每次请求独立随机选取（JS 层随机，无持久缓存）。
 * getSupabase() 内部调用 cookies()，使所在路由自动进入动态渲染，
 * 确保每次请求都重新选取，不会被 Next.js 静态化缓存。
 *
 * 返回 null 表示 site_avatars 表内无可用头像（未配置 / 全部停用）。
 */
export async function getRandomSiteAvatar(): Promise<string | null> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("site_avatars")
    .select("url")
    .eq("enabled", true);

  if (error || !data || data.length === 0) return null;

  const idx = Math.floor(Math.random() * data.length);
  return (data[idx] as Pick<SiteAvatar, "url">).url;
}
