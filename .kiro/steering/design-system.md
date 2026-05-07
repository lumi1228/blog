---
inclusion: fileMatch
fileMatchPattern: "**/*.{tsx,css,ts}"
---

# 博客设计系统规范 · Design System

> 风格定位：Neo-futuristic Elegance（新未来主义优雅）
> 关键词：暗色科技感 · 女性力量 · 冷静锐利 · 优雅精致
> 双主题：Dark Mode（主）+ Light Mode

---

## 一、设计理念

这不是"粉色甜美"的女性化设计，而是**冷静、锐利、优雅**的科技女性气质：
- 深邃的暗色背景中，玫瑰金（Rose Gold）作为点缀色贯穿全局
- 几何线条与柔和曲线并存，刚柔并济
- 精致的微光效果（glow）暗示科技感
- 留白克制，排版精确，体现工程师的严谨

---

## 二、色彩系统

### Dark Mode（主题色）

```
--bg-primary: #0B0D11          // 深空黑（主背景）
--bg-secondary: #12151C        // 次级背景（卡片、侧栏）
--bg-tertiary: #1A1E28         // 三级背景（hover、active 状态）
--bg-elevated: #1F2430         // 浮层背景（弹窗、下拉）

--text-primary: #E8E6E3        // 主文字（暖白，非纯白，减少刺眼）
--text-secondary: #9CA3AF      // 次级文字（描述、时间）
--text-tertiary: #6B7280       // 三级文字（placeholder）

--accent-primary: #E8A0BF      // 玫瑰金/柔粉（主强调色）
--accent-hover: #F0B8D0        // 强调色 hover 态
--accent-muted: rgba(232, 160, 191, 0.15)  // 强调色低透明度背景

--accent-secondary: #7DD3FC    // 冰蓝（代码高亮、链接）
--accent-secondary-hover: #BAE6FD

--border-default: #1F2937      // 默认边框
--border-subtle: rgba(255, 255, 255, 0.06) // 微妙分割线

--glow-primary: rgba(232, 160, 191, 0.2)   // 玫瑰金光晕
--glow-secondary: rgba(125, 211, 252, 0.15) // 冰蓝光晕

--success: #34D399
--warning: #FBBF24
--error: #F87171
```

### Light Mode

```
--bg-primary: #FAFAF9          // 暖白（非纯白，带一点米色温度）
--bg-secondary: #F5F3F0        // 次级背景
--bg-tertiary: #EDEBE8         // 三级背景
--bg-elevated: #FFFFFF          // 浮层

--text-primary: #1C1917        // 主文字（暖黑）
--text-secondary: #57534E      // 次级文字
--text-tertiary: #A8A29E       // 三级文字

--accent-primary: #BE185D      // 深玫红（Light 模式下加深以保证对比度）
--accent-hover: #9F1239
--accent-muted: rgba(190, 24, 93, 0.08)

--accent-secondary: #0369A1    // 深蓝（Light 模式下加深）
--accent-secondary-hover: #075985

--border-default: #E7E5E4
--border-subtle: rgba(0, 0, 0, 0.06)

--glow-primary: rgba(190, 24, 93, 0.1)
--glow-secondary: rgba(3, 105, 161, 0.08)

--success: #059669
--warning: #D97706
--error: #DC2626
```

---

## 三、字体系统

### 字体选择

```
--font-display: "Sora", sans-serif          // 标题字体：几何感、现代、有力量
--font-body: "Noto Sans SC", sans-serif     // 正文字体：中文优先，清晰可读
--font-mono: "JetBrains Mono", monospace    // 代码字体：专业开发者气质
```

Google Fonts 引入：
```
Sora:wght@300;400;500;600;700
Noto+Sans+SC:wght@300;400;500;700
JetBrains+Mono:wght@400;500
```

### 字号阶梯（基于 rem，base = 16px）

```
--text-xs: 0.75rem      // 12px - 辅助信息
--text-sm: 0.875rem     // 14px - 次要文字、标签
--text-base: 1rem       // 16px - 正文
--text-lg: 1.125rem     // 18px - 大段正文
--text-xl: 1.25rem      // 20px - 小标题
--text-2xl: 1.5rem      // 24px - 二级标题
--text-3xl: 1.875rem    // 30px - 一级标题
--text-4xl: 2.25rem     // 36px - 页面标题
--text-5xl: 3rem        // 48px - Hero 标题
```

### 行高

```
--leading-tight: 1.25    // 标题
--leading-normal: 1.6    // 正文（中文需要更大行高）
--leading-relaxed: 1.75  // 文章正文（阅读舒适度）
```

### 字重

```
--font-light: 300        // 大标题装饰
--font-regular: 400      // 正文
--font-medium: 500       // 强调
--font-semibold: 600     // 小标题
--font-bold: 700         // 大标题
```

---

## 四、间距系统（4px 基准）

