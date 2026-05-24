# Movk Nuxt Composables

## Overview

Movk Nuxt provides auto-imported utility composables. No imports needed in `<script setup>`. This file covers the general-purpose utilities; data fetching and file transfer live in [api](api.md), and `useAutoForm` is detailed in [auto-form](auto-form.md).

## When to Use

- Formatting, parsing, or comparing dates / ranges / arrays (`useDateFormatter`)
- Reading or writing theme state (color, neutral, radius, font, icon, mode) and exporting CSS variables or app.config code (`useTheme`)
- Opening alert / confirm dialogs imperatively and awaiting the result (`useMessageBox`)
- Building a Zod schema and inspecting field metadata (`useAutoForm` — see [auto-form](auto-form.md))
- When NOT to use: HTTP / upload / download — see [api](api.md)

## Quick Reference

| Composable | Key API |
| --- | --- |
| `useDateFormatter` | `format`, `parse`, `toISO`, `formatRange`, `formatArray`, `getToday`, `isWeekend`, `getStartOfMonth` |
| `useTheme` | `color`, `mode`, `radius`, `font`, `icon` (writable refs); `exportCSS()`, `exportConfig()`, `resetTheme()`, `hasCSSChanges`, `hasConfigChanges` |
| `useMessageBox` | `alert(options) → Promise<void>`, `confirm(options) → Promise<boolean>` |
| `useAutoForm` | `afz`, `defineControl`, `getAutoFormMetadata` |

## Key Usage

```vue
<script setup lang="ts">
const f = useDateFormatter({ locale: 'zh-CN' })
const today = f.getToday()
const label = f.format(today)

const theme = useTheme()
function exportCss() {
  return theme.exportCSS()
}

const { confirm } = useMessageBox()
async function onDelete() {
  const ok = await confirm({ type: 'warning', title: '删除确认', description: '不可恢复' })
  if (ok) await remove()
}
</script>
```

Notes:
- `useDateFormatter` is built on `@internationalized/date`; pass `DateValue` objects, not raw `Date`.
- `useTheme` state are writable refs — assigning updates the theme immediately; `MThemePicker` is its visual wrapper.
- `confirm()` resolves to a boolean; `alert()` resolves when the user closes the dialog.

## MCP & docs

- Docs: `/docs/composables` (use-auto-form, use-date-formatter, use-theme, use-message-box, use-upload-with-progress, use-download-with-progress)
- MCP: `mcp__movk-nuxt__list-composables`, `mcp__movk-nuxt__search-composables`, `mcp__movk-nuxt__get-documentation-page`, `mcp__movk-nuxt__get-example`
