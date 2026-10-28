# AGENTS.md

This file provides guidance for AI coding agents working on this repository.

## 项目概述

`@movk/nuxt` 是 Nuxt 4 模块，四大能力域：AutoForm（Zod v4 Schema 驱动表单）、DataTable、API 集成（`useApiFetch` + 进度监控）、独立组件 + Composables。另提供 Vite/Vue 兼容层（`@movk/nuxt/vite` + `@movk/nuxt/vue-plugin`），**不含 API 域**。

- **peerDependencies**：`@nuxt/ui >=4.6.0`、`zod >=4.3.6`
- **moduleDependencies**（自动校验版本）：`@vueuse/nuxt >=14.2.1`、`@nuxt/image >=2.0.0`、`@nuxt/ui >=4.6.0`、`nuxt-site-config >=4.0.8`、`nuxt-auth-utils >=0.5.29`（仅 `api.auth.enabled` 且 `tokenSource: 'session'` 时登记，runtime 经 `#build/movk-session` 取 `useUserSession`）

## 常用命令

```bash
pnpm dev:prepare      # 开发前必须执行（stub + 类型 + vue playground 构建）
pnpm dev              # Nuxt playground（playgrounds/play）
pnpm dev:vue          # 纯 Vite + Vue playground（playgrounds/vue）
pnpm dev:vue:build
pnpm build
pnpm typecheck        # src + playgrounds/play + docs + playgrounds/vue
pnpm lint / pnpm lint:fix
pnpm test             # Vitest；单文件：pnpm test -- useDateFormatter
pnpm docs / pnpm docs:build   # docs:build 在 CI 拦截预渲染死链 [request error]
pnpm clean
```

修改 `src/` 后 playground 未热更新时，重跑 `pnpm dev:prepare`。

## 目录结构

| 路径 | 职责 |
| --- | --- |
| `src/module.ts` | 模块入口：依赖校验、API/主题初始化、注册组件与 composables、校验样式引入 |
| `src/templates.ts` | 虚拟模板 `getTemplates`，Nuxt 与 Vue 两模式共享 |
| `src/unplugin.ts` / `src/vite.ts` | Vue 模式 unplugin 工厂（链入 `@nuxt/ui` unplugin）/ Vite 入口 |
| `src/plugins/` | Vue 模式子插件：`environment`、`templates`、`app-config`、`font`、`plugins` |
| `src/runtime/components/` | 6 个主组件（AutoForm、DataTable、SearchForm、DatePicker、MessageBox、Tree）+ `theme-picker/` |
| `src/runtime/domains/` | 业务逻辑 + 私有子组件：`api/`、`auto-form/`、`data-table/`、`tree/`、`theme/` |
| `src/runtime/composables/` | `useApiFetch`/`useLazyApiFetch`/`useClientApiFetch`、`useAutoForm`、`useTheme`、`useDateFormatter`、`useMessageBox`、`useUploadWithProgress`/`useDownloadWithProgress` |
| `src/runtime/types/` | 按域聚合（`api/`、`auto-form/`、`components/`、`data-table/`、`shared`），各域 `index.ts` re-export |
| `src/runtime/utils/` | 运行时工具，含两模式共用的 `theme-defaults`、`tree-expand`/`tree-selection` |
| `src/runtime/vue/` | 非 Nuxt 桩层：`stubs/`（`#imports` 桩）、`composables/useSiteConfig`、`plugins/theme` |
| `src/theme/` | 主题配置，每组件一个文件，`index.ts` 聚合 |
| `src/utils/` | 构建期工具：`defaults`、`theme-variants`、`theme`、`css`、`icons` |
| `playgrounds/play/` · `playgrounds/vue/` | Nuxt playground（含 `server/api/` mock）· 纯 Vue playground |
| `docs/` | 文档站（`@movk/nuxt-docs` v3 Layer） |
| `test/` | Vitest：`composables/`、`domains/`、`plugins/`、`utils/`；`helpers/` 放测试替身 |

## 核心约定

