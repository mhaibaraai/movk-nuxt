---
name: movk-nuxt
description: Build with the Movk Nuxt (@movk/nuxt) module — Schema-driven AutoForm (Zod v4), an API integration system (useApiFetch + upload/download progress), standalone M-prefixed UI components, the MDataTable grid, and utility composables (date formatting, theming, message boxes). Works as a Nuxt module and in plain Vue + Vite (via @movk/nuxt/vite + @movk/nuxt/vue-plugin) for UI, forms, tables and theming; the API domain is Nuxt-only. Use when generating forms, fetching data, rendering tables, adding UI controls, or calling Movk Nuxt composables.
---

# Movk Nuxt

`@movk/nuxt` is a Nuxt 4 module providing four capability domains on top of Nuxt UI: a Schema-driven **AutoForm** (Zod v4), an **API** integration system (`useApiFetch` + progress upload/download), standalone **components** (the `M` prefix), the **MDataTable** grid, and general-purpose **composables**.

## MCP Server

The `@movk/nuxt` MCP server serves live component metadata, API docs, and real code examples. If not already configured, add it:

```bash
claude mcp add --transport http movk-nuxt https://nuxt.mhaibaraai.cn/mcp
```

Key MCP tools:
- `search-documentation` — full-text search across all Movk Nuxt docs (no params = list all pages)
- `search-composables` — find composables by name or description (no params = list all)
- `search-icons` — search Iconify icons (defaults to `lucide`), returns `i-{prefix}-{name}` names
- `get-component` — full component documentation with usage examples
- `get-component-metadata` — props, slots, events (lightweight, no docs content)
- `get-documentation-page` — full doc page by path (supports a `sections` arg to trim)
- `get-example` — real-world code examples
- `list-examples` — enumerate available examples
- `list-components` — list all components with category and basic info
- `list-api` — list API system docs (plugin, hooks, composables)
- `list-data-table` — list DataTable doc pages (data/special columns, tree, row behavior, appearance, pagination, load more, API)
- `search-components-by-category` — search components by category or text
- `search-auto-form-by-category` — search AutoForm docs by category or text
- `search-data-table-by-category` — search DataTable doc pages by keyword
- `search-api-by-category` — search API system docs by category or text

Prompts:
- `find-component-for-usecase` — guided selection of the best component for a use case (covers standalone widgets and DataTable)
- `find-autoform-solution` — guided selection of AutoForm field types, config, and customization for a form requirement
- `implement-component-with-props` — guided implementation of a component given a set of target props

When you need to know **what a component accepts** or **how its API works**, use the MCP. This skill teaches you **when to use which component** and **how to build well**.

## Core rules (always apply)

1. **`M` prefix** — The prefix is configurable via `movk.prefix` (default `M`).
2. **Configure module-wide behavior in `nuxt.config.ts` under `movk.*`** — `movk.api.endpoints / successCodes / dataKey / sessionTokenPath` for API behavior, `movk.autoForm` for global field meta, `movk.prefix` for component prefix. Override per-call (`{ endpoint, toast, skipUnwrap, skipBusinessCheck }`) only when the change is truly local.
3. **Use `useApiFetch`, never raw `$fetch`** — fetch data with `useApiFetch` / `useLazyApiFetch` / `useClientApiFetch`; call imperatively via `const { $api } = useNuxtApp()` and `$api.use('endpoint')` to switch endpoints. The wrapper provides endpoint switching, auth-token injection, business-code checking, response unwrapping (`dataKey`), and toast — none of which `$fetch` provides.
4. **Build forms from a Zod schema with `afz`** — get the factory via `const { afz } = useAutoForm()`, declare fields with `afz.string() / number() / boolean() / calendarDate() / enum() / array() / object() / file()`, attach UI via `.meta({ label, placeholder, description, controlProps })`, render with `<MAutoForm :schema :state @submit>`, and type state as `z.output<typeof schema>`. Never declare a parallel `interface` next to the schema.
5. **Derive column / event types from official exports** — for `DataTable`, type column callbacks via index access (`DataTableDataColumn<T>['cell' | 'truncate' | 'tooltip']`, `DataTableProps<T>['sortable' | 'pinable' | 'resizable']`) and use the exported handler types (`DataTableSelectHandler`, `DataTableHoverHandler`, `DataTableContextmenuHandler`). Don't hand-write callback signatures.
6. **Dual-mode (Nuxt / Vue + Vite)** — `@movk/nuxt` is a Nuxt module **and** a Vite plugin. In plain Vue + Vite (`@movk/nuxt/vite` + `@movk/nuxt/vue-plugin`) the standalone components, theming, AutoForm, DataTable and non-server composables (`useAutoForm` / `useTheme` / `useDateFormatter` / `useMessageBox`) all work. The **API domain is Nuxt-only**: `useApiFetch` / `useLazyApiFetch` / `useClientApiFetch`, `useUploadWithProgress` / `useDownloadWithProgress`, the `$api` plugin, auth and toast require the Nuxt server runtime — do not use them in Vue mode.

