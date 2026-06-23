# Design Specification

> **Version**: 1.0.0  
> **Last Updated**: 2026-06-23  
> **Purpose**: 前端样式规范文档，确保 AI 和开发者输出一致的视觉设计和样式代码

---

## 1. 技术栈与样式系统

### 1.1 核心技术栈
- **Framework**: Next.js 16.2.3 (App Router)
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS v4 + CSS Variables
- **Theme Management**: 自定义 `ThemeProvider` (支持 dark/light/system)
- **i18n**: next-intl 4.12.0
- **External UI Components**: ❌ 无外部组件库（无 shadcn/ui、MUI 等）

### 1.2 样式入口文件
| 文件路径 | 职责 |
|---------|------|
| `app/globals.css` | CSS 变量定义、Tailwind 主题映射、全局基础样式、动画关键帧 |
| `app/layout.tsx` | 字体加载（Sora/Noto Sans SC/JetBrains Mono）、主题初始化脚本 |
| `components/theme-provider.tsx` | 主题状态管理（dark/light/system）、localStorage 持久化 |
| `components/theme-toggle.tsx` | 主题切换 UI 组件 |

---

## 2. 设计风格定位

**Neo-futuristic Elegance**  
几何感 × 柔和渐变 × 未来科技感 × 女性化优雅

**核心理念**：
- 深色调主导，玫瑰金/冰蓝作为强调色
- 流畅的动效过渡，呼吸感强
- 高对比度保证可读性
- 细腻的边框和光晕效果

---

## 3. 颜色系统

### 3.1 语义化 Token

#### 背景色
```css
--bg-primary: #0B0D11       /* 主背景（深黑） */
--bg-secondary: #12151C     /* 次级背景（卡片底色） */
--bg-tertiary: #1A1E28      /* 三级背景 */
--bg-elevated: #1F2430      /* 浮层背景 */
```

#### 文字色
```css
--text-primary: #E8E6E3     /* 标题、正文 */
--text-secondary: #9CA3AF   /* 次要文字、摘要 */
--text-tertiary: #6B7280    /* 辅助信息、占位符 */
```

#### 强调色 - 玫瑰金系（主强调）
```css
--accent-primary: #E8A0BF       /* 主强调色 */
--accent-hover: #F0B8D0         /* hover 状态 */
--accent-muted: rgba(232, 160, 191, 0.15)  /* 半透明背景 */
```

#### 强调色 - 冰蓝系（次强调）
```css
--accent-secondary: #7DD3FC
--accent-secondary-hover: #BAE6FD
```

#### 边框
```css
--border-default: #1F2937       /* 标准边框 */
--border-subtle: rgba(255, 255, 255, 0.06)  /* 微妙边框 */
```

#### 语义色
```css
--success: #34D399  /* 成功状态 */
--warning: #FBBF24  /* 警告 */
--error: #F87171    /* 错误 */
```

### 3.2 Light Mode 覆盖
在 `.light` class 下，颜色系统自动切换至浅色模式：
- 背景从深黑切换至米白色系（`#FAFAF9` → `#FFFFFF`）
- 强调色从玫瑰金切换至暗玫红（`#BE185D`）
- 文字从浅色切换至深色（`#1C1917`）

### 3.3 使用规范
✅ **推荐**：直接使用 CSS 变量  
```tsx
className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
```

❌ **避免**：硬编码颜色值  
```tsx
className="bg-[#12151C] text-[#E8E6E3]"  // 不推荐
```

---

## 4. 排版系统

### 4.1 字体族
| 用途 | 字体 | CSS 变量 | 权重 |
|-----|------|---------|-----|
| 标题/展示 | Sora | `var(--font-display)` | 300/400/500/600/700 |
| 正文 | Noto Sans SC | `var(--font-body)` | 300/400/500/700 |
| 代码 | JetBrains Mono | `var(--font-mono)` | 400/500 |

### 4.2 字号与行高规范
| 场景 | 字号 | 行高 | Tailwind 类 |
|-----|------|------|------------|
| H1 大标题 | 2rem (32px) | 1.2 | `text-3xl sm:text-4xl` |
| H2 次标题 | 1.5rem (24px) | 1.3 | `text-2xl sm:text-3xl` |
| 正文 | 1rem (16px) | 1.6-1.75 | `text-base leading-relaxed` |
| 小字 | 0.875rem (14px) | 1.5 | `text-sm` |
| 辅助信息 | 0.75rem (12px) | 1.4 | `text-xs` |

**移动端强制规则**：
- ≤ 640px 时，正文字号不低于 16px（防止 iOS 自动缩放）
- 移动端行高提升至 1.75 保证舒适阅读

---

## 5. 布局与间距

### 5.1 响应式断点
沿用 Tailwind 默认断点：
```
sm: 640px   → 手机横屏/小平板
md: 768px   → 平板
lg: 1024px  → 笔记本
xl: 1280px  → 桌面
```

