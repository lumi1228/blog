/**
 * shiki 高亮器单例与 rehype 插件工厂。
 *
 * 实现要点（对应 Requirements 1.4 / 1.5 / 1.6 与 design 第 1 节末尾的 shiki 集成约束）：
 * - 通过 `React.cache` 包裹异步工厂，保证同一渲染请求内只创建一个 highlighter，
 *   避免每次 Markdown 渲染都重新加载语法/主题导致冷启动延迟；
 * - 显式注册业务覆盖范围内的语言列表，未列出的语言由 `@shikijs/rehype` 在运行时
 *   通过 `defaultLanguage`/`fallbackLanguage` 降级为纯文本（保留原始换行与空白）；
 * - 双主题：`github-light` 与 `github-dark-dimmed`，由 shiki 输出 CSS 变量驱动，
 *   配合 `app/globals.css` 中的 `html.light` / `html:not(.light)` 规则随主题切换。
 *
 * 仅运行在服务端（Server Component / 构建期）。该模块不应被 `"use client"` 组件引用，
 * 否则 shiki 会被打入客户端 bundle 抵消零客户端 runtime 的设计目标。
 */

import { cache } from "react";
import type { Plugin } from "unified";
import type { Root } from "hast";
import { createHighlighter, type Highlighter } from "shiki";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import type { RehypeShikiCoreOptions } from "@shikijs/rehype/core";

/**
 * 显式注册的语言别名集合。
 *
 * 与 Requirements 1.4 严格对齐：未列出的语言由 shiki 自动降级为纯文本，
 * 不会因为缺失 grammar 而抛错（见 Requirements 1.5）。
 */
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

/**
 * 双主题映射。键名 `light` / `dark` 与 `@shikijs/rehype` 的 `themes` 选项约定一致，
 * shiki 会在产物上输出 CSS 变量，`app/globals.css` 通过 `html.light` 切换显示。
 */
export const SHIKI_THEMES = {
  light: "github-light",
  dark: "github-dark-dimmed",
} as const;

/**
 * 异步获取 shiki Highlighter 单例。
 *
 * 使用 `React.cache` 包裹后，同一次请求 / 渲染内重复调用都会复用同一 Promise，
 * shiki 仅加载一次语法与主题。跨请求由 React 框架自行管理生命周期。
 */
export const getHighlighter = cache(async (): Promise<Highlighter> => {
  return createHighlighter({
    langs: [...SHIKI_LANGS],
    themes: [SHIKI_THEMES.light, SHIKI_THEMES.dark],
  });
});

/**
 * 构建配置好语言与双主题的 `@shikijs/rehype` 插件实例。
 *
 * 返回值可直接放入 `react-markdown` 的 `rehypePlugins` 数组。插件内部基于
 * 通过 `getHighlighter` 取得的 highlighter 工作，不会重复加载 grammar。
 *
 * 行为约定：
 * - 未指定语言或语言别名未注册时，shiki 会回退到 `defaultLanguage: "text"`
 *   渲染为纯文本，保留原始空白与换行（Requirements 1.5）；
 * - shiki 渲染失败（如 wasm 加载异常）时通过 `onError` 静默吞错，避免整篇
 *   文章渲染中断；调用方仍会拿到一个能正常工作的 rehype 管线。
 */
export async function createRehypeShikiPlugin(): Promise<Plugin<[], Root>> {
  const highlighter = await getHighlighter();

  const options: RehypeShikiCoreOptions = {
    themes: SHIKI_THEMES,
    defaultLanguage: "text",
    fallbackLanguage: "text",
    onError: (error) => {
      // 高亮失败属于内容渲染的非关键路径，记录后让 shiki 自身降级为纯文本，
      // 避免整页因为单个代码块挂掉。
      console.warn("[shiki] highlight failed", error);
    },
  };

  // `rehypeShikiFromHighlighter` 返回的是 unified Transformer，包装为零参 Plugin
  // 后即可与 `react-markdown` 的 `rehypePlugins` 数组无缝拼接。
  const plugin: Plugin<[], Root> = function rehypeShikiPlugin() {
    return rehypeShikiFromHighlighter(highlighter, options);
  };

  return plugin;
}
