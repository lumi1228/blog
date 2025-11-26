import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  bundler: viteBundler(),
  base: '/blog/',  
  lang: 'zh-CN',
  title: 'Lumi\'s Blog',
  description: '这是我的第一个 VuePress 站点',
  theme: defaultTheme({
    navbar: [
      { text: 'Home', link: '/' },
      {
        text: '前端基础',
        children: [
          { text: '概览', link: '/fontend/navigate.md' },
          { text: 'Javascript基础', link: '/fontend/class1/01.javascript.md' },
          { text: '数据结构与算法', link: '/fontend/class2/01.data-structure.md' },
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
          { text: '笔试部分', 
            children: [
              { text: '笔试分类概览', link: '/offer/class0/README.md' },
            ]
          },
          { text: '基础八股文', 
            children: [
              { text: '概览', link: '/fontend/README.md' },
            ]
          },
          { text: '框架与原理', 
            children: [
              { text: '概览', link: '/fontend/README.md' },
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
    sidebar: {
      '/fontend/class1': [
        {
          text: 'Javascript基础',
          children: [
            { text: 'JavaScript 简介', link: '/fontend/class1/02.javascript-introduce.md' },
            { text: '基本概念', link: '/fontend/class1/03.basic-concept.md' },
            { text: '数据类型', link: '/fontend/class1/04.data-type.md' },
            { text: '操作符', link: '/fontend/class1/05.operator.md' },
            { text: '变量、作用域和内存', link: '/fontend/class1/06.variable-scope-memory.md' },
            { text: '面向对象的程序', link: '/fontend/class1/07.object-oriented-program.md' },
            { text: '面向对象的程序之创建对象', link: '/fontend/class1/08.create-object.md' },
            { text: '面向对象的程序设计之继承', link: '/fontend/class1/09.inheritance.md' },
            { text: '函数表达式', link: '/fontend/class1/10.function-expression.md' },

          ]
        }
      ],
      '/fontend/class2': [
        {
          text: '数据结构与算法',
          children: [
            { text: '数据结构与算法简介', link: '/fontend/class2/01.data-structure.md' },
            { text: '时间与空间复杂度', link: '/fontend/class2/02.time-space-complexity.md' },
            { text: '栈', link: '/fontend/class2/03.stack.md' },
            { text: '队列', link: '/fontend/class2/04.queue.md' },
            { text: '链表', link: '/fontend/class2/05.linked-list.md' },
            { text: '集合', link: '/fontend/class2/06.set.md' },
            { text: '字典', link: '/fontend/class2/07.dictionary.md' },
            { text: '树', link: '/fontend/class2/08.tree.md' },
            { text: '图', link: '/fontend/class2/09.graph.md' },
            { text: '堆', link: '/fontend/class2/10.heap.md' },
            { text: '排序搜索', link: '/fontend/class2/11.sort-search.md' },
            { text: '分而治之', link: '/fontend/class2/12.divide-and-conquer.md' },
            { text: '动态规划', link: '/fontend/class2/13.dynamic-programming.md' },
            { text: '贪心算法', link: '/fontend/class2/14.greedy-algorithm.md' },
            { text: '回溯算法', link: '/fontend/class2/15.backtracking.md' },
          ]
        }
      ],
      '/fullstack/class2/': [
        {
          text: '工程化工具',
          children: [
            { text: '打包工具之webpack', link: '/fullstack/class2/03.tool-webpack.md' },
            { text: '自动化工具之gulp', link: '/fullstack/class2/04.tool-gulp.md' },
            { text: '脚手架生成器之Yeoman「持续更新」', link: '/fullstack/class2/05.tool-yeoman.md' },
            { text: 'web框架之koa', link: '/fullstack/class2/06.koa-framework.md' },
          ]
        }
      ],
      '/fullstack/class3/': [
        {
          text: '项目全流程DevOps',
          children: [
            { text: '项目需求分析与工具', link: '/fullstack/class3/02.project-require.md' },
            // { text: '自动化工具之gulp', link: '/fullstack/L1/04.tool-gulp.md' },
            // { text: '脚手架生成器之Yeoman「持续更新」', link: '/fullstack/L1/05.tool-yeoman.md' },
            // { text: 'web框架之koa', link: '/fullstack/L1/06.koa-framework.md' },
          ]
        },
      ],
      '/fullstack/class/': [
        {
          text: '项目全流程DevOps',
          children: [
            { text: '打包工具之webpack', link: '/fullstack/class1/02.project-require.md' },
            // { text: '自动化工具之gulp', link: '/fullstack/L1/04.tool-gulp.md' },
            // { text: '脚手架生成器之Yeoman「持续更新」', link: '/fullstack/L1/05.tool-yeoman.md' },
            // { text: 'web框架之koa', link: '/fullstack/L1/06.koa-framework.md' },
          ]
        },
        {
          text: '认识大前端，全栈开发初体验',
          children: [
            { text: '1.前端困境与全栈破局', link: '/fullstack/L1/01.meet-fullstack.md' },
            { text: '7.登录模块前端通用方案-持续更新', link: '/fullstack/L1/07.login-module.md' },
            { text: '前端工程化概览', link: '/fullstack/L1/overview-engineering.md' },
          ]
        },
      ]
    }
  }),
})