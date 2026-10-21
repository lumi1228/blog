/**
 * 知识库目录的数据边界与批量读取回归测试。
 * --- @ty.aicoding@ ---
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  tables: {} as Record<string, Record<string, unknown>[]>,
  reads: [] as { table: string; fields: string; filters: [string, unknown][]; from: number; to: number }[],
  error: null as { message: string } | null,
}));

vi.mock("next/headers", () => ({ cookies: async () => ({}) }));
vi.mock("@/utils/supabase/server", () => ({
  createClient: () => ({
    from: (table: string) => {
      let fields = "";
      const filters: [string, unknown][] = [];
      const rows = () => (database.tables[table] ?? []).filter((row) =>
        filters.every(([key, value]) => key.includes(".") || row[key] === value));
      const query = {
        select: (value: string) => { fields = value; return query; },
        eq: (key: string, value: unknown) => { filters.push([key, value]); return query; },
        is: (key: string, value: null) => { filters.push([key, value]); return query; },
        order: () => query,
        maybeSingle: async () => ({ data: rows()[0] ?? null, error: null }),
        range: async (from: number, to: number) => {
          database.reads.push({ table, fields, filters: [...filters], from, to });
          return { data: rows().slice(from, to + 1), error: database.error };
        },
      };
      return query;
    },
  }),
}));

import { getDocsOverview, getDocsDirectory, getDocsChapter } from "@/lib/db";

beforeEach(() => {
  database.error = null;
  database.reads = [];
  database.tables = {
    columns: [{ id: "set1", slug: "react", sort: 0, title_zh: "React 中文", title_en: "React", description_zh: "简介", description_en: "", cover_image: null }],
    column_chapters: [
      { id: "chapter1", column_id: "set1", sort: 0, title_zh: "入门", title_en: "", cover_image: null },
      { id: "empty", column_id: "set1", sort: 1, title_zh: "空章节", title_en: "Empty", cover_image: null },
    ],
    posts: [
      { id: "p1", slug: "intro", column_id: "set1", chapter_id: "chapter1", status: "published", title_zh: "介绍", title_en: "Intro", excerpt_zh: "摘要", excerpt_en: "", published_at: null, created_at: "2026-01-01", reading_time: 3 },
      { id: "p2", slug: "loose", column_id: "set1", chapter_id: null, status: "published", title_zh: "未分类文章", title_en: "", excerpt_zh: "未分类摘要", published_at: "2026-02-01", reading_time: 2 },
      { id: "draft", slug: "draft", column_id: "set1", chapter_id: "chapter1", status: "draft", title_zh: "草稿" },
      { id: "other", slug: "other", column_id: "other-set", chapter_id: null, status: "published", title_zh: "其他库" },
    ],
  };
});

describe("知识库轻量目录", () => {
  it("保留空章节、归并未分类，排除草稿及其他库文章，不查询正文", async () => {
    const directory = await getDocsDirectory("react", "en");
    expect(directory?.title).toBe("React");
    expect(directory?.description).toBe("简介");
    expect(directory?.chapters.map((chapter) => [chapter.id, chapter.title, chapter.posts.map((post) => post.slug)])).toEqual([
      ["chapter1", "入门", ["intro"]], ["empty", "Empty", []], ["__uncategorized__", "Uncategorized", ["loose"]],
    ]);
    const read = database.reads.find((query) => query.table === "posts");
    expect(read?.fields).not.toMatch(/content_|excerpt_/);
    expect(read?.filters).toContainEqual(["status", "published"]);
  });

  it.each([1000, 1001])("目录有 %i 篇文章时完整分批读取并终止", async (count) => {
    database.tables.posts = Array.from({ length: count }, (_, i) => ({
      id: `p${i}`, slug: `post-${i}`, column_id: "set1", chapter_id: "chapter1", status: "published", title_zh: `文章 ${i}`,
    }));
    const directory = await getDocsDirectory("react");
    expect(directory?.chapters[0].posts).toHaveLength(count);
    expect(database.reads.filter((query) => query.table === "posts").map((query) => query.from)).toEqual([0, 500, 1000]);
  });

  it("无未分类文章时不产生虚拟章节；不存在的库返回 null", async () => {
    database.tables.posts = [];
    expect((await getDocsDirectory("react"))?.chapters.map((chapter) => chapter.id)).toEqual(["chapter1", "empty"]);
    expect(await getDocsDirectory("missing")).toBeNull();
  });

  it("查询失败明确报错，不伪装为空目录", async () => {
    database.error = { message: "database unavailable" };
    await expect(getDocsDirectory("react")).rejects.toThrow("database unavailable");
  });
});

describe("章节摘要与统计", () => {
  it("只获取指定章摘要，英文缺失回退中文，不包含正文", async () => {
    const data = await getDocsChapter("react", "chapter1", "en");
    expect(data?.posts).toEqual([{ id: "p1", slug: "intro", title: "Intro", excerpt: "摘要", publishedAt: "2026-01-01", readingTime: 3 }]);
    const summaryRead = database.reads.find((query) => query.fields.includes("excerpt_zh"));
    expect(summaryRead?.filters).toEqual(expect.arrayContaining([["column_id", "set1"], ["chapter_id", "chapter1"], ["status", "published"]]));
    expect(summaryRead?.fields).not.toContain("content_");
  });

  it("未知或跨库章节返回 null，未分类章节只查询 chapter_id=null", async () => {
    expect(await getDocsChapter("react", "foreign-chapter")).toBeNull();
    expect(database.reads.some((query) => query.fields.includes("excerpt_zh"))).toBe(false);
    const data = await getDocsChapter("react", "__uncategorized__");
    expect(data?.posts.map((post) => post.slug)).toEqual(["loose"]);
    expect(database.reads.find((query) => query.fields.includes("excerpt_zh"))?.filters).toContainEqual(["chapter_id", null]);
    expect((await getDocsChapter("react", "empty"))?.posts).toEqual([]);
  });

  it("概览只读库及聚合统计，未分类计为一个章节，空库仍保留", async () => {
    Object.assign(database.tables.columns[0], { chapters: [{ count: 2 }], articles: [{ count: 12 }], ungrouped: [{ count: 4 }] });
    database.tables.columns.push({ id: "empty-set", slug: "empty", title_zh: "空库", sort: 1, chapters: [{ count: 0 }], articles: [{ count: 0 }], ungrouped: [{ count: 0 }] });
    const overview = await getDocsOverview();
    expect(overview.map((set) => [set.slug, set.chapterCount, set.articleCount])).toEqual([["react", 3, 12], ["empty", 0, 0]]);
    expect(database.reads.map((query) => query.table)).toEqual(["columns"]);
    expect(database.reads[0].filters).toContainEqual(["articles.status", "published"]);
  });
});
