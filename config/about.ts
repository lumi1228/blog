/**
 * About 页面配置
 * 后续可迁移到数据库或后台编辑
 */

export const aboutConfig = {
  name: "lumi",
  title: "前端工程师 · Next.js 全栈实践者 · AI Coding 探索者",
  tagline: "用代码把想法变成现实，用 AI 让开发更高效。",
  avatar: null as string | null,

  profile: {
    englishName: "lumi",
    nickname: "小咸菜",
    chineseName: "娄女士",
  },

  intro: [
    "你好，我是 lumi，也可以叫我小咸菜，中文名娄女士。",
    "我长期深耕前端开发，关注用户体验、工程质量和业务落地。从页面交互、组件体系到复杂系统的前端架构，都有持续的实践和积累。",
    "近几年，我将能力重心拓展到 Next.js 全栈开发，覆盖服务端渲染、数据获取、SEO 优化到完整项目交付。最近也在深入探索 AI Coding，通过 AI 辅助开发和智能工作流，把想法更快、更稳地落到真实项目中。",
    "这个空间记录我的技术思考和实践心得，也希望能与你一起探索更好的开发方式。",
  ],

  skills: {
    "多年前端深耕": {
      description: "长期专注前端开发，熟悉现代前端技术栈、组件化架构、性能优化与复杂交互实现，能够从业务需求出发构建稳定、易维护的前端系统。",
      tags: ["React", "Vue", "TypeScript", "Component Design", "Performance", "UX"],
    },
    "Next.js 全线能力": {
      description: "从传统前端进一步转向 Next.js 全栈实践，熟悉 App Router、Server Components、SSR/SSG、API Routes、SEO、多语言、鉴权与部署链路，能够独立完成从页面到服务端的完整交付。",
      tags: ["Next.js", "App Router", "RSC", "SSR", "SEO", "i18n", "Deployment"],
    },
    "AI Coding 全栈实践": {
      description: "正在深入探索 AI Coding 在真实项目中的应用，结合 AI 辅助开发、需求拆解、代码生成、调试优化与自动化工作流，提高全栈项目的开发效率和交付质量。",
      tags: ["AI Coding", "Prompt Engineering", "Agent Workflow", "Full-stack", "Automation"],
    },
    "工程落地与产品思维": {
      description: "不只关注代码实现，也关注项目是否能持续迭代、是否便于维护、是否真正解决问题。能够在技术选型、架构设计、体验优化和落地节奏之间找到平衡。",
      tags: ["Architecture", "Delivery", "Refactor", "Product Thinking", "Quality"],
    },
  } as Record<string, { description: string; tags: string[] }>,

  collaboration: {
    intro: "如果你正在做一个产品、工具、内容平台、官网、SaaS 原型，或希望把 AI 能力接入现有业务，我可以与你一起从想法梳理、技术方案、前端架构到全栈落地推进。",
    offers: [
      {
        title: "项目合作",
        description: "参与 Web 产品、官网、后台系统、内容平台、个人产品等项目的设计与开发。",
      },
      {
        title: "Next.js 全栈落地",
        description: "从页面、接口、数据、SEO、多语言到部署，帮助项目更快上线。",
      },
      {
        title: "AI 全栈实践",
        description: "结合 AI Coding、AI 工作流和现有业务场景，探索更高效的开发与交付方式。",
      },
      {
        title: "前端架构与体验优化",
        description: "改进组件体系、工程结构、性能表现和用户体验。",
      },
      {
        title: "方案探讨与改进建议",
        description: "如果你已有想法或项目，也可以一起讨论技术路线、产品形态和落地节奏。",
      },
    ],
  },

  social: [
    { label: "GitHub", href: "https://github.com/lumi1228", handle: "@lumi1228" },
    { label: "邮箱", href: "mailto:lumiya1228@gmail.com", handle: "lumiya1228@gmail.com" },
  ],
};
