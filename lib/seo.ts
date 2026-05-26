/**
 * SEO 工具模块
 *
 * 提供站点级 SEO 相关的纯数据工具：
 * - 站点常量（SITE_URL / DEFAULT_OG / SITE_NAME）
 * - 路径国际化（localizedPath）
 * - hreflang/canonical 构建（buildAlternates）
 * - 封面图可达性校验（validateCoverImage，5s 超时 + 请求级缓存）
 * - OpenGraph 图片决策（buildOgImages）
 * - Article JSON-LD 构建（buildArticleJsonLd）
 *
 * 仅返回纯数据，不依赖 React 渲染。
 *
 * 对应需求：4.2 / 4.3 / 4.4 / 4.4a / 4.4b / 4.5 / 4.6
 */

import { cache } from "react";

import type { Locale } from "@/i18n/config";

/** 站点根 URL，用于拼接 canonical / hreflang / sitemap 等绝对路径 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** 默认 Open Graph 封面图，公共目录路径 */
export const DEFAULT_OG = "/og-default.png";

/** 站点名称，用于 metadata title 后缀与 JSON-LD */
export const SITE_NAME = "Lumi's Blog";

/**
 * 将路径按 locale 转换：
 * - zh-CN：保留原路径
 * - en：在前面追加 /en；根路径 "/" 归一为 "/en"
 */
export function localizedPath(locale: Locale, path: string): string {
  if (locale === "zh-CN") return path;
  if (path === "/" || path === "") return "/en";
  return `/en${path}`;
}

/** buildAlternates 返回结构 */
export interface AlternatesResult {
  canonical: string;
  languages: Partial<Record<Locale, string>>;
}

/**
 * 构建 Next.js Metadata 的 alternates 字段
 *
 * - canonical 取 zh-CN 版本绝对 URL；当文章仅 en 可用时回退为 en 绝对 URL
 * - languages 默认输出 zh-CN 与 en 两条；若提供 availableLocales 则按其过滤
 */
export function buildAlternates(
  pathZh: string,
  pathEn: string,
  availableLocales?: readonly Locale[]
): AlternatesResult {
  const absoluteZh = `${SITE_URL}${pathZh}`;
  const absoluteEn = `${SITE_URL}${pathEn}`;

  const includeZh = !availableLocales || availableLocales.includes("zh-CN");
  const includeEn = !availableLocales || availableLocales.includes("en");

  const languages: Partial<Record<Locale, string>> = {};
  if (includeZh) languages["zh-CN"] = absoluteZh;
  if (includeEn) languages.en = absoluteEn;

  const canonical = includeZh ? absoluteZh : absoluteEn;

  return { canonical, languages };
}

/**
 * 校验封面图 URL 是否可达。
 *
 * - 空字符串 / null / undefined → 直接返回 false
 * - HEAD 请求 5s 超时；非 2xx / 抛错 → 返回 false
 * - 通过 React cache 包裹，实现请求级（同次渲染内）去重，避免 metadata 与 JSON-LD 重复触发 HEAD
 */
export const validateCoverImage = cache(
  async (url: string | null | undefined): Promise<boolean> => {
    if (!url) return false;
    if (typeof url !== "string") return false;
    if (url.trim() === "") return false;

    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
);

/** buildOgImages 返回结构 */
export interface OgImagesResult {
  images: string[];
  usedDefault: boolean;
}

/**
 * 根据封面图与校验结果，按 design 第 6.2 节决策表生成 og.images
 *
 * | hasUserCover | validated | images          | usedDefault |
 * | ------------ | --------- | --------------- | ----------- |
 * | false        | -         | [DEFAULT_OG]    | true        |
 * | true         | true      | [coverImage]    | false       |
 * | true         | false     | []              | false       |
 */
export function buildOgImages(
  coverImage: string | null | undefined,
  validated: boolean
): OgImagesResult {
  const hasUserCover =
    typeof coverImage === "string" && coverImage.trim() !== "";

  if (!hasUserCover) {
    return { images: [DEFAULT_OG], usedDefault: true };
  }

  if (validated) {
    return { images: [coverImage as string], usedDefault: false };
  }

  return { images: [], usedDefault: false };
}

/** buildArticleJsonLd 入参 */
export interface ArticleJsonLdInput {
  url: string;
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  inLanguage: Locale;
  /** 当 og.images 为空时省略 image 字段（REQ-4.6） */
  image?: string;
  /** 可选，最近一次更新时间 */
  updatedAt?: string;
}

/**
 * 构建 schema.org Article JSON-LD
 *
 * 必含字段：@context / @type / headline / datePublished / author.name / inLanguage / url / description
 * 当传入 image 时输出 image 字段；未传则省略（对应 og.images 为空数组的场景）。
 */
export function buildArticleJsonLd(
  input: ArticleJsonLdInput
): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    author: {
      "@type": "Person",
      name: input.author,
    },
    inLanguage: input.inLanguage,
    url: input.url,
  };

  if (input.updatedAt) {
    jsonLd.dateModified = input.updatedAt;
  }

  if (input.image) {
    jsonLd.image = input.image;
  }

  return jsonLd;
}
