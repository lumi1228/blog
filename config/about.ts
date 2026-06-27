/**
 * About 页面配置
 * 后续可迁移到数据库或后台编辑
 */

export const aboutConfig = {
  name: "lumi",
  title: "前端工程师 · Next.js 全栈实践者 · AI Coding 探索者",
  tagline: "用代码把想法变成现实，用 AI 让开发更高效。",
  avatar: "/avatar.png",

  profile: {
    englishName: "lumi",
    nickname: "小咸菜",
    chineseName: "娄女士",
  },

  bio: "你好，我是 lumi，也可以叫我小咸菜。专注用工程化的方式构建可维护的产品，也在持续探索 AI 驱动的开发方式。",

  highlights: [
    { icon: "experience", title: "多年前端经验", desc: "从组件交互到复杂系统的前端架构" },
    { icon: "domain", title: "金融 · 财税 · 技术中台", desc: "深耕 B/C 端复杂业务领域" },
    { icon: "stack", title: "Next.js 全栈", desc: "由 Vue 全家桶拓展到全栈交付" },
    { icon: "ai", title: "AI Coding", desc: "用 AI 辅助开发与智能工作流提效" },
  ] as { icon: "experience" | "domain" | "stack" | "ai"; title: string; desc: string }[],

  skills: {
    "前端深耕": {
      description: "多年前端实战，历经金融、财税、技术中台等复杂业务，熟悉现代前端技术栈、组件化架构与复杂交互实现。",
      tags: ["React", "Vue", "TypeScript", "Component Design", "Performance"],
    },
    "Next.js 全栈": {
      description: "熟悉 App Router、Server Components、SSR/SSG、SEO、多语言与完整部署链路。",
      tags: ["Next.js", "App Router", "RSC", "SSR", "SEO", "i18n"],
    },
    "AI Coding": {
      description: "探索 AI 辅助开发、需求拆解、代码生成与自动化工作流，提升开发效率。",
      tags: ["AI Coding", "Prompt Engineering", "Agent Workflow", "Automation"],
    },
    "工程与产品": {
      description: "关注项目可维护性、迭代效率与实际价值，在技术与业务间找到平衡。",
      tags: ["Architecture", "Delivery", "Refactor", "Product Thinking"],
    },
  } as Record<string, { description: string; tags: string[] }>,

  collaboration: {
    intro: "如果你正在做产品、工具、内容平台、官网、SaaS 原型，或希望把 AI 能力接入业务，我可以与你一起从想法梳理、技术方案到全栈落地推进。",
    offers: [
      {
        title: "项目合作",
        description: "参与 Web 产品、官网、后台系统、内容平台等项目的设计与开发。",
      },
      {
        title: "Next.js 全栈落地",
        description: "从页面、接口、数据、SEO 到部署，帮助项目更快上线。",
      },
      {
        title: "AI 全栈实践",
        description: "结合 AI Coding、AI 工作流，探索更高效的开发与交付方式。",
      },
      {
        title: "前端架构优化",
        description: "改进组件体系、工程结构、性能表现和用户体验。",
      },
      {
        title: "方案探讨",
        description: "讨论技术路线、产品形态和落地节奏。",
      },
    ],
  },

  social: [
    { label: "GitHub", href: "https://github.com/lumi1228", handle: "@lumi1228" },
  ],

  // 邮箱拆分存储，由客户端组件点击后拼接，避免明文邮箱出现在静态 HTML 中被爬虫采集
  contactEmail: {
    label: "邮箱",
    user: "lumiya1228",
    domain: "gmail.com",
  },
};