```
--space-1: 0.25rem    // 4px
--space-2: 0.5rem     // 8px
--space-3: 0.75rem    // 12px
--space-4: 1rem       // 16px
--space-5: 1.25rem    // 20px
--space-6: 1.5rem     // 24px
--space-8: 2rem       // 32px
--space-10: 2.5rem    // 40px
--space-12: 3rem      // 48px
--space-16: 4rem      // 64px
--space-20: 5rem      // 80px
--space-24: 6rem      // 96px
```

---

## 五、圆角

```
--radius-sm: 4px       // 小元素（标签、badge）
--radius-md: 8px       // 按钮、输入框
--radius-lg: 12px      // 卡片
--radius-xl: 16px      // 大卡片、弹窗
--radius-full: 9999px  // 圆形（头像、pill 按钮）
```

---

## 六、阴影

```
// Dark Mode 使用光晕（glow）而非传统阴影
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3)
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4)
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5)
--shadow-glow-accent: 0 0 20px var(--glow-primary)
--shadow-glow-blue: 0 0 20px var(--glow-secondary)

// Light Mode 使用柔和阴影
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06)
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08)
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12)
```

---

## 七、动效规范

### 过渡时长

```
--duration-fast: 150ms      // 微交互（hover 颜色变化）
--duration-normal: 250ms    // 常规过渡（展开、收起）
--duration-slow: 400ms      // 页面级动画（进入、退出）
--duration-slower: 600ms    // 强调动画（Hero 区域）
```

### 缓动曲线

```
--ease-out: cubic-bezier(0.16, 1, 0.3, 1)       // 元素出现（快出慢停）
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)   // 状态切换
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1) // 弹性效果（按钮点击）
```

### 动效原则

- 页面加载：元素从下方 fade-in + slide-up，stagger delay 50ms
- Hover 效果：卡片微微上浮 + 边框发光（glow）
- 主题切换：背景色 400ms 过渡，文字色 200ms 过渡
- 代码块：hover 时显示复制按钮，fade-in 150ms

---

## 八、组件风格基调

### 按钮

```
Primary: 玫瑰金背景 + 深色文字，hover 时发光
Secondary: 透明背景 + 玫瑰金边框 + 玫瑰金文字
Ghost: 无边框 + hover 时显示背景色
```

### 卡片（文章卡片）

```
Dark: bg-secondary + border-subtle 边框 + hover 时 glow-primary 光晕
Light: bg-elevated + shadow-sm + hover 时 shadow-md 加深
```

### 导航栏

```
背景：bg-primary 带 backdrop-blur（毛玻璃效果）
当前页：accent-primary 下划线或文字高亮
```

### 标签/Badge

```
Dark: accent-muted 背景 + accent-primary 文字
Light: accent-muted 背景 + accent-primary 文字
圆角：radius-full（pill 形状）
```

### 代码块

```
背景：比 bg-primary 更深一级
边框：border-subtle
左侧：3px accent-secondary 色条
字体：font-mono
```

---

## 九、响应式断点

```
--breakpoint-sm: 640px     // 手机横屏
--breakpoint-md: 768px     // 平板
--breakpoint-lg: 1024px    // 小桌面
--breakpoint-xl: 1280px    // 标准桌面
--breakpoint-2xl: 1536px   // 大屏
```

### 内容最大宽度

```
文章正文：max-width 720px
页面容器：max-width 1200px
全宽区域：max-width 1440px
```

---

## 十、特殊视觉元素

### 背景纹理

- Dark Mode：微妙的点阵网格（dot grid），opacity 0.03
- 可选：渐变光斑（gradient orb）在页面角落，玫瑰金 + 冰蓝

### 装饰线条

- 分割线使用渐变：从 accent-primary 到 transparent
- 标题前可加短横线装饰（accent-primary 色）

### 光标/选中

- 文字选中背景：accent-muted
- 自定义滚动条：细窄 + accent-primary 色

---

## 十一、无障碍要求

- 所有文字与背景对比度 ≥ 4.5:1（WCAG AA）
- accent-primary 在 Dark Mode 下与 bg-primary 对比度 ≥ 4.5:1 ✓
- accent-primary 在 Light Mode 下（#BE185D）与 bg-primary 对比度 ≥ 4.5:1 ✓
- 焦点状态使用 2px outline + accent-primary 色
- 动效支持 `prefers-reduced-motion` 媒体查询

---

## 十二、实现约定

- 使用 Tailwind CSS v4 的 `@theme` 定义 CSS 变量
- 主题切换通过 `<html>` 标签的 `class="dark"` / `class="light"` 控制
- 默认跟随系统偏好（`prefers-color-scheme`），用户可手动切换
- 所有颜色通过 CSS 变量引用，禁止硬编码色值
- 组件使用语义化变量名（如 `--bg-primary`），不直接使用色值
