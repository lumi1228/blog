import { describe, it, expect, vi, beforeEach } from "vitest";

const getSearchIndex = vi.fn();
const getDocsSearchIndex = vi.fn();

vi.mock("@/lib/db", () => ({
  getSearchIndex: (...args: unknown[]) => getSearchIndex(...args),
  getDocsSearchIndex: (...args: unknown[]) => getDocsSearchIndex(...args),
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["zh-CN", "en"] },
}));

import { GET } from "./route";

function makeRequest(url: string) {
  return new Request(url);
}

describe("GET /api/search-index", () => {
  beforeEach(() => {
    getSearchIndex.mockReset().mockResolvedValue([
      { slug: "a", title: "A", excerpt: "", tags: [], publishedAt: "2024" },
    ]);
    getDocsSearchIndex.mockReset().mockResolvedValue([
      {
        slug: "d",
        title: "Doc",
        excerpt: "",
        tags: [],
        publishedAt: "2024",
        url: "/docs/react/d",
      },
    ]);
  });

  it("默认作用域调用全站索引", async () => {
    const res = await GET(makeRequest("http://x/api/search-index?locale=zh-CN"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.scope).toBe("site");
    expect(getSearchIndex).toHaveBeenCalledWith("zh-CN");
    expect(getDocsSearchIndex).not.toHaveBeenCalled();
  });

  it("scope=docs 调用文档索引，条目带 /docs URL", async () => {
    const res = await GET(
      makeRequest("http://x/api/search-index?locale=zh-CN&scope=docs")
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.scope).toBe("docs");
    expect(getDocsSearchIndex).toHaveBeenCalledWith("zh-CN");
    expect(getSearchIndex).not.toHaveBeenCalled();
    expect(json.entries[0].url).toBe("/docs/react/d");
  });

  it("非法 locale 返回 400", async () => {
    const res = await GET(makeRequest("http://x/api/search-index?locale=fr"));
    expect(res.status).toBe(400);
  });
});
