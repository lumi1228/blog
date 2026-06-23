# Design Specification

> **Version**: 2.2.0  
> **Last Updated**: 2026-06-23  
> **Design Theme**: Midnight Elegance（极夜优雅·深邃暗紫版）  
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

**Midnight Elegance（极夜优雅·深邃暗紫版）**  
极简克制 × 单色主导 × 深邃神秘 × 女性高贵

**核心理念**：
- 极深紫黑背景主导，深邃暗紫作为唯一主色
- 单一主色系统，建立强烈品牌感和视觉聚焦
- 80-15-5 配色黄金比例：80% 灰度 + 15% 紫色 + 5% 金色
- 精致的 6 层紫调灰度系统，细腻渐进
- 深紫色营造神秘、高贵、专业的氛围
- 极少量金色点缀，强化高级感

**设计灵感**：
- 极夜中的深紫星空，神秘而高贵
- 皇室紫色的优雅与力量感
- 科技感与女性美的完美平衡
- 极简克制，摆脱"AI 模板感"

**适用人群**：女性开发者、设计师、追求高级感的创作者

**色彩哲学**：
- **极简克制**：只用一个主色，建立记忆点
- **单色主导**：深紫贯穿始终，强化品牌感
- **精准点缀**：金色占比 < 5%，仅用于特殊标记

---

## 3. 颜色系统

### 3.1 语义化 Token

#### 背景色（Dark Mode 默认）
```css
--bg-primary: #0A0A0F;         /* 极深紫黑 */
--bg-secondary: rgba(19, 19, 24, 0.4); /* 深紫灰（半透明，用于磨砂卡片） */
--bg-tertiary: #1A1A22;        /* 中深紫灰 */
--bg-elevated: #212129;        /* 浮层背景 */
```

#### 文字色
```css
--text-primary: #E8E6F0;       /* 淡紫白（柔和） */
--text-secondary: #A8A3B8;     /* 淡紫灰 */
--text-tertiary: #6B6878;      /* 中紫灰 */
```

#### 主色 - 深邃暗紫系（唯一主色）
```css
--accent-primary: #9333EA       /* 深紫（Purple 600）- 神秘高贵 */
--accent-hover: #A855F7         /* 中紫（Purple 500）*/
--accent-muted: rgba(147, 51, 234, 0.1)  /* 半透明背景 */
```

#### 点缀色 - 玫瑰金系（极少使用，< 5%）
```css
--accent-gold: #FCD34D          /* 柔和金色（Amber 300）*/
--accent-gold-muted: rgba(252, 211, 77, 0.1)
```

#### 边框
```css
--border-default: rgba(147, 51, 234, 0.08)  /* 深紫色调边框 */
--border-subtle: rgba(147, 51, 234, 0.04)   /* 极细深紫边框 */
```

#### 光晕
```css
--glow-primary: rgba(147, 51, 234, 0.25)     /* 深紫光晕 */
--glow-gold: rgba(252, 211, 77, 0.15)        /* 金色光晕 */
```

#### 语义色
```css
--success: #34D399  /* 成功状态 */
--warning: #FBBF24  /* 警告 */
--error: #F87171    /* 错误 */
```

### 3.2 Light Mode 覆盖
在 `.light` class 下，颜色系统自动切换至浅色模式：
- 背景从极深紫黑切换至淡紫白（`#FAFAFC` → `#FFFFFF`）
- 主色从中亮度紫切换至深紫（`#9333EA` → `#7C3AED`）
  - **原因**：保证在浅色背景上有足够对比度（≥ 4.5:1）
- 金色从柔和金切换至深金（`#FCD34D` → `#D97706`）
- 文字从淡紫白切换至深紫黑（`#E8E6F0` → `#1A1A22`）

**色彩自适应原则**：
不同背景需要不同明度的主色以保证对比度和可读性。Dark Mode 用中亮度紫（Purple 600），Light Mode 用深紫（Purple 700），确保两种模式下都符合 WCAG 无障碍标准。

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
--radius-sm: 6px    /* 小标签 */
--radius-md: 10px   /* 按钮、输入框 */
--radius-lg: 16px   /* 卡片 */
--radius-xl: 24px   /* 大型容器 */
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
--duration-fast: 200ms      /* 快速反馈（hover、focus） */
--duration-normal: 350ms    /* 标准过渡 */
--duration-slow: 500ms      /* 淡入淡出 */
--duration-slower: 800ms    /* 复杂动画 */

