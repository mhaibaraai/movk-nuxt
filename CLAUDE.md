# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

`Movk Nuxt` 是一个为 Nuxt 4 设计的模块化工程套件，提供 Schema 驱动的自动表单生成、API 集成系统、独立 UI 组件和通用工具函数。基于 Nuxt UI、Zod v4 和 VueUse 构建。

要求 Node ^22.x || ^24.x，使用 pnpm 作为包管理器。

## 常用命令

```bash
# 必须：首次运行或依赖更新后执行（stub 模块、准备 playground + docs）
pnpm dev:prepare

# 开发
pnpm dev              # Playground 开发服务器
pnpm docs             # 文档站点开发服务器

# 构建
pnpm build            # 构建模块（生成 dist/）
pnpm dev:build        # 构建 playground
pnpm docs:build       # 构建文档

# 代码质量
pnpm lint             # ESLint 检查
pnpm lint:fix         # ESLint 自动修复
pnpm typecheck        # vue-tsc --noEmit + nuxt typecheck playground + nuxt typecheck docs
pnpm test             # Vitest（watch 模式）
pnpm vitest test/composables/useDateFormatter.test.ts   # 运行单个测试
pnpm vitest --coverage                                  # 覆盖率报告

# 维护
pnpm clean            # 清理构建产物和缓存
pnpm release          # release-it + npm publish
```

## 架构设计

### 模块入口

[module.ts](src/module.ts) — Nuxt 模块入口，关键行为：
- 注册 `#movk` 别名指向 `src/runtime/`
- 自动注册 `runtime/components/` 下的组件，使用可配置前缀（默认 `M`），忽略 `auto-form-renderer/**` 和 `theme-picker/ThemePickerButton.vue`
- 自动导入 `runtime/composables/` 下的所有 composables
- 条件启用 API 插件（`api.enabled !== false`）：将端点配置拆分为 public（客户端可访问）和 private（仅服务端 headers）通过 `runtimeConfig` 传递
- 通过 `src/theme.ts` 设置主题系统

### API 系统（核心架构）

API 系统是最复杂的子系统，理解以下模式至关重要：

**`$api` 实例**：类型为 `$Fetch & { use() }`，在 [api.factory.ts](src/runtime/plugins/api.factory.ts) 中通过 `Object.assign($fetchInstance, { use })` 创建。不是自定义包装类。每个端点拥有独立的 `$fetch.create()` 实例和拦截器，通过 `Map` 缓存。

**请求管线**（全部在 `$fetch.create()` 拦截器中实现）：
1. `onRequest` — 认证 token 注入（来自 `nuxt-auth-utils` 会话）、debug 日志、触发 `movk:api:request` hook
2. `onResponse` — 业务成功检查（`isBusinessSuccess`）、数据解包（`extractData`）、Toast 提示、触发 `movk:api:response` 或 `movk:api:error` hook。业务失败时：先显示错误 Toast 再抛出 `ApiError`
3. `onResponseError` — 处理 HTTP 错误。401 触发 `movk:api:unauthorized` hook（提供 `{ handled: boolean }` 逃逸机制），然后执行默认行为（清除会话 + 重定向）

**Context 传递模式**：Toast 和 skipBusinessCheck 选项通过 `ofetch` 的 `context` 字段传递（通过 `declare module 'ofetch'` 类型扩展）。composables 从 options 中提取 `{ toast, skipBusinessCheck }` 并作为 `context` 传给 `useFetch`/`$fetch`。

**Nuxt Hooks 扩展**（声明在 [types/module.ts](src/runtime/types/module.ts)）：
- `movk:api:request` — 认证注入后、发送前
- `movk:api:response` — 业务检查 + 数据解包后
- `movk:api:error` — 任何错误（业务错误或 HTTP 错误）
- `movk:api:unauthorized` — 仅 401，设置 `result.handled = true` 跳过默认行为

**API 文件映射**：

| 文件 | 职责 |
|------|------|
| `types/api.ts` | 全部 API 类型定义、`ofetch` 模块扩展 |
| `types/module.ts` | `NuxtApp.$api` 声明、Nuxt hook 扩展、runtimeConfig 类型 |
| `constants/api-defaults.ts` | response/auth/toast/endpoint 配置默认值 |
| `plugins/api.factory.ts` | 通过 `$fetch.create()` 创建 `$api`，含拦截器和端点缓存 |
| `composables/useApiFetch.ts` | 薄封装：注入 `$api` 到 `useFetch`，传递 context |
| `composables/useLazyApiFetch.ts` | 便捷封装：`useApiFetch` + `{ lazy: true }` |
| `composables/useClientApiFetch.ts` | 便捷封装：`useApiFetch` + `{ lazy: true, server: false }` |
| `composables/useUploadWithProgress.ts` | 基于 XHR 的文件上传（带进度），使用 `resolveEndpointConfig` |
| `composables/useDownloadWithProgress.ts` | 基于 fetch+ReadableStream 的下载（带进度），使用 `@movk/core` 的 `triggerDownload` |
| `utils/api-utils.ts` | 共享工具：认证头、Toast 显示、业务检查、端点解析 |

