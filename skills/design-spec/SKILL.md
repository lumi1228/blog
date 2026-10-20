# design-spec Skill

## Metadata
- **Name**: design-spec
- **Type**: Project-specific
- **Scope**: Frontend styling, design system, UI consistency
- **Version**: 1.0.0

---

## Purpose

确保 AI 在开发中稳定输出符合项目规范的前端样式代码。当任务涉及**样式开发、UI 实现、组件样式调整**时，自动加载此 Skill 并遵循 `design-spec.md` 中定义的设计规范。

---

## When to Load This Skill

**必须加载的场景**：
1. ✅ 用户明确提到"样式"、"UI"、"设计"、"主题"、"颜色"、"布局"
2. ✅ 创建新组件时（涉及 className、样式定义）
3. ✅ 修改现有组件的视觉呈现
4. ✅ 实现响应式布局、暗色模式切换
5. ✅ 调整动画效果、过渡效果
6. ✅ 处理 Markdown 内容渲染样式

**可选加载的场景**：
- 🟡 重构组件代码但涉及样式调整
- 🟡 用户询问"这个颜色为什么是这样"等设计相关问题

**无需加载的场景**：
- ❌ 纯逻辑开发（API 路由、数据处理、类型定义）
- ❌ 配置文件修改（next.config.ts、tsconfig.json）
- ❌ 测试代码编写（除非测试样式输出）

---

## Skill Workflow

### Phase 1: 读取设计规范
1. 自动读取 `/design-spec.md` 文件
2. 提取当前任务相关的样式规则（颜色、间距、动效等）
3. 确认是否有相关公共组件可复用

### Phase 2: 样式开发
遵循以下原则：
- **优先使用 CSS 变量**（`var(--bg-primary)`，而非硬编码 `#0B0D11`）
- **复用现有组件模式**（参考 `article-card`、`pagination` 等）
- **保持响应式**（mobile-first，使用 `sm:` `md:` `lg:` 前缀）
- **支持暗色模式**（确保样式在 `.light` class 下正常工作）
- **使用语义化 token**（`--text-primary` 而非 `--gray-900`）

### Phase 3: 动效与过渡
- 使用标准时长：`var(--duration-fast)` / `var(--duration-normal)` / `var(--duration-slow)`
- 使用标准缓动函数：`var(--ease-out)` / `var(--ease-in-out)`
- 列表进场使用 `animate-fade-in-up` + 交错延迟
- hover 状态使用 `transition-all` 或 `transition-colors`

### Phase 4: 无障碍检查
- [ ] 所有交互元素有合适的 `aria-label`
- [ ] 焦点样式清晰（`:focus-visible`）
- [ ] 颜色对比度符合 WCAG AA 标准
- [ ] 支持 `prefers-reduced-motion`

### Phase 5: 规范更新判断
**关键步骤**：完成样式开发后，自动评估是否需要更新 `design-spec.md`

#### 判断标准（参考规范第 10 节）

**A 级 - 必须更新**：
- ✅ 新增了可复用的公共组件
- ✅ 修改了 `globals.css` 中的 CSS 变量
- ✅ 改变了暗色/浅色模式规则
- ✅ 引入了新的 UI 组件库
- ✅ 修改了全局响应式规则

**更新动作**：
1. 在 `design-spec.md` 对应章节追加新内容
2. 更新文档顶部的 "Last Updated" 日期
3. 如涉及破坏性变更，递增版本号

**B 级 - 建议更新**：
- 🟡 局部样式模式开始在 3+ 页面复用
- 🟡 形成了新的可复用布局 pattern

**更新动作**：
- 询问用户是否需要将其升格为规范

**C 级 - 无需更新**：
- ❌ 单页面特殊样式
- ❌ 一次性活动样式
- ❌ bugfix 级别的微调

**更新动作**：无

---

## Collaboration with Other Skills

### 与 `project-codemap` Skill 的协作
- **project-codemap** 负责：项目结构、模块职责、文件定位
- **design-spec** 负责：样式规范、视觉设计、组件样式

**协作场景示例**：
```
用户："我想在首页加一个新的文章列表组件"

1. project-codemap 定位：
   - 确认首页文件位置：app/[locale]/page.tsx
   - 确认组件目录：components/
   - 说明数据获取逻辑：lib/db.ts

2. design-spec 定位：
   - 提供 article-card 样式参考
   - 提供卡片容器 CSS Pattern
   - 提供列表进场动画规则

3. 协作输出：
   - 创建新组件文件，使用符合规范的样式
   - 确保组件放在正确的目录结构中
```

**触发方式**：
- 如果任务同时涉及**文件定位 + 样式开发**，两个 Skill 可同时加载
- 单独样式问题，仅加载 design-spec
- 单独结构问题，仅加载 project-codemap

---

## Output Format

