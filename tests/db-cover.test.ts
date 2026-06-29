/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- mock next/headers ----
vi.mock("next/headers", () => ({
  cookies: async () => ({}),
}));

// ---- mock supabase 客户端 ----
// 针对 getPostBySlug 的链式调用：from(table).select().eq().eq().single()
let postRow: any;

function makeBuilder() {
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    single: () => Promise.resolve({ data: postRow, error: postRow ? null : { message: "not found" } }),
  };
  return builder;
}

vi.mock("@/utils/supabase/server", () => ({
  createClient: () => ({
    from: () => makeBuilder(),
  }),
}));

import { getPostBySlug } from "@/lib/db";

function baseRow(overrides: Record<string, any> = {}) {
  return {
    id: "post-1",
    slug: "hello",
    cover_image: null,
    status: "published",
    published_at: "2024-01-01T00:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    reading_time: 3,
    view_count: 10,
    title_zh: "你好",
    title_en: "Hello",
    excerpt_zh: "摘要",
    excerpt_en: "Excerpt",
    content_zh: "正文",
    content_en: "Content",
    available_locales: ["zh-CN", "en"],
    column_id: null,
    chapter_id: null,
    column_order: null,
    show_in_list: false,
    category: { id: "c1", slug: "tech", name_zh: "技术", name_en: "Tech", cover_image: "https://cdn/cat.png" },
    chapter: null,
    post_tags: [],
    ...overrides,
  };
}

beforeEach(() => {
  postRow = null;
});

describe("getPostBySlug 封面回退解析", () => {
  it("文章自有封面时，coverImage 用自有，coverImageFallback 仍为默认来源", async () => {
    postRow = baseRow({
      cover_image: "https://cdn/own.png",
      chapter: { id: "ch1", cover_image: "https://cdn/chapter.png" },
    });
    const post = await getPostBySlug("hello", "zh-CN");
    expect(post?.coverImage).toBe("https://cdn/own.png");
    // 回退值独立保留（前台展示优先用 coverImage，但回退来源仍带出）
    expect(post?.coverImageFallback).toBe("https://cdn/chapter.png");
  });

  it("无自有封面 + 有章节封面：回退到章节封面（优先于分类）", async () => {
    postRow = baseRow({
      cover_image: null,
      chapter: { id: "ch1", cover_image: "https://cdn/chapter.png" },
    });
    const post = await getPostBySlug("hello", "zh-CN");
    expect(post?.coverImage).toBeNull();
    expect(post?.coverImageFallback).toBe("https://cdn/chapter.png");
  });

  it("无自有封面 + 无章节：回退到分类封面", async () => {
    postRow = baseRow({ cover_image: null, chapter: null });
    const post = await getPostBySlug("hello", "zh-CN");
    expect(post?.coverImageFallback).toBe("https://cdn/cat.png");
  });

  it("均无封面时 coverImageFallback 为 null", async () => {
    postRow = baseRow({
      cover_image: null,
      chapter: null,
      category: { id: "c1", slug: "tech", name_zh: "技术", name_en: "Tech", cover_image: null },
    });
    const post = await getPostBySlug("hello", "zh-CN");
    expect(post?.coverImage).toBeNull();
    expect(post?.coverImageFallback).toBeNull();
  });
});
