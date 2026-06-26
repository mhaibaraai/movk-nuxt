[![Movk Nuxt](https://nuxt.mhaibaraai.cn/og-image.png)](https://nuxt.mhaibaraai.cn/)

English | [简体中文](./README.md)

> A UI engineering toolkit built on top of Nuxt UI — Schema-driven AutoForm (Zod v4), a full-featured DataTable, standalone components and Composables. Get the complete capability set in Nuxt 4, including API integration with authentication and progress tracking; its UI, forms, tables, and theming also work directly in plain Vue + Vite projects through a Vite plugin (the API integration domain is Nuxt-only).

[![Install MCP in Cursor](https://nuxt.mhaibaraai.cn/mcp/badge.svg)](https://nuxt.mhaibaraai.cn/mcp/deeplink)
[![Install MCP in VS Code](https://nuxt.mhaibaraai.cn/mcp/badge.svg?ide=vscode)](https://nuxt.mhaibaraai.cn/mcp/deeplink?ide=vscode)

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82.svg)](https://nuxt.com/)
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt UI][nuxt-ui-src]][nuxt-ui-href]

- 📖 [Online Documentation](https://nuxt.mhaibaraai.cn)

## ✨ Features

Movk Nuxt is a UI engineering toolkit built on top of Nuxt UI, offering two ways to use it: the complete capability set with API integration in **Nuxt 4**, or its UI layer in plain **Vue + Vite** projects through a **Vite plugin**. The supported frameworks for each capability are:

- **AutoForm — Schema-driven forms** (✅ Nuxt ｜ ✅ Vue + Vite) - Built on Zod v4 with a "define-is-render" model: a single Schema declares the data structure, validation rules, and UI configuration at once, automatically generating a complete form interface.
- **DataTable — Data table** (✅ Nuxt ｜ ✅ Vue + Vite) - Wraps TanStack Table, covering data columns, special columns (selection / index / expand / actions), tree-structured data, row interactions, appearance customization, pagination, and load-more.
- **Standalone component library** (✅ Nuxt ｜ ✅ Vue + Vite) - General-purpose UI components such as DatePicker, StarRating, PillGroup, SearchForm, Tree, WithCopy, and ThemePicker, usable on their own without AutoForm.
- **Theming and Composables** (✅ Nuxt ｜ ✅ Vue + Vite) - Non-server composition functions such as useTheme (theme read/write and export), useMessageBox (imperative dialogs), and useDateFormatter (i18n dates).
- **API integration system** (✅ Nuxt ｜ ❌ Vue + Vite) - The useApiFetch / useLazyApiFetch / useClientApiFetch trio plus useUploadWithProgress / useDownloadWithProgress, providing multi-endpoint support, automatic authentication, business status-code checks, data unwrapping, Toast notifications, and progress monitoring; **depends on the Nuxt server runtime and is available in Nuxt mode only**.
- **Type safety** - Full TypeScript type inference, from Schema to form data, with component prop callbacks and event handler types derivable via indexed access.
- **AI friendly** - Built-in MCP Server and llms.txt, so components, composables, and docs can be retrieved by AI agents.

## 🚀 Getting Started

### Installation

```bash
# pnpm
pnpm add @movk/nuxt @nuxt/ui zod

# yarn
yarn add @movk/nuxt @nuxt/ui zod

# npm
npm install @movk/nuxt @nuxt/ui zod
```

### Nuxt

Register the module in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@movk/nuxt'],
  movk: {
    prefix: 'M' // Component prefix, defaults to 'M'
  }
})
```

### Vue / Vite

In a plain Vue + Vite project, use the UI layer (components, theming, AutoForm, DataTable, non-server Composables) through the Vite plugin + Vue plugin. **The API integration domain is not available in this mode.**

```bash
pnpm add @movk/nuxt @nuxt/ui zod tailwindcss vue-router
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import movk from '@movk/nuxt/vite'

export default defineConfig({
  plugins: [vue(), movk()]
})
```

```ts
// src/main.ts
import './assets/css/main.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import movk from '@movk/nuxt/vue-plugin'
import App from './App.vue'

const router = createRouter({ routes: [], history: createWebHistory() })
createApp(App).use(router).use(movk).mount('#app')
```

```css
/* src/assets/css/main.css — chains Tailwind CSS + Nuxt UI + Movk theme */
@import "@movk/nuxt";
```

Wrap the root component in `<UApp>` (required for Toast / Tooltip / useMessageBox). See [Online Docs · Vue / Vite](https://nuxt.mhaibaraai.cn/docs/getting-started/vue).

### Basic Example

Create a simple user registration form:

```vue
<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()

// Define the Schema
const schema = afz.object({
  username: afz.string().min(3).meta({ label: 'Username' }),
  email: afz.email().meta({ label: 'Email' }),
  age: afz.number().min(18).meta({ label: 'Age' })
})

// Type inference
type Schema = z.output<typeof schema>

// Form state
const form = ref<Partial<Schema>>({})

// Submit handler
async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log('Submitted data:', event.data)
}
</script>

<template>
  <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
</template>
```

## 📦 Core Features

### Standalone Components

High-quality, ready-to-use UI components across four categories: input enhancements, forms, feedback, and advanced interactions.

### DataTable - Full-featured Data Table

`MDataTable`, wrapping TanStack Table, driven by declarative column configuration:

```ts
import type { DataTableColumn } from '@movk/nuxt'

const columns: DataTableColumn<Person>[] = [
  { type: 'selection' }, // Special column: row selection
  { accessorKey: 'name', header: 'Name', sortable: true, pinable: true },
  { accessorKey: 'salary', header: 'Salary', sortable: true, truncate: true },
  { type: 'actions', actions: row => [{ label: 'Edit', onClick: () => edit(row) }] }
]
```

Supports data columns (sorting / column pinning / column resize / truncate + Tooltip / visibility), special columns (selection / index / expand / actions / grouping), tree-structured data with cascading selection, row interactions (click / expand / context menu), appearance customization, client/server-side pagination, and load-more.

### AutoForm - Schema-driven Form System

A "define-is-render" form solution based on Zod Schemas:

```ts
const { afz } = useAutoForm()

const schema = afz.object({
  // Basic types
  username: afz.string().min(3),
  age: afz.number().min(18),
  isActive: afz.boolean(),

  // Advanced types
  email: afz.email(),
  birthdate: afz.calendarDate(),
  role: afz.enum(['admin', 'user']),
  avatar: afz.file(),

  // Nested objects
  profile: afz.object({
    bio: afz.string(),
    website: afz.url()
  }),

  // Arrays
  tags: afz.array(afz.string())
})
```

### Composables

#### useDateFormatter

A powerful tool for date formatting, parsing, and range handling:

```ts
const { format, parse, isDateValue, formatRange } = useDateFormatter()

// Format a date
const formatted = format(new Date(), 'iso') // "2024-01-01"

// Parse a date string
const date = parse('2024-01-01', 'iso')

// Format a date range
const range = formatRange({ start: date1, end: date2 }, 'iso')
```

#### useAutoForm

The core logic wrapper for AutoForm:

```ts
const { afz, defineControl, getAutoFormMetadata } = useAutoForm()

// Create a Schema
const schema = afz.object({
  username: afz.string()
})

// Define a custom control
const customControl = defineControl({
  component: MyCustomInput,
  controlProps: { class: 'w-full' }
})

// Get field metadata
const meta = getAutoFormMetadata(schema)
```

#### useApiFetch

An API request wrapper built on Nuxt's useFetch:

```ts
// Basic usage
const { data, pending, error } = await useApiFetch<User[]>('/users')

// POST request
const { data } = await useApiFetch<User>('/users', {
  method: 'POST',
  body: { name: 'test' },
  toast: { successMessage: 'Created successfully' }
})

// Use another endpoint
const { data } = await useApiFetch('/users', { endpoint: 'v2' })
```

#### useUploadWithProgress

File upload with progress monitoring:

```ts
const { progress, uploading, upload, abort } = useUploadWithProgress()

// Upload a file
await upload('/api/upload', file, {
  fieldName: 'avatar',
  onSuccess: (response) => console.log('Upload succeeded:', response)
})
```

#### useDownloadWithProgress

File download with progress monitoring:

```ts
const { progress, downloading, download, abort } = useDownloadWithProgress()

// Download a file
await download('/api/export/report', {
  filename: 'report.pdf',
  onSuccess: (filename) => console.log('Download complete:', filename)
})
```

## 🏗️ Architecture Layers

Movk Nuxt adopts a clear layered architecture:

- **Core Systems** - AutoForm (Schema-driven forms), DataTable (data table)
- **API System** - useApiFetch / useLazyApiFetch / useClientApiFetch, useUploadWithProgress, useDownloadWithProgress, providing a complete API request solution
- **Standalone Components** - Standalone UI components such as DatePicker, StarRating, PillGroup, SearchForm, Tree, WithCopy, and ThemePicker
- **Composables** - General-purpose composition functions such as useDateFormatter, useTheme, useMessageBox, and useAutoForm
- **Foundation** - Built on [Nuxt UI](https://ui.nuxt.com), [Zod v4](https://zod.dev), [VueUse](https://vueuse.org), and [TanStack Table](https://tanstack.com/table)

## ⚡ Tech Stack

- [Nuxt 4](https://nuxt.com/) - The Intuitive Vue Framework
- [Nuxt UI](https://ui.nuxt.com/) - A UI Library for Modern Web Apps
- [Zod v4](https://zod.dev/) - TypeScript-first schema validation
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [VueUse](https://vueuse.org/) - Collection of Vue Composition Utilities
- [Vitest](https://vitest.dev/) - Next Generation Testing Framework

## 📄 License

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