### 5.2 间距规范
| 场景 | 间距 | 示例类名 |
|-----|------|---------|
| 组件内部小间距 | 8px-12px | `gap-2` `p-3` |
| 卡片内边距 | 20px-24px | `p-5 sm:p-6` |
| 章节间距 | 48px | `mt-12` |
| 页面顶部 margin | 32px-48px | `mt-8 sm:mt-12` |

### 5.3 圆角体系
```css
--radius-sm: 4px    /* 小标签 */
--radius-md: 8px    /* 按钮、输入框 */
--radius-lg: 12px   /* 卡片 */
--radius-xl: 16px   /* 大型容器 */
--radius-full: 9999px  /* 圆形/胶囊按钮 */
```

使用示例：
```tsx
className="rounded-[var(--radius-lg)]"  // 卡片
className="rounded-[var(--radius-full)]"  // 分类标签
```

---

## 6. 动效系统

### 6.1 时长与缓动函数
```css
--duration-fast: 150ms      /* 快速反馈（hover、focus） */
--duration-normal: 250ms    /* 标准过渡 */
--duration-slow: 400ms      /* 淡入淡出 */
--duration-slower: 600ms    /* 复杂动画 */

--ease-out: cubic-bezier(0.16, 1, 0.3, 1)  /* 减速退出 */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)  /* 弹簧效果 */
```

### 6.2 内置动画关键帧
| 动画名 | 效果 | 使用场景 |
|-------|------|---------|
| `fade-in-up` | 上浮淡入 | 列表项、卡片进场 |
| `fade-in` | 淡入 | 模态框、提示 |
| `slide-up` | 底部滑入 | 底部弹窗 |
| `glow-pulse` | 呼吸光晕 | 强调元素 |

### 6.3 交错动画延迟
```css
.stagger-1 { animation-delay: 50ms; }
.stagger-2 { animation-delay: 100ms; }
...
.stagger-6 { animation-delay: 300ms; }
```

**示例**：列表项依次出现
```tsx
<article className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
```

### 6.4 无障碍：减少动效偏好
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. 公共组件库

### 7.1 article-card（文章卡片）
**路径**: `components/article-card.tsx`

**样式特征**：
- 卡片底色：`bg-[var(--bg-secondary)]`
- 边框：`border-[var(--border-subtle)]`，hover 时切换为 `border-[var(--accent-primary)]/30`
- 光晕效果：`hover:shadow-[var(--shadow-glow-accent)]`
- 分类标签：胶囊形状 `rounded-[var(--radius-full)]`，背景 `bg-[var(--accent-muted)]`
- 标签：小圆角 `rounded-[var(--radius-sm)]`，边框样式
- 底部装饰线：hover 时从左到右展开的渐变线条

**动画**：
- 进场动画：`animate-fade-in-up`，交错延迟 `animationDelay: ${index * 80}ms`
- 封面图 hover 放大：`group-hover:scale-105`

**使用场景**：首页文章列表、分类/标签页、专栏文章列表

---

### 7.2 pagination（分页组件）
**路径**: `components/pagination.tsx`

**样式特征**：
- 按钮：`rounded-[var(--radius-md)]`，边框 `border-[var(--border-default)]`
- 当前页：实心背景 `bg-[var(--accent-primary)]`，文字反色
- hover 状态：边框和文字颜色切换为 `var(--accent-primary)`
- 禁用状态：边框 `border-[var(--border-subtle)]`，文字 `text-[var(--text-tertiary)]`
- 移动端隐藏文字：`<span className="hidden sm:inline">`

**使用场景**：文章列表分页、专栏章节分页

---

### 7.3 navbar（导航栏）
**路径**: `components/navbar.tsx` + `navbar-client.tsx`

**架构**：
- `navbar.tsx`：服务端组件，负责数据获取（分类、专栏）
- `navbar-client.tsx`：客户端组件，负责交互逻辑（移动端菜单、专栏下拉）

**样式特征**：
- 毛玻璃背景：`backdrop-blur-xl`，半透明背景
- 固定顶部：`sticky top-0 z-50`
- 链接 hover：`hover:text-[var(--accent-primary)]`
- 移动端汉堡菜单：`lg:hidden`
- 专栏下拉菜单：hover 展开，带 fade-in 动画

**使用场景**：全局导航

---

### 7.4 theme-toggle（主题切换）
**路径**: `components/theme-toggle.tsx`

**样式特征**：
- 三态切换按钮：dark / light / system
- 图标切换：月亮 🌙 / 太阳 ☀️ / 系统 💻
- hover 效果：背景色变化 + 缩放动画

**使用场景**：导航栏右上角

---

### 7.5 footer（页脚）
**路径**: `components/footer.tsx`

**样式特征**：
- 顶部边框：`border-t border-[var(--border-subtle)]`
- 背景：`bg-[var(--bg-secondary)]`
- 链接颜色：`text-[var(--text-tertiary)]`，hover 变为 `text-[var(--accent-primary)]`