## How to use this skill

Based on the task, load the relevant reference files **before writing any code**. Don't load everything — only what's needed.

### Reference files

- [api](references/api.md) — `useApiFetch` / `$api`, endpoints, auth, business codes, toast, upload/download progress
- [auto-form](references/auto-form.md) — `AutoForm`, the `afz` schema factory, field types, controls, layout, submit
- [components](references/components.md) — categorized component index for finding the right component name
- [composables](references/composables.md) — `useDateFormatter`, `useTheme`, `useMessageBox`, `useAutoForm`
- [data-table](references/data-table.md) — `DataTable` columns, special columns, tree data, row events, pagination

### Routing table

| Task | Load these references |
| --- | --- |
| Build a CRUD / settings / login form from a schema | auto-form |
| Customize AutoForm controls, layout, or define a new control | auto-form, components |
| Fetch data in setup / switch endpoints / handle business errors | api |
| Upload or download a file with progress | api, composables |
| Render a data table with pagination, selection, or sorting | data-table |
| Render tree-structured rows or grouped columns | data-table |
| Add a standalone widget (date picker, rating, input wrapper) | components |
| Format / parse / compare dates or ranges | composables |
| Switch theme, export CSS variables, build a theme picker | composables |
| Open an imperative `confirm` / `alert` dialog | composables |
| General UI work | components |

## Installation

### Requirements

- **Node.js** — `^22.x || >=24.x`
- **Nuxt** — `>=4.4.2` (Nuxt 4)
- Peer deps: `@nuxt/ui >=4.6.0`, `zod >=4.3.6`

### Add to a Nuxt project

```bash
pnpm add @movk/nuxt @nuxt/ui zod tailwindcss
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@movk/nuxt']
})
```

> **pnpm users:** set `shamefully-hoist=true` in `.npmrc`, or install `tailwindcss` at the project root, so Nuxt UI's Tailwind tree resolves correctly.

### Add to a Vue project (Vite, no Nuxt)

Use the Vite plugin + Vue plugin to consume the UI layer (components, theming, AutoForm, DataTable, non-server composables) in a plain Vue + Vite app. The **API domain is not available** in this mode.

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

Wrap the root in `<UApp>` (required for Toast / Tooltip / `useMessageBox`). Full guide: [Vue / Vite](https://nuxt.mhaibaraai.cn/docs/getting-started/vue).

### Optional config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@movk/nuxt'],
  movk: {
    prefix: 'M' // component / composable prefix (default 'M')
    // api: { endpoints, successCodes, dataKey, sessionTokenPath }
    // autoForm: { /* global field meta */ }
  }
})
```

### Zod v4 reminder

`@movk/nuxt` requires **Zod v4**. Use the new top-level validators, not the v3 string chains:

```ts
// ✅ Zod v4
const email = z.email()
const url = z.url()
const datetime = z.iso.datetime()

// ❌ Zod v3 — deprecated
const email = z.string().email()
```
