#!/bin/bash

echo "正在构建 VuePress 项目..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 构建失败，终止脚本！"
  read -p "按任意键继续..."  # 类似 Windows 的 pause
  exit $?
fi

echo "✅ 构建完成，进入构建输出目录..."
cd docs/.vuepress/dist || exit  # 若目录不存在则退出

echo "初始化 Git 仓库..."
git init
git add .
git commit -m "deploy"

echo "推送到 GitHub gh-pages 分支..."
git branch -M gh-pages
git remote add origin https://github.com/lumi1228/blog.git
git push -f origin gh-pages

echo "🎉 更新完成！"
read -p "按任意键继续..."  # 暂停等待用户确认