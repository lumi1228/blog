这是一个使用 [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) 创建的 [Next.js](https://nextjs.org) 项目。

[English](./README.md)

## 技术栈

| 技术 | 版本 | 说明 |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.3 | React 全栈框架，支持 SSR、SSG、路由和 API |
| [React](https://react.dev) | 19.2.4 | 用于构建用户界面的 UI 组件库 |
| [TypeScript](https://www.typescriptlang.org) | ^5 | JavaScript 的类型超集，提升开发体验和代码可靠性 |
| [Tailwind CSS](https://tailwindcss.com) | ^4 | 原子化 CSS 框架，快速实现样式开发 |
| [PostCSS](https://postcss.org) | - | CSS 转换工具，作为 Tailwind CSS 的构建管道 |
| [ESLint](https://eslint.org) | ^9 | JavaScript/TypeScript 代码检查工具，保障代码质量 |

## 项目结构

```
blog/
├── app/                    # App Router 目录（Next.js 核心）
│   ├── favicon.ico         # 网站图标
│   ├── globals.css         # 全局样式（Tailwind 指令）
│   ├── layout.tsx          # 根布局组件
│   └── page.tsx            # 首页组件
├── public/                 # 静态资源目录，映射到根路径
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .gitignore              # Git 忽略规则
├── eslint.config.mjs       # ESLint 配置
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖和脚本
├── postcss.config.mjs      # PostCSS 配置（Tailwind 插件）
├── tsconfig.json           # TypeScript 配置
└── README.md               # 项目文档
```

## 快速开始

首先，启动开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看效果。

你可以通过编辑 `app/page.tsx` 来修改页面，页面会在你编辑时自动更新。

本项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 自动优化并加载 [Geist](https://vercel.com/font) 字体。

## 了解更多

想深入了解 Next.js，可以参考以下资源：

- [Next.js 官方文档](https://nextjs.org/docs) - 了解 Next.js 的功能和 API。
- [Next.js 交互式教程](https://nextjs.org/learn) - 通过实践学习 Next.js。

欢迎访问 [Next.js GitHub 仓库](https://github.com/vercel/next.js)，期待你的反馈和贡献。

## 部署到 Vercel

部署 Next.js 应用最简单的方式是使用 Next.js 团队打造的 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

更多部署细节请参阅 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。