- **分层**：业务逻辑落在 `runtime/domains/<域>`，对外组件保持薄壳；私有子组件放域内 `components/`。
- **runtime 不得 import 构建期 `src/utils/`**（不进 dist）；两模式共用纯函数放 `src/runtime/utils/`。
- **测试**：新增或修改 `runtime/domains`、`runtime/composables`、`runtime/utils` 逻辑须在 `test/` 补用例。
- **图标注入**：消费方扫描器扫不到 `node_modules`，故 `src/utils/icons.ts` 收集 `runtime/**` 的 `i-lucide-*`/`i-ph-*`/`i-tabler-*` 字面量。Nuxt 侧只走 `icon:clientBundleIcons` 钩子，**不得**写 `icon.clientBundle.icons`（缺失图标集会让消费方 build 报错）；Vue 侧只能用 `ui.icon.clientBundle.icons`，须先经 `filterResolvableIcons` 按项目根过滤。
- **样式入口**：`src/runtime/index.css` 是片段（不含 `@import "tailwindcss"`），由项目 CSS `@import "@movk/nuxt"`，模块不注册到 `nuxt.options.css`。全项目只能有一个 Tailwind 入口，否则会覆盖 `--font-sans` 等主题变量；漏引时 `src/utils/css.ts` 构建期告警。

## Vite/Vue 双模式

- **解析覆盖**：`MovkPlugin` 链入 `NuxtUIPlugin.raw()` 后先注册 movk 子插件，接管 `#imports`、`#components`（`U*` shim、`UIcon`/`Link` 用 `@nuxt/ui/runtime/vue/` 版）、`#build/app.config`（注入 `movk` 键）、`#build/movk-ui/*`（写盘供 Tailwind `@source` 扫描）。
- **判定归属**：依赖 Nuxt 服务端运行时（nitro、`useApiFetch*`、上传下载、`nuxt-auth-utils`）→ 仅 Nuxt，归 `domains/api/*`，**不得**纳入 `MOVK_COMPOSABLES` 与组件 glob；其余需双模式可用。
- **新增组件**：组件 glob 自动纳入。从 `#components` 引入新 `U*` → 补 `src/unplugin.ts` 的 `UI_COMPONENTS`；用到桩未导出的 `#imports` 符号 → 补 `src/runtime/vue/stubs/movk-extra.ts`。
- **新增 composable 或新增导出**：须在 `MOVK_COMPOSABLES` 显式登记文件及**全部公开导出**（含 re-export，如 `defineControl`/`CalendarDate`），Nuxt 侧自动可用，易漏 Vue 侧。
- **模板自动导入**：`autoImport.vueTemplate: true` 已开启，`<template>` 可直接用。
- **必验**：改动主题模板、`getDefaultConfig`、`MOVK_COMPOSABLES`、`UI_COMPONENTS`、stub 或组件结构后，同跑 `pnpm dev:prepare` 与 `pnpm dev:vue:build`。
- **reka-ui 版本锁定**：直接依赖须与 `@nuxt/ui` 内部版本完全一致，升级 `@nuxt/ui` 时同步；不一致会让 `pnpm build` 报 TS2883。
- **已知告警**：`DatePicker` 等透传 `CalendarProps` 的组件声明发射时有 TS2883 告警（reka-ui 未导出 `Matcher` 等），非致命，属上游限制。

## 类型与导入

- 优先使用官方类型替换自定义类型。
- prop 回调用索引访问派生，靠 contextual typing 推断参数：`const fn: DataTableDataColumn<T>['cell'] = ctx => ...`；事件处理用 `DataTableSelectHandler` / `DataTableHoverHandler` / `DataTableContextmenuHandler`。
- 无法派生的工具函数从 `@movk/nuxt` re-export。
- **类型导出最小必要**：内部合并产物（`ResolvedEndpointConfig`）、初始化校验类型（`MovkApiFullConfig`）、内部传值通道（`ApiFetchContext`）不得对外暴露；domain 纯函数默认不 re-export。

