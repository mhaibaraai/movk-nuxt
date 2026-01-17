[![Movk Nuxt](https://nuxt.mhaibaraai.cn/og-image.png)](https://nuxt.mhaibaraai.cn/)

> `@movk/nuxt` 是一个为 Nuxt 4 设计的模块化工程套件，提供 Schema 驱动的自动表单生成、API 集成系统、独立 UI 组件和通用工具函数。

[![Install MCP in Cursor](https://nuxt.mhaibaraai.cn/mcp/badge.svg)](https://nuxt.mhaibaraai.cn/mcp/deeplink)
[![Install MCP in VS Code](https://nuxt.mhaibaraai.cn/mcp/badge.svg?ide=vscode)](https://nuxt.mhaibaraai.cn/mcp/deeplink?ide=vscode)

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82.svg)](https://nuxt.com/)
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt UI][nuxt-ui-src]][nuxt-ui-href]

- 📖 [在线文档](https://nuxt.mhaibaraai.cn)

## ✨ 特性

- **Schema 驱动** - 基于 Zod v4 的声明式表单定义，一份 Schema 同时定义数据结构、验证规则和 UI 配置。
- **自动化系统** - AutoForm 通过 Schema 自动生成完整表单界面，支持 15+ 种控件类型。
- **API 集成** - 内置 useApiFetch、useApiAuth、useUploadWithProgress、useDownloadWithProgress，提供多端点支持、自动认证、业务状态码检查、Toast 提示和进度监控。
- **模块化设计** - 采用分层架构，按需使用 UI 组件、工具函数或全套自动化系统。
- **独立组件库** - 内置 DatePicker、StarRating、WithCopy 等 10+ 个通用 UI 组件。
- **类型安全** - 完整的 TypeScript 类型推断，从 Schema 到表单数据。
- **可扩展** - 支持自定义控件、布局系统、条件渲染等高级特性。

## 🚀 快速开始

### 安装

```bash
# pnpm
pnpm add @movk/nuxt @nuxt/ui zod

# yarn
yarn add @movk/nuxt @nuxt/ui zod

# npm
npm install @movk/nuxt @nuxt/ui zod
```

### 配置

在 `nuxt.config.ts` 中注册模块:

```ts
export default defineNuxtConfig({
  modules: ['@movk/nuxt']
})
```

可选配置项:

```ts
export default defineNuxtConfig({
  modules: ['@movk/nuxt'],
  movk: {
    prefix: 'M' // 组件前缀,默认为 'M'
  }
})
```

### 基础示例

创建一个简单的用户注册表单:

```vue
<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()

// 定义 Schema
const schema = afz.object({
  username: afz.string().min(3).meta({ label: '用户名' }),
  email: afz.email().meta({ label: '邮箱' }),
  age: afz.number().min(18).meta({ label: '年龄' })
})

// 类型推导
type Schema = z.output<typeof schema>

// 表单状态
const form = ref<Partial<Schema>>({})

// 提交处理
async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log('提交数据:', event.data)
}
</script>

<template>
  <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
</template>
```

## 📦 核心功能

### AutoForm - Schema 驱动的表单系统

基于 Zod Schema 的"定义即渲染"表单解决方案:

```ts
const { afz } = useAutoForm()

const schema = afz.object({
  // 基础类型
  username: afz.string().min(3),
  age: afz.number().min(18),
  isActive: afz.boolean(),

  // 高级类型
  email: afz.email(),
  birthdate: afz.calendarDate(),
  role: afz.enum(['admin', 'user']),
  avatar: afz.file(),

  // 嵌套对象
  profile: afz.object({
    bio: afz.string(),
    website: afz.url()
  }),

  // 数组
  tags: afz.array(afz.string())
})
```

**支持的控件类型**:
- 基础输入: `UInput`、`UInputNumber`、`UCheckbox`、`USwitch`
- 选择器: `USelect`、`USelectMenu`、`URadioGroup`、`UCheckboxGroup`
- 高级输入: `UTextarea`、`USlider`、`UPinInput`、`UInputTags`
- 自定义组件: `DatePicker`、`ColorChooser`、`StarRating`
- 文件上传: `UFileUpload`
- 增强输入: `WithCopy`、`WithClear`、`WithPasswordToggle`、`WithCharacterLimit`

### 独立组件

无需依赖 AutoForm,可直接使用的高质量 UI 组件:

#### 日期选择器

```vue
<template>
  <MDatePicker v-model="selectedDate" label-format="iso" />
</template>
```

#### 输入增强组件

```vue
<template>
  <!-- 带复制功能 -->
  <MWithCopy v-model="apiKey" />

  <!-- 带清除按钮 -->
  <MWithClear v-model="searchText" />

  <!-- 密码显隐切换 -->
  <MWithPasswordToggle v-model="password" />

  <!-- 字符数限制 -->
  <MWithCharacterLimit v-model="bio" :max-length="200" />
</template>
```

#### 交互组件

```vue
<template>
  <!-- 星级评分 -->
  <MStarRating v-model="rating" :max="5" />

  <!-- 颜色选择器 -->
  <MColorChooser v-model="color" />
</template>
```

### Composables

#### useDateFormatter

强大的日期格式化、解析、范围处理工具:

```ts
const { format, parse, isDateValue, formatRange } = useDateFormatter()

// 格式化日期
const formatted = format(new Date(), 'iso') // "2024-01-01"

// 解析日期字符串
const date = parse('2024-01-01', 'iso')

// 格式化日期范围
const range = formatRange({ start: date1, end: date2 }, 'iso')
```

#### useAutoForm

AutoForm 的核心逻辑封装:

```ts
const { afz, defineControl, getAutoFormMetadata } = useAutoForm()

// 创建 Schema
const schema = afz.object({
  username: afz.string()
})

// 定义自定义控件
const customControl = defineControl({
  component: MyCustomInput,
  controlProps: { class: 'w-full' }
})

// 获取字段元数据
const meta = getAutoFormMetadata(schema)
```

#### useApiFetch

基于 Nuxt useFetch 封装的 API 请求：

```ts
// 基础用法
const { data, pending, error } = await useApiFetch<User[]>('/users')

// POST 请求
const { data } = await useApiFetch<User>('/users', {
  method: 'POST',
  body: { name: 'test' },
  toast: { successMessage: '创建成功' }
})

// 使用其他端点
const { data } = await useApiFetch('/users', { endpoint: 'v2' })
```

#### useApiAuth

与 nuxt-auth-utils 集成的认证管理：

```ts
const { login, clear, loggedIn, user } = useApiAuth()

// 登录
await login({
  loginPath: '/auth/login',
  credentials: { username: 'admin', password: '123456' },
  userInfoPath: '/auth/me' // 可选，登录后获取用户信息
})

// 登出
await clear()

// 响应式状态
if (loggedIn.value) {
  console.log('当前用户:', user.value)
}
```

#### useUploadWithProgress

带进度监控的文件上传：

```ts
const { progress, uploading, upload, abort } = useUploadWithProgress()

// 上传文件
await upload('/api/upload', file, {
  fieldName: 'avatar',
  onSuccess: (response) => console.log('上传成功:', response)
})
```

#### useDownloadWithProgress

带进度监控的文件下载：

```ts
const { progress, downloading, download, abort } = useDownloadWithProgress()

// 下载文件
await download('/api/export/report', {
  filename: 'report.pdf',
  onSuccess: (filename) => console.log('下载完成:', filename)
})
```

## 🏗️ 架构分层

Movk Nuxt 采用清晰的分层架构:

- **Core Systems** - AutoForm(已发布)
- **API System** - useApiFetch、useApiAuth,提供完整的 API 请求和认证方案
- **Standalone Components** - DatePicker、StarRating、WithCopy 等独立 UI 组件
- **Composables** - useDateFormatter、useAutoForm 等通用组合式函数
- **Foundation** - 基于 [Nuxt UI](https://ui.nuxt.com)、[Zod v4](https://zod.dev)、[VueUse](https://vueuse.org)

## ⚡ 技术栈

- [Nuxt 4](https://nuxt.com/) - The Intuitive Vue Framework
- [Nuxt UI](https://ui.nuxt.com/) - A UI Library for Modern Web Apps
- [Zod v4](https://zod.dev/) - TypeScript-first schema validation
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [VueUse](https://vueuse.org/) - Collection of Vue Composition Utilities
- [Vitest](https://vitest.dev/) - Next Generation Testing Framework

## 🗺️ 开发路线图

- ✅ **AutoForm** - Schema 驱动的表单系统（已发布）
- ✅ **API System** - API 请求封装和认证管理（已发布）
  - useApiFetch、useClientApiFetch - API 请求
  - useApiAuth - 认证管理
  - useUploadWithProgress、useDownloadWithProgress - 进度监控
- ✅ **独立组件库** - DatePicker、StarRating、WithCopy 等组件（已发布）

## 📄 许可证

[MIT](./LICENSE) License © 2024-PRESENT [YiXuan](https://github.com/mhaibaraai)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@movk/nuxt?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@movk/nuxt

[npm-downloads-src]: https://img.shields.io/npm/dm/@movk/nuxt?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@movk/nuxt

[license-src]: https://img.shields.io/github/license/mhaibaraai/movk-nuxt.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/mhaibaraai/movk-nuxt/blob/main/LICENSE

[nuxt-ui-src]: https://img.shields.io/badge/Nuxt%20UI-4-00DC82?style=flat&colorA=080f12
[nuxt-ui-href]: https://ui.nuxt.com
