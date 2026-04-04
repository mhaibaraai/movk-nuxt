# AGENTS.md

This file provides guidance for AI coding agents working on this repository.

## 项目概述

`@movk/nuxt` 是一个 Nuxt 4 模块，提供 Schema 驱动的 AutoForm（基于 Zod v4）、API 集成系统（useApiFetch + 进度监控）、独立 UI 组件和通用 Composables。

**peerDependencies**：`@nuxt/ui >=4.6.0`、`zod >=4.3.6`

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

**环境变量**：dashboard playground 通过 `NUXT_PUBLIC_API_BASE` 覆盖 API 基础路径（默认 `/api`）。

## 仓库结构

```
src/
  module.ts              # 模块入口，defineNuxtModule + 配置处理
  theme.ts               # 主题初始化（appConfig.theme/ui 默认值 + theme plugin）
  fonts.ts               # 字体配置（Alibaba PuHuiTi CDN 注入）
  runtime/
    types/               # 所有类型定义（api.ts、auto-form.ts、module.ts、theme.ts）
    constants/           # 运行时常量（api-defaults.ts、auto-form.ts、grid-cols.ts）
    plugins/
      api.factory.ts     # $fetch.create() 多端点实例，含认证/业务检查/Toast 拦截器
      theme.ts           # 主题 plugin（运行时读取 appConfig.theme）
    composables/         # 自动导入的 composables（useApiFetch、useAutoForm 等）
    components/
      auto-form-renderer/ # AutoForm 内部渲染器（被 ignore 不注册为全局组件）
      input/             # 输入增强组件（WithCopy、WithClear 等）
      theme-picker/      # ThemePicker 组件
      AutoForm.vue、DatePicker.vue、StarRating.vue 等独立组件
    utils/
      api-utils.ts       # API 工具函数（认证头、Toast、业务检查、数据解包）
      auto-form.ts       # AutoForm 工具函数
      schema-introspector.ts  # Zod Schema 解析
playgrounds/
  play/                  # 基础功能验证 playground
  dashboard/             # 完整应用场景 playground（含系统管理模块）
docs/                    # 文档站（Nuxt Content）
test/                    # Vitest 单元测试
```

## 关键架构

### 模块初始化流程（`src/module.ts`）

1. `setupTheme()` — 设置 `appConfig.theme` 默认值，注册 theme plugin
2. `setupFonts()` — 按配置注入字体 CSS
3. 注册 `#movk` 别名指向 `src/runtime/`（内部代码用 `#movk/types`、`#movk/utils` 等路径引用，避免相对路径嵌套）
4. `addComponentsDir()` — 以 `options.prefix`（默认 `M`）为前缀注册组件，`auto-form-renderer/**` 除外
5. `addImportsDir()` — 自动导入 `runtime/composables/`
6. 构建 API 运行时配置，将私有字段（`headers`）拆分到 `runtimeConfig.movkApi`，公共字段到 `runtimeConfig.public.movkApi`

### API 系统

`$api` 类型为 `$Fetch & { use(endpoint: string): ApiInstance }`，通过 `Object.assign($fetchInstance, { use })` 构造，**不是**自定义类包装。

核心逻辑在 `api.factory.ts` 的 `$fetch.create()` 拦截器中：
- `onRequest`：注入认证头（读取 `useUserSession()`）
- `onResponse`：业务状态码检查 + 数据解包（`response.data = extractData(data)`）+ 成功 Toast
- `onResponseError`：HTTP 错误处理 + 错误 Toast + 401 自动处理（清除 session + 跳转登录）

`useApiFetch` 是薄封装，通过 `$fetch` 选项注入 `$api`，通过 `context` 选项传递 `toast`/`skipBusinessCheck`。

**Nuxt hooks 扩展点**（在 `nuxt/app` 的 `RuntimeNuxtHooks` 中声明）：
- `movk:api:request` — 请求发送前（认证注入后），可附加自定义 headers
- `movk:api:response` — 响应成功后（业务检查 + 解包后），可读取解包后的数据
- `movk:api:error` — 任何错误（业务错误 + HTTP 错误）
- `movk:api:unauthorized` — 401 专用，`result.handled = true` 可跳过默认重定向行为

### AutoForm 系统

`useAutoForm()` 返回 `afz`（扩展 Zod 实例，支持 `.meta()` 链式调用）。`afz.object({...})` 定义的 Schema 携带 UI 元数据，`AutoForm.vue` 通过 `schema-introspector.ts` 解析字段类型并渲染对应控件。

### 主题系统

`appConfig.theme` 包含 `radius`、`blackAsPrimary`、`font`、`icons`。`ThemePicker` 组件和 `useTheme()` composable 在运行时读写这些配置。

## TypeScript 注意事项

- 类型扩展使用 `declare module 'nuxt/app'`（不是 `#app`，`vue-tsc` 中 `#app` 别名不可用）
- `useApiFetch<T, DataT>` 双泛型：`T` 是业务数据类型，`DataT` 是 transform 后的类型
- 默认参数需写 `= {} as UseApiFetchOptions<T, DataT>` 以满足泛型约束