---

### 7.6 TableOfContents（目录导航）
**路径**: `components/TableOfContents.tsx`

**样式特征**：
- 固定侧边栏：`sticky top-24`
- 当前激活项：`text-[var(--accent-primary)]` + 左侧装饰线
- 嵌套缩进：`pl-3` / `pl-6`

**使用场景**：文章详情页

---

### 7.7 column-sidebar（专栏侧边栏）
**路径**: `components/column-sidebar.tsx`

**样式特征**：
- 卡片容器：`bg-[var(--bg-secondary)]`
- 章节列表：可拖拽排序（仅管理员）
- 当前章节高亮：`bg-[var(--accent-muted)]`

**使用场景**：专栏详情页

---

## 8. Markdown 内容样式

### 8.1 prose 增强类
```css
.prose-custom {
  font-family: var(--font-body);
  color: var(--text-secondary);
}
```

### 8.2 代码块样式
- **Syntax Highlighter**: Shiki
- **主题**: `#24292e`（GitHub Dark）
- **背景清除规则**：清除 Shiki 内联背景，避免嵌套背景冲突
```css
.shiki code,
.shiki .line,
.shiki span {
  background-color: transparent !important;
}
```

### 8.3 移动端字号
```css
@media (max-width: 640px) {
  .prose-custom {
    font-size: 1rem;
    line-height: 1.75;
  }
}
```

---

## 9. 无障碍（a11y）

### 9.1 焦点样式
```css
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### 9.2 ARIA 标签
- 所有交互按钮必须有 `aria-label`
- 分页组件必须有 `<nav aria-label="分页导航">`
- 当前页必须标记 `aria-current="page"`

### 9.3 颜色对比度
- 正文：≥ 4.5:1
- 大号文字（≥18px）：≥ 3:1

---

## 10. 维护更新规则

### 10.1 必须更新 design-spec.md（A 级）
触发条件：
- ✅ 新增公共组件（新建 `components/*.tsx` 且被多页面复用）
- ✅ 修改 `globals.css` 中的 CSS 变量（颜色、字体、圆角、动效）
- ✅ 修改暗色/浅色模式规则
- ✅ 引入外部 UI 组件库（shadcn/ui、MUI 等）
- ✅ 修改响应式断点或全局布局规则

**更新位置**：
- 新组件 → 第 7 节「公共组件库」
- 颜色变量 → 第 3 节「颜色系统」
- 动效 → 第 6 节「动效系统」

---

### 10.2 建议更新（B 级）
触发条件：
- 🟡 局部样式模式升格为通用规范（如：某种按钮样式开始在多个地方复用）
- 🟡 新的布局模式在 3+ 页面中出现

**判断标准**：问自己"这个样式会被其他开发者/AI 复用吗？"

---

### 10.3 无需更新（C 级）
触发条件：
- ❌ 单页面微调（如：某个 About 页面的特殊布局）
- ❌ 一次性活动样式
- ❌ bugfix 级别的 className 修正

---

### 10.4 更新流程建议
1. **识别**：判断变更属于 A/B/C 哪一级
2. **同步**：如果是 A 级，立即更新 `design-spec.md` 对应章节
3. **验证**：确保新规范与现有规范无冲突
4. **版本号**：重大变更时递增版本号（文档顶部）

---

## 附录：快速查询表

### CSS 变量速查
```css
/* 背景 */
var(--bg-primary)
var(--bg-secondary)
var(--bg-tertiary)

/* 文字 */
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)

/* 强调色 */
var(--accent-primary)
var(--accent-hover)
var(--accent-muted)

/* 边框 */
var(--border-default)
var(--border-subtle)

/* 圆角 */
var(--radius-sm)
var(--radius-md)
var(--radius-lg)
var(--radius-full)

/* 动效 */
var(--duration-fast)
var(--duration-normal)
var(--ease-out)
```

### 常用组合 Pattern
```tsx
/* 卡片容器 */
className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] 
           bg-[var(--bg-secondary)] p-5 sm:p-6
           transition-all duration-[var(--duration-normal)]
           hover:border-[var(--accent-primary)]/30"

/* 主要按钮 */
className="rounded-[var(--radius-md)] bg-[var(--accent-primary)]
           px-4 py-2 text-sm font-medium text-[var(--bg-primary)]
           transition-colors duration-[var(--duration-fast)]
           hover:bg-[var(--accent-hover)]"

/* 次要按钮 */
className="rounded-[var(--radius-md)] border border-[var(--border-default)]
           px-4 py-2 text-sm font-medium text-[var(--text-secondary)]
           transition-all duration-[var(--duration-fast)]
           hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"

/* 标签样式 */
className="rounded-[var(--radius-full)] bg-[var(--accent-muted)]
           px-2.5 py-0.5 text-xs font-medium text-[var(--accent-primary)]"
```

---

**文档结束**  
最后更新：2026-06-23
