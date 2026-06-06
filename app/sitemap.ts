import type { MetadataRoute } from "next";
import {
  getAllPostsForSitemap,
  getAllCategoriesForSitemap,
  getAllTagsForSitemap,
} from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, tags] = await Promise.all([
    getAllPostsForSitemap(),
    getAllCategoriesForSitemap(),
    getAllTagsForSitemap(),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // 静态页面：/ 与 /about
  for (const path of ["/", "/about"]) {
    const enPath = path === "/" ? "/en" : `/en${path}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}${path}`,
          en: `${SITE_URL}${enPath}`,
        },
      },
    });
  }

  // 分类页：/category/:slug
  for (const cat of categories) {
    const path = `/category/${cat.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}${path}`,
          en: `${SITE_URL}/en${path}`,
        },
      },
    });
  }

  // 标签页：/tag/:slug
  for (const tag of tags) {
    const path = `/tag/${tag.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}${path}`,
          en: `${SITE_URL}/en${path}`,
        },
      },
    });
  }

  // 文章页：按 availableLocales 决定输出哪些语言的 URL
  // 双语文章生成一条（zh-CN 作为主 URL），单语文章生成一条对应 locale
  for (const post of posts) {
    const zhPath = `/posts/${post.slug}`;
    const enPath = `/en/posts/${post.slug}`;
    const hasZh = post.availableLocales.includes("zh-CN");
    const hasEn = post.availableLocales.includes("en");

    const languages: Record<string, string> = {};
    if (hasZh) languages["zh-CN"] = `${SITE_URL}${zhPath}`;
    if (hasEn) languages.en = `${SITE_URL}${enPath}`;

    // 双语文章以 zh-CN URL 为主；纯英文文章以 en URL 为主
    const mainUrl = hasZh ? `${SITE_URL}${zhPath}` : `${SITE_URL}${enPath}`;

    entries.push({
      url: mainUrl,
      lastModified: new Date(post.updatedAt),
      alternates: { languages },
    });
  }

  return entries;
}
