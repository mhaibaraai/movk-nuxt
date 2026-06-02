# AGENTS.md

This file provides guidance for AI coding agents working on this repository.

## 项目概述

`@movk/nuxt` 是一个 Nuxt 4 模块，提供 Schema 驱动的 AutoForm（基于 Zod v4）、API 集成系统（useApiFetch + 进度监控）、独立 UI 组件和通用 Composables。四大能力域：AutoForm（表单）、DataTable（表格）、API 集成、独立组件 + Composables。

**peerDependencies**：`@nuxt/ui >=4.6.0`、`zod >=4.3.6`

**moduleDependencies**（模块会自动校验版本）：

| 模块 | 最低版本 |
| --- | --- |
| `@vueuse/nuxt` | >=14.2.1 |
| `@nuxt/image` | >=2.0.0 |
| `@nuxt/ui` | >=4.6.0 |
| `nuxt-auth-utils` | >=0.5.29 |
| `nuxt-site-config` | >=4.0.8 |

## 常用命令

```bash
# 开发前必须先执行（生成 stub 和类型）
pnpm dev:prepare

# 启动默认 playground（playgrounds/play）
pnpm dev

# 构建模块
pnpm build

# 类型检查（覆盖 src + playgrounds/play + docs）
pnpm typecheck

# Lint
pnpm lint
pnpm lint:fix

# 单元测试（Vitest）
pnpm test

# 运行单个测试文件
pnpm test -- useDateFormatter

# 启动文档站
pnpm docs

# 清理构建产物
pnpm clean
```

## 目录结构与架构

| 路径 | 职责 |
| --- | --- |
| `src/module.ts` | 模块入口：moduleDependencies 版本校验、API/主题初始化、注册组件与 composables |
| `src/templates.ts` | Nuxt 虚拟模板生成 |
| `src/runtime/components/` | 对外组件：10 个主组件（AutoForm、DataTable、SearchForm、DatePicker、ColorChooser、MessageBox、PillGroup、Popconfirm、StarRating、SlideVerify）+ `input/` 6 个输入增强 + `theme-picker/` |
| `src/runtime/domains/` | 业务逻辑层 + 私有子组件，按域划分：`api/`（拦截器、端点、错误、传输）、`auto-form/`（字段、控件、Schema 解析）、`data-table/`（列解析、特殊列、树选择）、`theme/` |
| `src/runtime/composables/` | 10 个：`useApiFetch` / `useLazyApiFetch` / `useClientApiFetch`、`useAutoForm`、`useTheme`、`useDateFormatter`、`useMessageBox`、`useUploadWithProgress` / `useDownloadWithProgress` |
| `src/runtime/types/` | 类型来源，按域聚合：`api/`、`auto-form/`、`components/`、`data-table/`、`shared`，每域 `index.ts` 统一 re-export |
| `src/runtime/utils/` | 运行时工具：`meta`、`form-control`、`tv`、`extend-theme` |
| `src/theme/` | 主题配置，每组件/功能一个文件（约 22 个），`index.ts` 聚合 |
| `src/utils/` | 模块构建期工具：`defaults`、`theme-variants`、`theme` |
| `playgrounds/play/` | 唯一 playground，含 `app/pages/` 演示页与 `server/api/` mock |
| `docs/` | 文档站：`content/` 文档、`app/components/content/examples/` 示例组件、`server/mcp/` MCP Server、`skills/` |
| `test/` | Vitest 用例：`composables/`、`domains/api/`、`domains/auto-form/`、`utils/` |

**核心约定**：业务逻辑落在 `runtime/domains/<域>`，对外组件保持薄壳；私有子组件放在对应域的 `components/` 下，不进入 `runtime/components/`。

## 开发工作流

- 修改 `src/` 后，如果 playground 未热更新，需重新执行 `pnpm dev:prepare`。
- `pnpm typecheck` 实际执行 `vue-tsc --noEmit && nuxt typecheck playgrounds/play && nuxt typecheck docs`，覆盖 src + 一个 playground + docs。
- 测试用 Vitest，`pnpm test -- <file>` 跑单文件；新增或修改 `runtime/domains`、`runtime/composables`、`runtime/utils` 逻辑须在 `test/` 下补对应用例。

## 类型与导入约定

- 类型来源，优先使用官方类型替换自定义类型
- prop 回调用索引访问派生，参数靠 contextual typing 推断：`const fn: DataTableDataColumn<T>['cell' | 'truncate' | 'tooltip'] = ctx => ...`、`DataTableProps<T>['sortable' | 'pinable' | 'resizable']` 同理
- 事件处理用 `DataTableSelectHandler` / `DataTableHoverHandler` / `DataTableContextmenuHandler`
- 独立工具函数等无法派生的场景，从 `@movk/nuxt` re-export
- **类型导出最小必要**：内部合并产物（如 `ResolvedEndpointConfig`）、初始化校验类型（如 `MovkApiFullConfig`）、拦截器/插件内部传值通道（如 `ApiFetchContext`）不得经 `runtime/types/*/index.ts` 暴露到 `@movk/nuxt`；仅导出消费者真实需要的配置、入参、返回值、错误类型。domain 纯函数默认不 re-export。

