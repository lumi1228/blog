import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  bundler: viteBundler(),
  base: '/blog/',  
  lang: 'zh-CN',
  title: 'lumi-blog',
  description: '这是我的第一个 VuePress 站点',
  theme: defaultTheme({
    navbar: [
      { text: 'Home', link: '/' },
      // {
      //   text: '前端基础',
      //   children: [
      //     { text: 'Introduction', link: '/guide/' },
      //   ]
      // },
      {
        text: '全栈进阶',
        children: [
          {
            text: '全栈总览',
            link: '/fullstack/README.md' 
          },
          {
            text: '前端进阶全栈基础',
            children: [
              { text: '认识大前端，全栈开发初体验', link: '/fullstack/L1/01.meet-fullstack.md' },
              { text: '企业级标准的开发环境搭建', link: '/fullstack/L1/02.project-require.md' },
              { text: 'NoSQL数据库的设计与集成', link: '/fullstack/L1/03.frontend-engineering.md' },
              { text: '登陆鉴权后端通用方案', link: '/fullstack/L1/04.backend-authentication.md' },
            ]
          },
          {
            text: '项目全流程DevOps',
            children: [
              { text: '文档管理与缺陷控制', link: '/fullstack/' },
              { text: '版本管理', link: '/fullstack/' },
              { text: '自动化流程', link: '/fullstack/' },
            ]
          },
          {
            text: 'PC端进阶前后端开发实战',
            children: [
              { text: '首页模块', link: '/fullstack/' },
              { text: '用户中心', link: '/fullstack/' },
              { text: '发帖/回帖模块', link: '/fullstack/' },
              { text: '消息中间件', link: '/fullstack/' },
            ]
          },
          {
            text: 'CMS后台管理系统开发实战',
            children: [
              { text: '组件化思想进阶', link: '/fullstack/' },
              { text: '前端权限设计方案', link: '/fullstack/' },
              { text: '基于角色与菜单的权限设计', link: '/fullstack/' },
              { text: '首页可视化图表与日志服务', link: '/fullstack/' },
            ]
          },
        ]
      },
      { text: 'GitHub', link: 'https://github.com/lumi1228' },
    ],
    sidebar: {
      '/fullstack/': [
        {
          text: '认识大前端，全栈开发初体验',
          children: [
            { text: '一、前端困境与全栈破局', link: '/fullstack/L1/01.meet-fullstack.md' },
            { text: '二、项目需求分析与工具', link: '/fullstack/L1/02.project-require.md' },
            { text: '三、打包工具之webpack', link: '/fullstack/L1/03.tool-webpack.md' },
            { text: '四、自动化工具之gulp', link: '/fullstack/L1/04.tool-gulp.md' },
            { text: '五、脚手架生成器之Yeoman「持续更新」', link: '/fullstack/L1/05.tool-yeoman.md' },
            { text: '六、web框架之koa', link: '/fullstack/L1/06.koa-framework.md' },
            { text: '七、全栈开发之登录模块', link: '/fullstack/L1/07.login-module.md' },
            { text: '前端工程化概览', link: '/fullstack/L1/overview-engineering.md' },
          ]
        }
      ]
    }
  }),
})