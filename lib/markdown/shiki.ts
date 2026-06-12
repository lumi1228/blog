/**
 * shiki 高亮器单例与 rehype 插件工厂。
 *
 * 实现要点：
 * - 通过 `React.cache` 包裹异步工厂，保证同一渲染请求内只创建一个 highlighter；
 * - 显式注册业务覆盖范围内的语言列表，未列出的语言降级为纯文本；
 * - 代码块始终使用 `github-dark` 单主题，不随站点明暗主题切换。
 */

import { cache } from "react";
import type { Plugin } from "unified";
import type { Root } from "hast";
import { createHighlighter, type Highlighter } from "shiki";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import type { RehypeShikiCoreOptions } from "@shikijs/rehype/core";

export const SHIKI_LANGS = [
  "js",
  "ts",
  "jsx",
  "tsx",
  "python",
  "go",
  "rust",
  "bash",
  "shell",
  "sh",
  "json",
  "yaml",
  "sql",
  "css",
  "html",
  "md",
] as const;

export const SHIKI_THEME = "github-dark" as const;

export const getHighlighter = cache(async (): Promise<Highlighter> => {
  return createHighlighter({
    langs: [...SHIKI_LANGS],
    themes: [SHIKI_THEME],
  });
});

export async function createRehypeShikiPlugin(): Promise<Plugin<[], Root>> {
  const highlighter = await getHighlighter();

  const options: RehypeShikiCoreOptions = {
    theme: SHIKI_THEME,
    defaultLanguage: "text",
    fallbackLanguage: "text",
    onError: (error) => {
      console.warn("[shiki] highlight failed", error);
    },
  };

  const plugin: Plugin<[], Root> = function rehypeShikiPlugin() {
    return rehypeShikiFromHighlighter(highlighter, options);
  };

  return plugin;
}