## 模块默认值与全局配置同步

- **模块默认值不得覆盖 Nuxt UI 全局配置**：凡 `<UApp>` props 能配置的字段（如 `toaster.duration`），模块默认值保持空缺，仅注入模块语义专属值。
- 对外触发 UI 组件的 payload 构造需过滤 `undefined` 键，避免显式传入 `undefined` 干扰 Nuxt UI 的全局回退。
- 新增模块默认配置时，先核对 `<UApp>` props 是否已提供相同字段，命中即按本原则保留模块专属、删除可继承。

## Playground 示例规范

`playgrounds/play/app/pages/**/*.vue` 同时承担「人工演示 + docs 素材」双重职责，标杆：`data-table/columns.vue`、`data-table/tree.vue`。

- **title**：4–10 字中文名词/动宾短语，无英文括号注解、无 prop 字面值；与未来 docs H2 段同形对应（如 `基础用法`、`函数式列配置`，而非 `列排序 (sortable)`）
- **description**：一句话「通过哪些 prop/方法 → 预期行为」，中文句号收尾；prop/事件/方法名半角且不加引号；并列用顿号；不写 `X: true 开启、false 关闭` 这类教程腔
- **一个 Showcase 只演示一项能力**，宁可多段也不漏；同主题页须穷举该主题下所有公开 props/事件/方法/槽位
- 互斥关系、默认值、边界值要显式演示；列级 vs 全局同名 prop 用「全开 + 个别关」或反向对照，不要同向重复
- 同时支持布尔/函数形态的 prop（`sortable` / `pinable` / `truncate` 等）两种形态都要有 Showcase
- 抽离到 docs 的示例组件放 `docs/app/components/content/examples/<scope>/`，命名 `<Scope><Component><Topic>Example.vue`；新增 playground 段前先想「docs 这节叫什么」反推 title

## 写作规范

- **每篇 md 的 frontmatter 统一格式**：简洁中文 `title`/`description` + 英文 `seo:` 块（`seo.title`、`seo.description` 用英文，供 SEO/多语言索引）。示例：
  ```yaml
  ---
  title: 安装
  description: 通过官方项目模板一键创建完整文档站点。
  seo:
    title: Installation
    description: Create a Movk Nuxt Docs site with the official templates or integrate the Nuxt layer into an existing project using npm, pnpm, yarn, or bun.
  ---
  ```
  中文 title/description 保持简洁（title 名词/动宾短语，description 一句话）；组件页另加 `category` 字段。此约定适用于所有内容阶段。

- **`::component-code` 与 `::component-example` 的取舍**：按「示例能否用内联 props 表达」选择，而非按用法 / 示例区段。
  - `::component-code`：由 `props`/`model`/`external` 内联合成代码，仅适用于全部 props 可用 YAML 内联表达的简单组件（如 `MStarRating`、`MSlideVerify`）。
  - `::component-example`：加载并展示外部 `.vue` 源码，适用于需脚本构建或 schema 驱动的组件（如 AutoForm 全家、`MSearchForm`，Zod schema 无法内联）；外部文件置于 `docs/app/components/content/examples/<scope>/`，命名 `<Scope><Component><Topic>Example.vue`。
  - 两类块在「用法」「示例」区段均可出现；schema 驱动组件全程使用 `::component-example`。
- **标题层级**：`## 用法` 与 `## 示例` 均为 H2，其下条目统一用 H3。
  - 用法条目按 prop 命名，格式 `### \`prop\` 中文名`（如 `### \`size\` 尺寸`），逐项列举公开 props，首段一句「`prop` 作用：行为」。
  - 示例条目用描述性短语，格式 `### 场景名`（如 `### 异步提交与校验`）。
- **交互演示（`options:`）**：`::component-example` 的 `options:`/`props:` 会作为 props 注入外部示例组件，示例 `.vue` 用 `defineProps` 接收并绑定到目标组件。离散值 prop 优先用 `options:`（每项须带 `items`）做实时下拉，沿用「string items + `Number()`」模式；schema、数组、断点对象、自由文案保持静态。
- **转发事件**：底层组件转发的事件（如 `MSearchForm` 转发 `UForm` 的 `@submit`）不会进入 `:component-emits` 自动表，需在 Emits 段手动补说明。
- **`prettier: true`**：props 含多层级结构时添加。
- **内联标量不加引号**：`::component-code` 的 `props:` 标量值直接写（`size: md`，而非 `size: 'md'`）；但 `options:`/`items:` 中须保持字符串类型的离散值（如 cols `'1'`–`'4'`）仍加引号。

## 增强、重构规范

- 默认不需要考虑兼容性，除非用户明确要求
