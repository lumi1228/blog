
# 全栈博客系统0-1搭建流程

https://blog.csdn.net/qq_21873613/article/details/154194543


## 前端部分

### 1、创建next项目

npx create-next-app@latest .


## 后端部分

gitbub登陆注册supabase
首次需要创建Organization：设置数据库密码()
前端项目连接supabase
连接方式选择：framework
Install packages：npm install @supabase/supabase-js @supabase/ssr
Add files：.env.local、utils/supabase/server.ts、utils/supabase/client.ts、utils/supabase/middleware.ts

---------


## 部署部分

vercel







## 技术栈说明

### supabase
https://supabase.com/
Supabase是一个开源的后端即服务(BaaS)平台，主要作用是为开发者提供完整的后端解决方案，让开发者能够快速构建应用而无需编写服务器端逻辑
核心功能包括：
数据库托管：提供可扩展的PostgreSQL数据库，支持实时数据更新
身份验证：支持电子邮件、社交登录等多种身份验证方法
自动API生成：为数据库表自动生成RESTful和GraphQL API
实时功能：通过监听数据库变化实现实时数据推送
文件存储：管理文件和对象存储
Serverless函数：支持边缘函数和数据库函数

### vercel
Vercel是专注于静态网站、Serverless函数和全栈Web应用的托管服务平台。它的核心功能包括零配置部署、全球CDN加速、自动CI/CD流程、Serverless函数支持等。开发者只需将代码推送到Git仓库，Vercel就能自动构建和部署，大幅简化从开发到上线的流程


---
初始化客户端
接口修改
配置 Oauth