### 样式代码输出示例
```tsx
// ✅ 推荐：使用 CSS 变量 + 语义化类名
<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] 
                bg-[var(--bg-secondary)] p-5 sm:p-6
                transition-all duration-[var(--duration-normal)]
                hover:border-[var(--accent-primary)]/30 hover:shadow-[var(--shadow-glow-accent)]">
  <h3 className="text-lg font-semibold text-[var(--text-primary)]
                 transition-colors duration-[var(--duration-fast)]
                 group-hover:text-[var(--accent-primary)]"
      style={{ fontFamily: "var(--font-display)" }}>
    {title}
  </h3>
</div>

// ❌ 避免：硬编码颜色值
<div className="rounded-lg border border-gray-800 bg-[#12151C] p-6">
  <h3 className="text-lg font-semibold text-white">{title}</h3>
</div>
```

### 规范更新输出示例
当触发 A 级更新时：
```markdown
**规范更新建议**：
由于新增了公共组件 `SearchBar`，建议更新 `design-spec.md`：

**更新位置**：第 7 节「公共组件库」  
**新增内容**：
### 7.8 SearchBar（搜索框）
**路径**: `components/search-bar.tsx`

**样式特征**：
- 输入框：`rounded-[var(--radius-md)]`，边框 `border-[var(--border-default)]`
- 聚焦状态：边框切换为 `border-[var(--accent-primary)]`，带光晕效果
- 搜索图标：使用 `text-[var(--text-tertiary)]`

**使用场景**：首页、分类页、标签页的文章搜索
```

---

## Examples

### Example 1: 创建新按钮组件
**用户请求**: "帮我创建一个主要按钮组件"

**Skill 执行流程**：
1. 读取 `design-spec.md` 第 3/6/7 节（颜色、动效、组件参考）
2. 参考附录「常用组合 Pattern」中的按钮模式
3. 输出代码：
```tsx
export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      className="rounded-[var(--radius-md)] bg-[var(--accent-primary)]
                 px-4 py-2 text-sm font-medium text-[var(--bg-primary)]
                 transition-colors duration-[var(--duration-fast)]
                 hover:bg-[var(--accent-hover)]
                 focus-visible:outline focus-visible:outline-2 
                 focus-visible:outline-[var(--accent-primary)]"
      {...props}
    >
      {children}
    </button>
  );
}
```
4. 判断：此为新增公共组件（A 级），建议更新 `design-spec.md`

---

### Example 2: 调整现有组件样式
**用户请求**: "把 article-card 的 hover 效果改得更明显"

**Skill 执行流程**：
1. 读取 `design-spec.md` 第 7.1 节（article-card 规范）
2. 读取 `components/article-card.tsx` 当前代码
3. 增强 hover 效果（如增加光晕强度、添加缩放动画）
4. 判断：局部微调（C 级），无需更新规范

---

### Example 3: 响应式布局调整
**用户请求**: "首页在移动端显示有问题，标题被截断"

**Skill 执行流程**：
1. 读取 `design-spec.md` 第 4.2 节（字号规范）和第 5.1 节（响应式断点）
2. 检查当前移动端样式
3. 调整为：`text-lg sm:text-xl`，确保移动端字号合理
4. 判断：bugfix 级别（C 级），无需更新规范

---

## Anti-Patterns（反模式）

### ❌ 不要这样做

**1. 硬编码颜色值**
```tsx
// Bad
<div className="bg-[#12151C] text-[#E8E6E3]">

// Good
<div className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
```

**2. 不一致的圆角**
```tsx
// Bad
<button className="rounded-md">  // 使用 Tailwind 默认值

// Good
<button className="rounded-[var(--radius-md)]">  // 使用规范定义
```

**3. 忽略暗色模式**
```tsx
// Bad
<div className="bg-white text-black">  // 在暗色模式下不可读

// Good
<div className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
```

**4. 过度自定义动效**
```tsx
// Bad
<div className="transition-all duration-[327ms]">  // 非标准时长

// Good
<div className="transition-all duration-[var(--duration-normal)]">
```

**5. 无障碍缺失**
```tsx
// Bad
<button onClick={...}>
  <svg>...</svg>
</button>

// Good
<button onClick={...} aria-label="关闭对话框">
  <svg aria-hidden="true">...</svg>
</button>
```

---

## Maintenance

### 定期检查项
1. **季度检查**：确认 `design-spec.md` 与实际代码一致性
2. **新组件上线后**：及时更新第 7 节「公共组件库」
3. **设计语言调整后**：同步更新颜色/字体/动效规范

### 版本管理
- **Patch 更新** (1.0.x)：修正错别字、补充示例
- **Minor 更新** (1.x.0)：新增组件规范、新增样式 pattern
- **Major 更新** (x.0.0)：设计语言重大变更（如更换主色调、引入新 UI 库）

---

## Summary

此 Skill 通过以下机制确保样式一致性：
1. **规范查询**：自动读取 `design-spec.md`
2. **模式复用**：优先使用现有组件样式
3. **变量驱动**：强制使用 CSS 变量而非硬编码
4. **自动维护**：开发后判断是否需要更新规范
5. **协作机制**：与 `project-codemap` 等 Skill 无缝配合

**核心理念**：
> 处理样式就是处理样式，与代码结构查询独立，但可以协作。

---

**Skill 定义结束**  
Version: 1.0.0  
Last Updated: 2026-06-23