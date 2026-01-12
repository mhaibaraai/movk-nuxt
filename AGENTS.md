# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## 项目概览

`@movk/nuxt` 是一个为 Nuxt 4 设计的模块化工程套件,提供 Schema 驱动的自动表单生成、API 集成系统、独立 UI 组件和通用工具函数。

核心特性:
- **Schema 驱动**: 基于 Zod v4 的声明式表单定义,一份 Schema 同时定义数据结构、验证规则和 UI 配置
- **自动化系统**: AutoForm 通过 Schema 自动生成完整表单界面,支持 15+ 种控件类型
- **API 集成**: 内置 useApiFetch、useApiAuth、useUploadWithProgress、useDownloadWithProgress,提供多端点支持、自动认证、业务状态码检查、Toast 提示和进度监控
- **模块化设计**: 采用分层架构,按需使用 UI 组件、工具函数或全套自动化系统
- **独立组件库**: 内置 DatePicker、StarRating、WithCopy 等 10+ 个通用 UI 组件
- **类型安全**: 完整的 TypeScript 类型推断,从 Schema 到表单数据

## 常用命令

### 开发相关

```bash
# 开发环境准备(首次运行或依赖更新后必须执行)
pnpm dev:prepare

# 启动 playground 开发服务器
pnpm dev

# 启动文档站点开发服务器
pnpm docs

# 构建 playground
pnpm dev:build

# 构建文档站点
pnpm docs:build
```

### 构建与发布

```bash
# 构建模块(生成 dist 目录)
pnpm build

# 发布新版本
pnpm release
```

### 代码质量

```bash
# 运行 ESLint 检查
pnpm lint

# 自动修复 ESLint 问题
pnpm lint:fix

# 类型检查(包含 playground 和 docs)
pnpm typecheck

# 运行所有测试(watch 模式)
pnpm test

# 运行单个测试文件
pnpm vitest test/composables/useDateFormatter.test.ts

# 运行测试并生成覆盖率报告
pnpm vitest --coverage
```

### 其他工具

```bash
# 更新依赖到最新主版本
pnpm up

# 清理构建产物和缓存
pnpm clean
```

## 架构设计

### 分层架构

项目采用三层架构设计:

1. **Core Systems** (`src/runtime/composables/useAutoForm.ts`)
   - `useAutoForm`: 核心 composable,提供 Schema 驱动的表单生成能力
   - `afz` (AutoFormZod): 增强的 Zod 工厂函数,支持元数据附加
   - 通过拦截 Zod 克隆方法实现元数据自动传递(应对 Zod v4 不可变设计)

2. **Standalone Components** (`src/runtime/components/`)
   - 独立 UI 组件: `DatePicker`、`ColorChooser`、`StarRating`
   - 输入增强组件: `WithClear`、`WithPasswordToggle`、`WithCopy`、`WithCharacterLimit`
   - 表单渲染器: `auto-form-renderer/` 目录下的内部组件

3. **API System** (`src/runtime/composables/`)
   - `useApiFetch`: 基于 Nuxt useFetch 封装的 API 请求 composable
   - `useClientApiFetch`: 仅客户端执行的 API 请求(设置 `server: false, lazy: true`)
   - `useApiAuth`: 与 nuxt-auth-utils 集成的认证管理
   - `useUploadWithProgress`: 带进度监控的文件上传 composable
   - `useDownloadWithProgress`: 带进度监控的文件下载 composable
   - `api.factory.ts`: API 客户端工厂插件,提供 `$api` 实例
   - 支持多端点、自动认证、业务状态码检查、Toast 提示、文件传输进度跟踪

4. **Utilities & Composables**
   - `useDateFormatter`: 日期格式化工具
   - `schema-introspector.ts`: Schema 内省与字段生成
   - `field-utils.ts`: 字段处理工具函数
   - `api-utils.ts`: API 响应处理工具
   - `reactive-utils.ts`: 响应式数据处理工具

### 关键设计模式

#### 元数据传递机制

Zod v4 采用不可变设计,每次链式调用都会返回新的 Schema 实例。为了在链式调用中保持元数据,使用了方法拦截模式:

```typescript
// src/runtime/composables/useAutoForm.ts:37-62
// interceptCloneMethods 拦截所有克隆方法,自动传递 customMeta
```

#### Schema 驱动控件映射

通过类型内省将 Zod Schema 映射到 UI 组件:

```typescript
// src/runtime/utils/schema-introspector.ts
// inferControlType() 根据 Zod Schema 类型推断对应的 UI 控件
// buildFields() 递归解析 Schema 生成表单字段配置
```

#### 组件自动注册

模块会自动注册所有 runtime components,并添加可配置的前缀(默认 `M`):

```typescript
// src/module.ts:54-59
addComponentsDir({
  path: resolve('runtime/components'),
  prefix: options.prefix, // 默认 'M'
  pathPrefix: false,
  ignore: ['auto-form-renderer/**'] // 渲染器组件仅供内部使用
})
```

#### API 模块架构

API 系统采用分层设计:

