import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { sidebar } from './sidebar.js'

export default defineUserConfig({
  bundler: viteBundler(),
  colorMode: 'light',//'auto' | 'light' | 'dark'
  // home: '/blog/',
  base: '/',  
  lang: 'zh-CN',
  title: 'Lumi\'s Blog',
  description: '这是我的第一个 VuePress 站点',
  theme: defaultTheme({
    // repo: 'https://github.com/lumi1228/blog',
    navbar: [
      { text: 'Home', link: '/' },
      {
        text: '前端基础',
        prefix: '/fontend/',
        children: [
          { text: '概览', link: 'navigate.md' },
          { text: 'Javascript基础', link: 'class1/01.javascript.md' },
          { text: '数据结构与算法', link: 'class2/01.data-structure.md' },
        ]
      },
      {
        text: '全栈进阶',
        children: [
          {
            text: '全栈总览',
            link: '/fullstack/README.md' ,
            children: [
              { text: '前端困境与全栈破局', link: '/fullstack/class1/01.meet-fullstack.md' },
            ]
            // 通识与工程基础：
            // 保留「全栈总览」作为入口，
            // 再补充云原生理念、架构演进、协作模式等宏观主题，帮读者建立全局思维。
          },
          {
            text: '工程化工具',
            children: [
              { text: '打包工具之webpack', link: '/fullstack/class2/03.tool-webpack.md' },
              { text: '自动化工具之gulp', link: '/fullstack/class2/04.tool-gulp.md' },
              { text: '脚手架生成器之Yeoman「持续更新」', link: '/fullstack/class2/05.tool-yeoman.md' },
              { text: 'koa-web框架', link: '/fullstack/class2/06.koa-framework.md' },
              // { text: '开发环境搭建', link: '/fullstack/class2/06.koa-framework.md' },
            ]
            // 工程化与工具链：原有 webpack/gulp/Yeoman 属于前端工程，
            // 建议换成跨端/后端/DevOps向的工具，如包管理、CI/CD、容器化、监控告警等。
            // 可以细分为「构建与部署」「测试与质量」「运维可观测」三类，让读者按环节查找。
          },
          {
            text: '项目全流程DevOps',
            children: [
              { text: '项目需求分析与工具', link: '/fullstack/class3/02.project-require.md' },
              // { text: '文档管理与缺陷控制', link: '/fullstack/' },
              // { text: '版本管理', link: '/fullstack/' },
              // { text: '自动化流程', link: '/fullstack/' },
            ]
            // 项目流程与协作：你已有的「项目全流程 DevOps」
            // 可以调整为「需求→设计→交付→运维」链路，
            // 加入需求分析、架构设计、DevOps 实践、上线与回滚策略等，突出流程化能力。
          },
          // {
          //   text: '后端与服务设计',
          //   children: [
          //     { text: '项目需求分析与工具', link: '/fullstack/class3/02.project-require.md' },
          //     // { text: '文档管理与缺陷控制', link: '/fullstack/' },
          //     // { text: '版本管理', link: '/fullstack/' },
          //     // { text: '自动化流程', link: '/fullstack/' },
          //   ]
          //   // 项目流程与协作：你已有的「项目全流程 DevOps」
          //   // 可以调整为「需求→设计→交付→运维」链路，
          //   // 加入需求分析、架构设计、DevOps 实践、上线与回滚策略等，突出流程化能力。
          // },
          // {
          //   text: '业务实践/案例',
          //   children: [
          //     { text: '项目需求分析与工具', link: '/fullstack/class3/02.project-require.md' },
          //     // { text: '文档管理与缺陷控制', link: '/fullstack/' },
          //     // { text: '版本管理', link: '/fullstack/' },
          //     // { text: '自动化流程', link: '/fullstack/' },
          //   ]
          // },
 
 
          // {
          //   text: '前端进阶全栈基础',
          //   children: [
          //     { text: '认识大前端，全栈开发初体验', link: '/fullstack/L1/01.meet-fullstack.md' },
          //     { text: '企业级标准的开发环境搭建', link: '/fullstack/L1/02.project-require.md' },
          //     { text: 'NoSQL数据库的设计与集成', link: '/fullstack/L1/03.frontend-engineering.md' },
          //     { text: '登陆鉴权前端通用方案', link: '/fullstack/L1/04.backend-authentication.md' },
          //   ]
          // },
          // {
          //   text: 'PC端进阶前后端开发实战',
          //   children: [
          //     { text: '首页模块', link: '/fullstack/' },
          //     { text: '用户中心', link: '/fullstack/' },
          //     { text: '发帖/回帖模块', link: '/fullstack/' },
          //     { text: '消息中间件', link: '/fullstack/' },
          //   ]
          // },
          // {
          //   text: 'CMS后台管理系统开发实战',
          //   children: [
          //     { text: '组件化思想进阶', link: '/fullstack/' },
          //     { text: '前端权限设计方案', link: '/fullstack/' },
          //     { text: '基于角色与菜单的权限设计', link: '/fullstack/' },
          //     { text: '首页可视化图表与日志服务', link: '/fullstack/' },
          //   ]
          // },
        ]
      },
     
      {
        text: '剑指Offer',
        children: [
          { text: '面试概览', link: '/offer/README.md' },
          { text: '笔试部分', link: '/offer/class0/README.md'},
          { text: '基础八股文', 
            children: [
              { text: '概览', link: '/fontend/README.md' },
              { text: 'HTTP网络请求', link: '/offer/class1/05.http.md'},
            ]
          },
          { text: '框架与原理', 
            children: [
              { text: 'vue使用', link: '/offer/class2/01.vue-use.md' },
              { text: 'vue原理', link: '/offer/class2/02.vue-theory.md' },
            ]
          },
          { text: '项目与技术深度', 
            children: [
              { text: '概览', link: '/fontend/README.md' },
            ]
          },
          { text: 'HR面与综合考察', 
            children: [
              { text: '概览', link: '/fontend/README.md' },
            ]
          },
        ]
      },
      { text: 'GitHub', link: 'https://github.com/lumi1228' },
    ],
    sidebar
  })
})