--ease-out: cubic-bezier(0.16, 1, 0.3, 1)  /* 减速退出 */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)  /* 弹簧效果 */
```

### 6.2 内置动画关键帧
| 动画名 | 效果 | 使用场景 |
|-------|------|---------|
| `fade-in-up` | 上浮淡入（24px） | 列表项、卡片进场 |
| `fade-in` | 淡入 | 模态框、提示 |
| `slide-up` | 底部滑入 | 底部弹窗 |
| `glow-pulse` | 呼吸光晕 | 强调元素 |
| `aurora-float` | 极光流体飘动 | Hero 区域背景极光球 |
| `snow-drift` | 冰雪微粒飘落 | Hero 区域雪花特效 |

**新增：极光与冰雪动效**
```css
/* 极光缓慢飘流（25-35秒周期） */
@keyframes aurora-float {
  0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
  33%  { transform: translate(40px, -60px) rotate(120deg) scale(1.2); }
  66%  { transform: translate(-30px, 30px) rotate(240deg) scale(0.85); }
  100% { transform: translate(0px, 0px) rotate(360deg) scale(1); }
}

/* 冰雪微粒缓慢飘落（12-18秒周期） */
@keyframes snow-drift {
  0%   { transform: translateY(-10px) translateX(0) rotate(0deg); opacity: 0; }
  10%  { opacity: 0.3; }
  90%  { opacity: 0.3; }
  100% { transform: translateY(120vh) translateX(50px) rotate(360deg); opacity: 0; }
}
```

**使用示例**：
```tsx
{/* 极光背景球 */}
<div className="animate-aurora-1" />  {/* 25s 周期 */}
<div className="animate-aurora-2" />  {/* 35s 周期，反向 */}
<div className="animate-aurora-3" />  {/* 30s 周期 */}

