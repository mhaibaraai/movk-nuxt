# AGENTS.md

This file provides guidance for AI coding agents working on this repository.

## 项目概述

`@movk/nuxt` 是一个 Nuxt 4 模块，提供 Schema 驱动的 AutoForm（基于 Zod v4）、API 集成系统（useApiFetch + 进度监控）、独立 UI 组件和通用 Composables。

**peerDependencies**：`@nuxt/ui >=4.6.0`、`zod >=4.3.6`

**moduleDependencies**（模块会自动校验版本）：

| 模块 | 最低版本 |
| --- | --- |
| `@vueuse/nuxt` | >=14.2.1 |
| `@nuxt/image` | >=2.0.0 |
| `@nuxt/ui` | >=4.6.0 |
| `nuxt-auth-utils` | >=0.5.29 |

## 常用命令

```bash
# 开发前必须先执行（生成 stub 和类型）
pnpm dev:prepare

# 启动默认 playground
pnpm dev

# 启动 dashboard playground
pnpm dev:dashboard

# 构建模块
pnpm build

# 类型检查（覆盖 src + 两个 playground + docs）
pnpm typecheck

# Lint
pnpm lint
pnpm lint:fix

# 单元测试
pnpm test

# 运行单个测试文件
pnpm test -- useDateFormatter

# 启动文档站
pnpm docs

# 清理构建产物
pnpm clean
```

**重要**：修改 `src/` 后，如果 playground 未热更新，需重新执行 `pnpm dev:prepare`。

## Playground 示例规范

`playgrounds/play/app/pages/**/*.vue` 同时承担「人工演示 + docs 素材」双重职责，标杆：`data-table/columns.vue`、`data-table/tree-and-style.vue`。

- **title**：4–10 字中文名词/动宾短语，无英文括号注解、无 prop 字面值；与未来 docs H2 段同形对应（如 `基础用法`、`函数式列配置`，而非 `列排序 (sortable)`）
- **description**：一句话「通过哪些 prop/方法 → 预期行为」，中文句号收尾；prop/事件/方法名半角且不加引号；并列用顿号；不写 `X: true 开启、false 关闭` 这类教程腔
- **一个 Showcase 只演示一项能力**，宁可多段也不漏；同主题页须穷举该主题下所有公开 props/事件/方法/槽位
- 互斥关系、默认值、边界值要显式演示；列级 vs 全局同名 prop 用「全开 + 个别关」或反向对照，不要同向重复
- 同时支持布尔/函数形态的 prop（`sortable` / `pinable` / `truncate` 等）两种形态都要有 Showcase
- 抽离到 docs 的示例组件放 `docs/app/components/content/examples/<scope>/`，命名 `<Scope><Component><Topic>Example.vue`；新增 playground 段前先想「docs 这节叫什么」反推 title

## 类型与导入约定

业务侧代码禁止直接 import `@tanstack/vue-table`，类型统一从 `@movk/nuxt` 取：

- prop 回调用索引访问派生，参数靠 contextual typing 推断：`const fn: DataTableDataColumn<T>['cell' | 'truncate' | 'tooltip'] = ctx => ...`、`DataTableProps<T>['sortable' | 'pinable' | 'resizable']` 同理
- 事件处理用 `DataTableSelectHandler` / `HoverHandler` / `ContextmenuHandler` / `StateChangeHandler`
- 独立工具函数等无法派生的场景，从 `@movk/nuxt` re-export 取 `Row` / `Table` / `TableMeta` / `TableState` / `Updater` / `ColumnDef`
- `CellContext` 不 re-export，强制走派生
