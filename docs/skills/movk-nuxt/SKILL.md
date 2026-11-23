---
name: movk-nuxt
description: Build and maintain apps using @movk/nuxt on Nuxt 4 or Vue + Vite. Use when setting up Movk Nuxt, migrating from v1, building Zod v4 AutoForm or SearchForm schemas, configuring MDataTable columns or pagination, using Movk components, themes or composables, or integrating Nuxt APIs with useApiFetch, $api, file transfer progress or SSE chat.
---

# Movk Nuxt

Use this skill for applications consuming `@movk/nuxt`. Check the installed versions and identify Nuxt or Vue + Vite before choosing an API. For v1 projects, read the [migration guide](https://nuxt.mhaibaraai.cn/docs/getting-started/migration) before applying v2 examples.

## Choose a reference

| Task | Read |
| --- | --- |
| Build a schema-driven editor or search form, register a field control, load dependent options, or handle validation | [AutoForm and SearchForm](references/auto-form.md) |
| Configure columns, row actions, tree rows, pagination, infinite scrolling, or CSV export | [DataTable](references/data-table.md) |
| Fetch from configured endpoints, handle auth or business errors, track transfers, or adapt an SSE gateway to AI SDK chat | [Nuxt API integration](references/api.md) |
| Pick a calendar, tree, message box, or theme picker | [Components](references/components.md) |
| Format dates, open a confirmation dialog, change the theme, or extend locale messages | [Composables](references/composables.md) |

Read the references matching the task. Combine them when a feature spans domains, such as a search form driving server-paginated results.

## Set up the project

- **Nuxt 4.** Install `@movk/nuxt`, `@nuxt/ui`, `zod`, and `tailwindcss`. Register `@movk/nuxt` in `modules` and the CSS entry in `css`. Configure the module under `movk`. [Nuxt installation](https://nuxt.mhaibaraai.cn/docs/getting-started/installation)
- **Vue + Vite.** Add `movk()` from `@movk/nuxt/vite` alongside the Vue plugin. In the Vue entry, import the stylesheet and register `@movk/nuxt/vue-plugin` with `app.use()`. The standard setup also installs and registers Vue Router. Include the generated `auto-imports.d.ts` and `components.d.ts` in the app's TypeScript config. Use the project's HTTP client for requests. Movk's API client, transfer helpers, and chat transport require Nuxt. [Vue / Vite installation](https://nuxt.mhaibaraai.cn/docs/getting-started/vue)

The current package requires Nuxt UI 4.13.0+ and Zod 4.3.6+. Use one Tailwind CSS entry in either mode. Movk's stylesheet already imports Nuxt UI.

```css
@import "tailwindcss";
@import "@movk/nuxt";
```

Wrap the root content in `UApp` for overlays, tooltips, and toasts. Movk auto-registers components with the `M` prefix by default. The `prefix` option affects component names. Composables keep names such as `useAutoForm`.

## Verify the API

1. Use the installed package's public types when checking compatibility. The examples use the default component prefix and import public types from `@movk/nuxt`.
2. Find Movk docs with the MCP server at `https://nuxt.mhaibaraai.cn/mcp` if connected. Use `search-documentation` or a domain search to get a path, then `get-documentation-page` with that path and optional `headings`. Use `get-component` or `get-component-metadata` for standalone components and `list-examples` followed by `get-example` for example code.
3. Use the [Movk Nuxt docs](https://nuxt.mhaibaraai.cn/docs/getting-started) when MCP is unavailable. For native `U*` props and slots, consult the [Nuxt UI v4 docs](https://ui.nuxt.com/docs).
