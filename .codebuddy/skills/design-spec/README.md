# Design Spec Skill 使用指南

## 📦 已创建文件

```
/Users/yiche/Basics/blog/
├── design-spec.md (472 行)                    # 样式规范内容本体
└── .codebuddy/skills/
    ├── design-spec/
    │   └── SKILL.md (310 行)                  # Skill 工作流定义
    └── project-codemap/
        └── SKILL.md (已更新)                   # 添加了协作说明
```

---

## ✅ 方案已完整实施

### 1. 核心文件职责
- **`design-spec.md`**: 设计规范内容库
  - 颜色系统（CSS 变量完整映射）
  - 排版系统（字体、字号、行高）
  - 布局与间距（响应式断点、圆角体系）
  - 动效系统（时长、缓动函数、关键帧）
  - 公共组件库（article-card、pagination、navbar 等 7+ 组件）
  - Markdown 样式规范
  - 无障碍规范
  - **维护更新规则**（A/B/C 三级判断标准）

- **`.codebuddy/skills/design-spec/SKILL.md`**: Skill 执行逻辑
  - 5 阶段工作流（读取规范 → 开发 → 动效 → a11y → 更新判断）
  - 与 project-codemap 协作机制
  - 反模式示例（避免硬编码、保证一致性）
  - 输出格式规范

### 2. 架构特性
✅ **独立维护**：design-spec 与 project-codemap 解耦  
✅ **原子化职责**：处理样式就是处理样式，结构查询独立  
✅ **自动更新判断**：每次样式开发后自动评估是否需要同步规范  
✅ **弱依赖协作**：两个 Skill 可单独或组合加载

---

## 🚀 使用方式

### 场景 1：纯样式任务
```
用户："调整 article-card 的 hover 效果"

AI 自动：
1. 加载 design-spec Skill
2. 读取 design-spec.md 第 7.1 节
3. 输出符合规范的样式代码
4. 判断无需更新规范（C 级微调）
```

### 场景 2：结构 + 样式任务
```
用户："在首页新增一个文章搜索框"

AI 自动：
1. 同时加载 project-codemap + design-spec
2. project-codemap 定位首页文件位置
3. design-spec 提供搜索框样式规范
4. 输出完整组件代码
5. 判断是否更新 design-spec.md（新增公共组件 → A 级）
```

### 场景 3：查询设计规范
```
用户："项目的主色调是什么？"

AI 自动：
1. 加载 design-spec Skill
2. 读取 design-spec.md 第 3.1 节
3. 回答：玫瑰金 #E8A0BF (--accent-primary)
```

---

## 🔄 维护更新规则速查

| 级别 | 触发条件 | 是否更新规范 | 示例 |
|-----|---------|------------|------|
| **A 级** | 新增公共组件、修改 CSS 变量、改变暗色模式规则 | ✅ 必须更新 | 新增 SearchBar 组件 |
| **B 级** | 局部模式升格为通用规范（3+ 页面复用） | 🟡 建议更新 | 某个按钮样式开始广泛使用 |
| **C 级** | 单页面微调、bugfix、一次性样式 | ❌ 无需更新 | About 页面特殊布局 |

**核心原则**：
> 新增公共组件、修改全局视觉规则时，必须同步更新 `design-spec.md`；局部微调无需更新。

---

## 📚 规范文档目录（design-spec.md）

1. 技术栈与样式系统
2. 设计风格定位（Neo-futuristic Elegance）
3. **颜色系统**（CSS 变量完整映射）
4. **排版系统**（字体族、字号、行高）
5. **布局与间距**（响应式断点、圆角体系）
6. **动效系统**（时长、缓动、关键帧）
7. **公共组件库**（7+ 组件的样式规范）
   - article-card
   - pagination
   - navbar
   - theme-toggle
   - footer
   - TableOfContents
   - column-sidebar
8. Markdown 内容样式
9. 无障碍（a11y）
10. **维护更新规则**（A/B/C 三级标准）
11. 附录：快速查询表（CSS 变量速查、常用组合 Pattern）

---

## 🎯 与 project-codemap 协作边界

| Skill | 职责范围 | 典型任务 |
|-------|---------|---------|
| **project-codemap** | 项目结构、模块职责、文件定位 | "首页文件在哪？"<br>"数据怎么获取？" |
| **design-spec** | 样式规范、视觉设计、组件样式 | "按钮用什么颜色？"<br>"动画多长时间？" |

**协作示例**：  
任务："创建新的文章列表组件"
- project-codemap → 指出放在 `components/` 目录
- design-spec → 提供卡片样式、列表动画规范

---

## 🔍 快速检查 Skill 是否生效

运行以下命令验证文件存在：
```bash
ls -lh design-spec.md
ls -lh .codebuddy/skills/design-spec/SKILL.md
```

预期输出：
```
-rw-r--r--  1 user  staff   30K  design-spec.md
-rw-r--r--  1 user  staff   20K  .codebuddy/skills/design-spec/SKILL.md
```

---

## 📝 后续维护建议

### 1. 定期同步
- 每次新增公共组件后，立即更新 `design-spec.md` 第 7 节
- 每季度检查规范与实际代码一致性

### 2. 版本管理
- Patch (1.0.x)：修正错别字、补充示例
- Minor (1.x.0)：新增组件规范、新增样式 pattern
- Major (x.0.0)：设计语言重大变更（更换主色调、引入新 UI 库）

### 3. 自动化建议
- Git pre-commit hook：检测 `components/` 新增文件时提示更新规范
- CI 检查：验证 CSS 变量使用率（检测硬编码颜色）

---

## ✨ 核心优势

1. **AI 输出稳定**：每次样式开发都基于统一规范
2. **开发效率提升**：无需反复询问"用什么颜色"
3. **维护成本降低**：新人/AI 快速理解项目设计语言
4. **自动化维护**：Skill 自动判断是否需要更新规范
5. **解耦架构**：样式与结构独立，可灵活组合

---

**方案已完整落地！** 🎉

后续开发中，AI 会自动加载此 Skill 并遵循 `design-spec.md` 规范输出样式代码。