## 模块默认值

- `<UApp>` props 能配置的字段（如 `toaster.duration`）模块默认值保持空缺，仅注入模块专属值；构造 UI payload 时过滤 `undefined` 键。
- `moduleDependencies` 的 `defaults` 影响不到被依赖模块的依赖收集（如 `@nuxt/ui` 据 `nuxt.options.ui` 决定是否登记 `@nuxt/fonts`）。需要时写成函数形式，在返回前用 `??=` 直接写入 `nuxt.options.<key>`（见 `src/module.ts` 的 `ui.fonts`）。

## 文档站

`docs/` 继承 `@movk/nuxt-docs` v3，以 `../src/module` 加载本地源码。

- 中文 `content/docs`、英文 `content/en/docs`，路由前缀 `/docs`；`content/index.md`、`releases.yml` 在 `content/` 根。
- 导航与分类在 `app/app.config.ts` 声明，文案写成 `{ 'zh-CN': ..., 'en': ... }`，不覆盖 `useHeader`/`useCategory`。
- `i18n.locales` 不声明 `file`，站点翻译放 `i18n/locales/{code}.json`。
- 只覆盖 Layer 覆盖契约中的组件（`HeaderLogo`、`ComponentExampleExtras`）。
- `componentDocs: true` 已开启；Mermaid、`a11y` 未开启。环境变量模板见 `docs/.env.example`。

### 写作规范

- **frontmatter**：中文 `title`/`description`（简洁）+ 英文 `seo.title`/`seo.description`；组件页另加 `category`。
- **标题**：`## 用法`、`## 示例` 为 H2，条目为 H3。用法按 prop：`### \`size\` 尺寸`，首句「`prop` 作用：行为」；示例用场景名：`### 异步提交与校验`。
- **`::component-code`**：仅用于全部 props 可 YAML 内联的简单组件；标量不加引号（`size: md`），但 `options:`/`items:` 中的字符串离散值保留引号。多层级 props 加 `prettier: true`。
- **`::component-example`**：需脚本或 schema 驱动的组件（AutoForm 全家、`MSearchForm`）。示例放 `docs/app/components/content/examples/<scope>/`，命名 `<Scope><Component><Topic>Example.vue`；`options:`/`props:` 经 `defineProps` 注入，离散值用 `options:`（每项带 `items`，string items + `Number()`），schema/数组/自由文案保持静态。
- **转发事件**（如 `MSearchForm` 的 `@submit`）不进 `:component-emits` 自动表，须在 Emits 段手动补充。

## Playground 示例

`playgrounds/play/app/pages/**` 兼作 docs 素材，标杆：`data-table/columns.vue`、`data-table/tree.vue`。

- **title**：4–10 字中文名词/动宾短语，与 docs 段同名，不带英文注解或 prop 字面值（`函数式列配置`，非 `列排序 (sortable)`）。
- **description**：一句「通过哪些 prop/方法 → 预期行为」，句号收尾，并列用顿号，不写教程腔。
- 一个 Showcase 只演示一项能力，同主题页穷举所有公开 props/事件/方法/槽位；显式演示互斥、默认值、边界值；布尔/函数双形态 prop 两种都要演示；列级 vs 全局同名 prop 做反向对照。

## 文档同步面

新增 / 修改公开组件或功能后，同步以下各处，保持组件清单与措辞一致：

1. 组件文档 `docs/content/docs/2.components/<slug>.md`（用法、示例、API、必要 `::note`）
2. 示例组件 `docs/app/components/content/examples/<scope>/`
3. Playground `playgrounds/play/app/pages/**`
4. 站点介绍：根 `package.json` `keywords`、`docs/nuxt.config.ts` 的 `site.description`/`llms.*`、`README.md`、`docs/content/index.md`
5. 首页 `docs/app/components/Home.vue`（必要时）
6. skills `docs/skills/movk-nuxt/references/*.md`、必要时 `SKILL.md`
7. 本文件目录表（计数漂移时）