```
types/api.ts                       → 类型定义 (Interface)
schemas/api.ts                     → 配置验证 (Zod Schema)
plugins/api.factory.ts             → 客户端工厂 ($api 实例)
composables/useApiFetch.ts         → 请求封装 (SSR/CSR 通用)
composables/useClientApiFetch.ts   → 客户端专用请求封装
composables/useApiAuth.ts          → 认证管理
composables/useUploadWithProgress.ts   → 文件上传(带进度)
composables/useDownloadWithProgress.ts → 文件下载(带进度)
utils/api-utils.ts                 → 响应处理工具
server/api/_movk/                  → Session 管理 API
```

### 目录结构约定

```
src/
├── module.ts                  # Nuxt 模块入口
└── runtime/
    ├── components/            # 组件目录(自动注册,使用 prefix)
    │   ├── auto-form-renderer/  # 内部渲染器组件(不自动注册)
    │   ├── input/             # 输入增强组件
    │   └── *.vue              # 独立组件
    ├── composables/           # 自动导入的 composables
    ├── constants/             # 常量定义
    ├── internal/              # 内部使用的工具(provide/inject 等)
    ├── plugins/               # Nuxt 插件
    ├── schemas/               # Zod Schema 定义(配置验证)
    ├── server/                # 服务端 API 路由
    ├── types/                 # 类型定义
    └── utils/                 # 工具函数

playground/                    # 开发测试环境
docs/                          # 文档站点(基于 @movk/nuxt-docs)
test/                          # 测试文件
```

## 开发约定

### Zod v4 特定要求

- 使用 `import { z } from 'zod/v4'` 导入(非 `zod`)
- 优先使用新的验证函数: `z.email()` / `z.url()` / `z.uuid()`(代替 `.refine()`)
- 避免使用 `z.describe()`,改用 `z.meta({ description: '...' })`

### 组件开发规范

- 新增独立组件放在 `src/runtime/components/` 根目录
- 内部渲染组件放在 `auto-form-renderer/` 子目录
- 组件必须支持 `v-model` 或 `modelValue` prop
- 使用 `markRaw()` 包装组件引用以避免不必要的响应式转换

### 测试要求

- 新增 composable 必须添加单元测试到 `test/composables/`
- 使用 `@nuxt/test-utils` 进行 E2E 测试
- 测试文件使用 `.test.ts` 后缀

### 类型安全

- 所有公共 API 必须导出类型定义
- 使用 `z.input<>` / `z.output<>` 提取 Schema 类型
- 优先使用 `satisfies` 而非类型断言

## 特殊注意事项

### 模块依赖

本模块依赖以下 Nuxt 模块(会自动检查版本兼容性):
- `@nuxt/image` >= 2.0.0
- `@nuxt/ui` >= 4.2.1
- `@vueuse/nuxt` >= 14.0.0
- `nuxt-auth-utils` >= 0.5.0 (可选,用于 useApiAuth)
- `zod` >= 4.1.13 (peer dependency)
- `@movk/core` >= 1.0.2 (文件下载等工具函数)

确保 playground 和 docs 环境正确安装这些依赖。

### API 模块开发

#### 类型定义约定

- `types/api.ts`: TypeScript Interface,用于开发时类型提示
- `schemas/api.ts`: Zod Schema,用于运行时配置验证
- 两者独立维护,Schema 用于验证模块配置,Interface 用于 API 使用

#### JSDoc 注释规范

使用多行 `@defaultValue` 格式:

```typescript
/**
 * 字段描述
 * @defaultValue 'value'
 */
fieldName: string
```

#### 文件上传/下载功能

**useUploadWithProgress**:
- 基于原生 XMLHttpRequest 实现,支持实时进度监控
- 自动处理 FormData 构建和认证 Header
- 提供 `progress`(0-100)、`status`、`abort()` 等响应式状态
- 支持自定义字段名(默认 `file`)和额外表单字段

**useDownloadWithProgress**:
- 基于原生 fetch + ReadableStream 实现,支持实时进度和取消下载
- 自动从 Content-Disposition 提取文件名或使用自定义文件名
- 使用 `@movk/core` 的 `triggerDownload` 触发浏览器下载
- 提供 `progress`(0-100)、`status`、`abort()` 等响应式状态

**useClientApiFetch**:
- 仅客户端执行的 API 请求,设置 `server: false, lazy: true`
- 适合非 SEO 敏感数据,需手动调用 `execute()` 触发请求
- 常用于用户偏好设置、个人信息等客户端专属数据

### 文档站点配置

文档站点 (`docs/`) 扩展自 `@movk/nuxt-docs`,并注册了示例组件:

```typescript
// docs/nuxt.config.ts:9-13
// 自动注册 app/components/content/examples 为全局组件
```

在文档中使用示例组件时无需导入,直接在 MDC 中使用即可。

### 发布流程

使用 `release-it` 管理版本发布,配置文件为 `.release-it.json`:
- 自动生成 CHANGELOG
- 自动更新版本号
- 自动创建 Git tag
- 需要 npm 发布权限
