# Blog · 个人博客系统

> 基于 Next.js 16 + React 19 构建的双语（中文 / English）个人博客系统，支持文章管理、分类标签、专栏、全文搜索、Markdown 渲染与代码高亮、明暗主题切换。

[English](./README.en.md)

## ✨ 功能特性

- 📝 **文章管理** —— 后台 Markdown 编辑、实时预览、草稿/发布状态切换
- 🌐 **中英双语 i18n** —— 基于 next-intl，中文无前缀、英文 `/en` 子路径，SEO 友好
- 🗂️ **分类 / 标签 / 专栏** —— 内容多维度组织，专栏支持章节与拖拽排序
- 🔍 **全文搜索** —— 基于 fuse.js 的客户端搜索，支持 `Ctrl/Cmd + K` 唤起
- 🎨 **Markdown 渲染** —— react-markdown + remark-gfm，shiki 代码高亮、一键复制、文章目录（TOC）
- 🌓 **明暗主题** —— 跟随系统偏好，支持手动切换
- 🔐 **管理后台** —— `/admin` 后台，文章、分类、标签、专栏统一管理
- 📊 **SEO 与统计** —— 动态 metadata、OpenGraph、sitemap、robots、阅读量统计

## 🧰 技术栈

### 运行环境

| 技术 | 版本 | 说明 |
|---|---|---|
| [Node.js](https://nodejs.org) | v20.20.2（`.nvmrc` 锁定主版本 `20`，要求 >= 20.9）| JavaScript 运行时环境 |
| [npm](https://www.npmjs.com) | v10.8.2 | Node.js 包管理器 |

### 核心依赖

| 技术 | 版本 | 说明 |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.3 | React 全栈框架，App Router |
| [React](https://react.dev) | 19.2.4 | UI 组件库 |
| [TypeScript](https://www.typescriptlang.org) | ^5 | JavaScript 的类型超集 |
| [Tailwind CSS](https://tailwindcss.com) | ^4 | 原子化 CSS 框架（`@theme` 设计 token）|
| [Supabase](https://supabase.com) | @supabase/supabase-js ^2 · @supabase/ssr ^0.10 | 数据库与认证 |
| [next-intl](https://next-intl.dev) | ^4 | 国际化（i18n）路由与文案 |
| [react-markdown](https://github.com/remarkjs/react-markdown) | ^10 | Markdown 渲染（搭配 remark-gfm、rehype-sanitize）|
| [shiki](https://shiki.style) | ^4 | 代码语法高亮 |
| [fuse.js](https://fusejs.io) | ^7 | 客户端模糊搜索 |
| [@dnd-kit](https://dndkit.com) | ^6 | 拖拽排序（专栏章节）|

### 开发与测试

| 技术 | 说明 |
|---|---|
| [ESLint](https://eslint.org) | 代码检查 |
| [Vitest](https://vitest.dev) | 单元测试 |
| [Testing Library](https://testing-library.com) | React 组件测试 |
| [fast-check](https://fast-check.dev) | 基于属性的测试（property-based testing）|
| [Playwright](https://playwright.dev) | 端到端（E2E）测试 |

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件，填入 Supabase 配置：

```bash
# Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# Supabase 可公开的 anon / publishable key（客户端使用）
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
# Supabase service role key（仅服务端使用，切勿暴露到客户端）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` 拥有完整数据库权限，仅可在服务端使用，且不要提交到版本库。`.env.local` 已被 `.gitignore` 忽略。

### 3. 启动开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看效果。

## 📜 可用脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产环境构建 |
| `npm run start` | 启动生产服务（需先 build）|
| `npm run lint` | ESLint 代码检查 |
| `npm run test` | 运行单元测试（Vitest）|
| `npm run test:property` | 运行基于属性的测试 |
| `npm run test:e2e` | 运行端到端测试（Playwright）|

## 📁 项目结构

```
blog/
├── app/                          # App Router 目录
│   ├── [locale]/                 # 双语前台路由（zh-CN 默认 / en）
│   │   ├── page.tsx              # 首页（文章列表）
│   │   ├── posts/[slug]/         # 文章详情页
│   │   ├── category/[slug]/      # 分类文章列表
│   │   ├── tag/[slug]/           # 标签文章列表
│   │   ├── columns/              # 专栏列表与详情
│   │   ├── about/                # 个人介绍页
│   │   ├── layout.tsx            # 前台布局
│   │   └── not-found.tsx         # 404 页面
│   ├── admin/                    # 管理后台
│   │   ├── (dashboard)/          # 后台仪表盘（文章/分类/标签/专栏管理）
│   │   └── login/                # 后台登录
│   ├── api/                      # Route Handlers（如搜索索引）
│   ├── globals.css               # 全局样式与设计 token
│   ├── layout.tsx                # 根布局
│   ├── robots.ts / sitemap.ts    # SEO 配置
│   └── loading.tsx               # 全局加载态
├── components/                   # 组件
│   ├── admin/                    # 后台管理组件
│   ├── markdown/                 # Markdown 渲染与代码块
│   ├── search/                   # 搜索模态框与触发器
│   └── ...                       # 导航、页脚、卡片、主题切换等
├── config/                       # 站点配置（如 about 页内容）
├── i18n/                         # next-intl 配置（routing / request）
├── lib/                          # 工具库（db、markdown 处理等）
├── .docs/                        # 项目文档（PRD、上线流程等）
├── .kiro/                        # Kiro steering 规则与配置
├── next.config.ts                # Next.js 配置（集成 next-intl）
├── eslint.config.mjs             # ESLint 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 依赖与脚本
```

## 🌐 国际化

- 支持语言：`zh-CN`（默认）、`en`
- 路由策略：`localePrefix: "as-needed"`，中文路径无前缀（`/about`），英文带前缀（`/en/about`）
- 关闭浏览器语言自动检测，始终以 `zh-CN` 为默认，用户可通过导航栏手动切换
- 配置位于 `i18n/routing.ts`，由 `next.config.ts` 中的 next-intl 插件接入

## 📖 相关文档

- [Next.js 官方文档](https://nextjs.org/docs)
- [next-intl 文档](https://next-intl.dev/docs/getting-started)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

## 🚢 部署

推荐使用 [Vercel](https://vercel.com) 部署：

1. 将仓库导入 Vercel
2. 在项目 Settings → Environment Variables 中配置上述 Supabase 环境变量
3. 部署，Vercel 会自动识别 Next.js 并完成构建

更多细节参阅 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

## 📄 License

本项目基于 [LICENSE](./LICENSE) 文件中的协议开源。