### AutoForm 系统

[useAutoForm.ts](src/runtime/composables/useAutoForm.ts) — 基于 Zod v4 的 Schema 驱动表单生成。

**元数据拦截机制**：Zod v4 不可变设计，每次链式调用返回新 schema。`interceptCloneMethods()` 包装所有克隆方法（`.optional()`、`.meta()` 等），自动将 `customMeta` 传播到新实例。这是使 `afz.string().meta({ label: '...' })` 在链式调用中工作的核心机制。

**Schema 内省**：[schema-introspector.ts](src/runtime/utils/schema-introspector.ts) — `inferControlType()` 将 Zod 类型映射到 UI 组件，`buildFields()` 递归解析 schema 生成字段配置。组件使用 `markRaw()` 包装以避免 Vue 响应式开销。

### 主题系统

[src/theme.ts](src/theme.ts) 设置 `appConfig.theme` 默认值（radius、font、icons）并注册主题插件。[useTheme](src/runtime/composables/useTheme.ts) composable 提供运行时主题访问。

### 目录结构

```text
src/
  module.ts                    # Nuxt 模块入口
  theme.ts                     # 主题设置（appConfig 默认值）
  runtime/
    components/                # 自动注册，使用前缀（默认 'M'）
      auto-form-renderer/      # 内部渲染器组件（不自动注册）
      input/                   # 输入增强包装器（WithClear、WithCopy 等）
      theme-picker/            # 主题选择器（ThemePickerButton 不自动注册）
    composables/               # 自动导入的 composables
    constants/                 # 配置默认值（api-defaults.ts、auto-form.ts）
    internal/                  # provide/inject 工具（useAutoFormProvider）
    plugins/                   # Nuxt 插件（api.factory.ts、theme.ts）
    types/                     # 类型定义（api.ts、module.ts、auto-form.ts、zod.d.ts）
    utils/                     # 工具函数

playground/                    # 开发测试环境
docs/                          # 文档站点（扩展自 @movk/nuxt-docs）
test/                          # 测试文件（test/composables/*.test.ts）
```

## 开发约定

### TypeScript 注意事项

- **类型扩展**：使用 `declare module 'nuxt/app'`（不是 `#app`）— `#app` 别名在 `vue-tsc` 类型检查时不可用
- **UseApiFetchOptions 泛型**：`<T, DataT = T>` 双泛型用于 transform 类型变换。默认参数必须使用 `= {} as UseApiFetchOptions<T, DataT>` 以满足 DataT 为泛型时的 TS 约束
- `retry` 不在我们的 API 配置类型中 — 用户通过 `$fetch`/`useFetch` 原生选项直接传递

### Zod v4

- 导入：`import { z } from 'zod'`
- 优先使用新验证器：`z.email()` / `z.url()` / `z.uuid()`（不用 `.refine()`）
- 使用 `z.meta({ description: '...' })` 代替 `z.describe()`
- 使用 `z.input<>` / `z.output<>` 提取类型

### 组件

- 独立组件放在 `src/runtime/components/` 根目录
- 内部渲染组件放在 `auto-form-renderer/` 子目录
- 必须支持 `v-model` / `modelValue`
- 使用 `markRaw()` 包装组件引用以避免响应式开销

### 测试

- Composable 单元测试放在 `test/composables/`
- 测试文件使用 `.test.ts` 后缀
- E2E 使用 `@nuxt/test-utils`

### ESLint

使用 `@nuxt/eslint-config/flat`，风格规则：`commaDangle: 'never'`、`braceStyle: '1tbs'`。允许 `no-explicit-any` 和 `ban-ts-comment`。

### JSDoc 注释规范

类型定义中使用多行 `@defaultValue` 格式：

```typescript
/**
 * 字段描述
 * @defaultValue 'value'
 */
fieldName: string
```

## 模块依赖

通过 module.ts 的 `moduleDependencies` 检查：

| 模块 | 最低版本 | 用途 |
|------|---------|------|
| `@nuxt/image` | >= 2.0.0 | 图片优化 |
| `@nuxt/ui` | >= 4.3.0 | UI 组件基础 |
| `@vueuse/nuxt` | >= 14.1.0 | Vue 组合式工具 |
| `nuxt-og-image` | >= 5.1.13 | OG 图片生成 |
| `nuxt-auth-utils` | >= 0.5.27 | 基于会话的认证 token + 401 处理 |

Peer 依赖：`@nuxt/ui >= 4.3.0`、`zod >= 4.3.5`

运行时依赖：`@movk/core`（工具函数：`getPath`、`extractFilename`、`triggerDownload`、`isObject` 等）

## 文档站点

扩展自 `@movk/nuxt-docs`。示例组件在 `docs/app/components/content/examples/` 下全局自动注册 — 在 MDC 中直接使用无需导入。

## 发布流程

使用 `release-it`（配置：`.release-it.json`）：自动生成 CHANGELOG、版本号更新、Git tag。需要 npm 发布权限。
