/**
 * About 页面配置
 * 后续可迁移到数据库或后台编辑
 */

export const aboutConfig = {
  name: "Lumi",
  title: "前端工程师 · 独立开发者",
  tagline: "用代码构建，用设计表达，用文字沉淀。",
  avatar: null as string | null,

  intro: [
    "你好，我是 Lumi，一个热爱前端与设计的女性开发者。",
    "我相信好的代码不仅要能运行，更要有审美。每一行代码、每一个像素、每一次交互，都值得被认真对待。",
    "这个博客记录我在技术探索、设计思考、职业成长中的片段，也希望能遇到同频的你。",
  ],

  skills: {
    "前端核心": ["React", "Next.js", "TypeScript", "Vue"],
    "样式与设计": ["Tailwind CSS", "CSS-in-JS", "Figma", "设计系统"],
    "工程化": ["Vite", "Webpack", "Monorepo", "CI/CD"],
    "后端涉猎": ["Node.js", "PostgreSQL", "Supabase", "Serverless"],
  } as Record<string, string[]>,

  social: [
    { label: "GitHub", href: "https://github.com/lumi1228", handle: "@lumi1228" },
    { label: "邮箱", href: "mailto:hello@lumi.dev", handle: "hello@lumi.dev" },
    { label: "掘金", href: "https://juejin.cn/user/lumi", handle: "@lumi" },
  ],

  timeline: [
    {
      year: "2026",
      title: "独立开发",
      description: "专注于个人项目与技术写作，探索 AI 与前端的结合。",
    },
    {
      year: "2024",
      title: "高级前端工程师",
      description: "主导设计系统建设，推动团队前端工程化升级。",
    },
    {
      year: "2021",
      title: "前端工程师",
      description: "从校招进入互联网行业，深耕 React 生态。",
    },
  ],
};