{/* 冰雪微粒 */}
<div style={{ animation: "snow-drift 12s linear infinite" }} />
```

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

**样式特征**（Nordic Aurora 版本）：
- **冰晶磨砂质感**：使用 `.frosted-glass` 类（`backdrop-blur-md` + 半透明背景）
- 边框：`border border-[var(--border-default)]`，hover 时切换为 `border-[var(--accent-primary)]/40`
- 光晕效果：`hover:shadow-[var(--shadow-glow-accent)]`（极光绿光晕）
- 分类标签：圆形胶囊 `rounded-full`，背景 `bg-[var(--accent-muted)]`，带细边框 `border-[var(--accent-primary)]/10`
  - Hover 时完全填充：`hover:bg-[var(--accent-primary)] hover:text-[#030712]`
- 标签：小圆角 `rounded-[var(--radius-sm)]`，半透明背景 `bg-[var(--bg-primary)]/30`
  - Hover 时边框和文字变为冰川蓝：`hover:border-[var(--accent-secondary)]`
- 底部装饰线：hover 时从左到右展开的**极光渐变流光**（绿→蓝→透明，2px 粗细）
- 封面图：带暗色渐变遮罩 `bg-gradient-to-t from-black/20`

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

### 7.7 column-card（专栏卡片）
**路径**: `components/column-card.tsx`

**样式特征**（Nordic Aurora 版本）：
- **冰晶磨砂质感**：使用 `.frosted-glass` 类
- 边框：hover 时切换为 `border-[var(--accent-secondary)]/40`（冰川蓝）
- 光晕效果：`hover:shadow-[var(--shadow-glow-blue)]`（冰川蓝光晕）
- 封面图遮罩：极夜渐变 `from-[#030712]/90 via-[#030712]/20 to-transparent`
- 封面图缩放：`group-hover:scale-[1.03]`（更细腻的缩放比例）
- 底部操作区：带顶部细边框分隔 `border-t border-[var(--border-subtle)]`
- 冰晶箭头按钮：
  - 圆形容器 `h-7 w-7 rounded-full`
  - 半透明背景 `bg-[var(--bg-primary)]/50`
  - Hover 时边框和背景变为冰川蓝：`hover:border-[var(--accent-secondary)]/30 hover:bg-[var(--accent-secondary)]/10`

**动画**：
- 进场动画：`animate-fade-in-up`，交错延迟 `${index * 100}ms`
- 箭头微移：`group-hover:translate-x-0.5`

**使用场景**：首页精选专栏、专栏列表页

---

### 7.8 .frosted-glass（冰晶磨砂通用类）
**定义位置**: `app/globals.css`

**核心代码**：
```css
.frosted-glass {
  background: var(--bg-secondary);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-default);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
}

.light .frosted-glass {
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4);
}
```

**使用场景**：
- 所有卡片容器（文章卡片、专栏卡片）
- 按钮（次要按钮、导航按钮）
- 需要毛玻璃效果的浮层元素

**说明**：
- `backdrop-filter: blur(12px)` 创建毛玻璃效果
- `bg-secondary` 使用半透明背景（`rgba(11, 17, 37, 0.4)`）
- `inset` 阴影营造内发光质感

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

### CSS 变量速查（Midnight Elegance v2.2）
```css
/* 背景 */
var(--bg-primary)    /* #0A0A0F 极深紫黑 */
var(--bg-secondary)  /* rgba(19,19,24,0.4) 深紫灰（半透明） */
var(--bg-tertiary)   /* #1A1A22 中深紫灰 */

/* 文字 */
var(--text-primary)    /* #E8E6F0 淡紫白 */
var(--text-secondary)  /* #A8A3B8 淡紫灰 */
var(--text-tertiary)   /* #6B6878 中紫灰 */

/* 主色（唯一） */
var(--accent-primary)    /* #9333EA 深紫（Purple 600）- 神秘高贵 */
var(--accent-hover)      /* #A855F7 中紫（Purple 500）*/
var(--accent-muted)      /* rgba(147,51,234,0.1) 半透明背景 */

/* 点缀色（< 5% 使用率） */
var(--accent-gold)       /* #FCD34D 柔和金色 */

/* 边框 */
var(--border-default)  /* rgba(255,255,255,0.08) 标准边框 */
var(--border-subtle)   /* rgba(255,255,255,0.04) 极细冰晶边框 */

/* 圆角 */
var(--radius-sm)    /* 6px 小标签 */
var(--radius-md)    /* 10px 按钮 */
var(--radius-lg)    /* 16px 卡片 */
var(--radius-full)  /* 9999px 胶囊 */

/* 动效 */
var(--duration-fast)    /* 200ms 快速反馈 */
var(--duration-normal)  /* 350ms 标准过渡 */
var(--ease-out)         /* cubic-bezier(0.16,1,0.3,1) */
```

### 常用组合 Pattern（Nordic Aurora 版本）
```tsx
/* 冰晶磨砂卡片容器 */
className="frosted-glass rounded-[var(--radius-lg)] p-6 sm:p-7
           transition-all duration-[var(--duration-normal)]
           hover:border-[var(--accent-primary)]/40 
           hover:shadow-[var(--shadow-glow-accent)]"

/* 主要按钮（极光渐变） */
className="rounded-[var(--radius-md)] 
           bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
           px-6 py-3 text-sm font-semibold text-[#030712]
           transition-all duration-[var(--duration-normal)]
           hover:shadow-[0_0_25px_var(--glow-primary)] hover:scale-[1.03]"

/* 次要按钮（冰晶磨砂） */
className="frosted-glass rounded-[var(--radius-md)]
           px-6 py-3 text-sm font-semibold text-[var(--text-primary)]
           transition-all duration-[var(--duration-fast)]
           hover:border-[var(--accent-secondary)] 
           hover:text-[var(--accent-secondary)]"

/* 分类标签（冰晶宝石质感） */
className="rounded-full bg-[var(--accent-muted)] px-3 py-0.5
           font-semibold text-[var(--accent-primary)] text-xs
           border border-[var(--accent-primary)]/10
           transition-all duration-[var(--duration-fast)]
           hover:bg-[var(--accent-primary)] hover:text-[#030712]"

/* 小标签（半透明冰晶） */
className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)]
           bg-[var(--bg-primary)]/30 px-2.5 py-0.5 text-xs text-[var(--text-tertiary)]
           transition-all duration-[var(--duration-fast)]
           hover:border-[var(--accent-secondary)] 
           hover:text-[var(--accent-secondary)]"

/* 极光流光边框（hover 展开） */
<div
  className="absolute bottom-0 left-6 right-6 h-[2px] origin-left scale-x-0
             transition-transform duration-[var(--duration-normal)]
             group-hover:scale-x-100"
  style={{
    background: "linear-gradient(to right, var(--accent-primary), var(--accent-secondary), transparent)"
  }}
/>
```

---

**文档结束**  
最后更新：2026-06-23  
设计主题：Midnight Elegance（极夜优雅·深邃暗紫版）v2.2

---

## 附录：设计更新日志

### v2.2.0 (2026-06-23)
**配色最终优化**：极简克制，单色主导

**核心变更**：
1. **从多色到单色**
   - 删除所有次要强调色（青绿、冰川蓝）
   - 只保留一个主色：深邃暗紫 `#9333EA`（Purple 600）
   - 金色作为极少量点缀（< 5% 使用率）

2. **主色升级**：淡紫 → 深紫
   - 原主色：`#A78BFA`（Violet 400）- 柔和梦幻
   - 新主色：`#9333EA`（Purple 600）- 神秘高贵
   - **理由**：更深沉、更神秘、更有力量感

3. **配色比例优化**：80-15-5 黄金法则
   - 80% 灰度系统（背景、文字、边框）
   - 15% 深紫主色（按钮、链接、强调）
   - 5% 金色点缀（特殊标记）

4. **背景系统精细化**
   - 从冰蓝调改为紫调灰度
   - 6 层精致的紫黑灰度渐进
   - 营造更加统一的视觉氛围

5. **简化视觉元素**
   - Hero 区域：3色极光 → 2个紫色光晕
   - 流光边框：紫→蓝渐变 → 紫色单色渐变
   - 按钮：渐变 → 实心深紫
   - SectionTitle：渐变方块 → 深紫实心方块

6. **色彩自适应原则明确**
   - Dark Mode：`#9333EA`（Purple 600）- 中亮度
   - Light Mode：`#7C3AED`（Purple 700）- 深色
   - 确保两种模式下对比度都 ≥ 4.5:1

**设计哲学转变**：
- 从"多色共存"到"单色主导"
- 从"复杂丰富"到"极简克制"
- 从"追求变化"到"建立记忆点"

**适用场景**：追求高级感、专业感、品牌辨识度的个人博客

---

### v2.1.0 (2026-06-23)
**配色升级**：Nordic Aurora → Midnight Stardust（极夜星辰·女性版）

**变更摘要**：
1. **主强调色升级**：翡翠绿 `#10B981` → 青绿极光 `#14B8A6`
   - 更柔和优雅，更符合女性审美
   - 保持科技感，同时增加温暖质感

2. **次强调色重构**：冰川蓝 `#38BDF8` → 淡紫星光 `#A78BFA`
   - 从冷峻蓝色转向梦幻紫色
   - 增加神秘感和女性化特质
   - 更独特，市面罕见

3. **辅助色优化**：极光紫 `#F472B6` → 玫瑰金星尘 `#F59E0B`
   - 从粉色改为金色系
   - 更温暖、更优雅
   - 作为点缀色更醒目

4. **设计理念转变**：
   - 从"北欧极光冰川"转向"极夜星辰星光"
   - 强化神秘感、科技感与女性优雅的平衡
   - 色彩更柔和梦幻，同时保持专业感

**适用人群**：女性开发者、设计师、创作者

---

### v2.0.0 (2026-06-23)
**重大设计重构**：从 Neo-futuristic Elegance 升级到 Nordic Aurora & Glacial Light

**变更摘要**：
1. **色彩系统全面升级**
   - 主强调色：玫瑰金 → 翡翠绿 (#10B981)
   - 次强调色：冰蓝 → 冰川蓝 (#38BDF8)
   - 新增三级强调色：极光紫/粉 (#F472B6)
   - 背景：从深黑优化为极深夜空黑 (#030712)

2. **新增核心通用类**
   - `.frosted-glass`：冰晶磨砂玻璃质感（backdrop-blur + 半透明）
   - `.animate-aurora-1/2/3`：极光流体飘动动画
   - 冰雪飘落动画：`snow-drift` keyframe

3. **组件样式升级**
   - 文章卡片：应用冰晶磨砂质感 + 极光流光边框
   - 专栏卡片：冰川蓝光晕 + 冰晶箭头按钮
   - Hero 区域：三色极光背景 + 5个冰雪微粒

4. **圆角体系调整**
   - 小圆角：4px → 6px
   - 中圆角：8px → 10px
   - 大圆角：12px → 16px
   - 超大圆角：16px → 24px

5. **动效时长调整**
   - 快速：150ms → 200ms
   - 标准：250ms → 350ms
   - 慢速：400ms → 500ms
   - 超慢：600ms → 800ms

**设计理念**：
营造北欧冬夜仰望极光的空灵、优雅视觉体验，摆脱 AI 模板感，强调冰晶质感和流体美学。
