# Movk Nuxt Components

Quick-reference index of all `M`-prefixed components. Full API docs (props, slots, events, examples) are served by the MCP `get-component` / `get-component-metadata` / `get-example` tools.

All components are auto-registered with the `M` prefix (configurable via `movk.prefix`); reference them directly in templates with no manual `import`.

## Schema-driven

Flagship components that consume a Zod schema and render a complete UI. See dedicated references for in-depth API and patterns.

| Component | Purpose |
| --- | --- |
| `MAutoForm` | Schema-driven form renderer (Zod v4) — fields, controls, layout, validation, submit. Full docs: [auto-form](auto-form.md) |
| `MDataTable` | Data grid with sorting, selection, pagination, tree rows, virtual scroll. Full docs: [data-table](data-table.md) |

## Form controls

Standalone interactive controls, usable inside or outside a form.

| Component | Purpose |
| --- | --- |
| `MSearchForm` | Schema-driven collapsible filter bar — reuses the AutoForm engine for inline search |

## Feedback

| Component | Purpose |
| --- | --- |
| `MMessageBox` | Modal message dialog with six semantic types — declarative `<MMessageBox>` or imperative via `useMessageBox()` |

## Advanced

| Component | Purpose |
| --- | --- |
| `MDatePicker` | Calendar-backed date picker built on `@internationalized/date` |
| `MTree` | Hierarchical tree with search, lazy load, toolbar, cascading checkboxes and parent/child strategy |
| `MThemePicker` | Visual theme configuration panel (paired with `MThemePickerButton` as the launcher) |

Notes:
- Components register automatically; the prefix is configurable via `movk.prefix` (default `M`).
- When you need explicit prop / emit types, import the component types from `@movk/nuxt`.
- For `MMessageBox`'s imperative API (`confirm()` / `alert()` returning a `Promise`), see [composables](composables.md).
- Input wrappers (`MWithClear`, `MWithCopy`, `MWithPasswordToggle`, etc.), `MPillGroup`, `MSlideVerify`, `MColorChooser` and `MPopconfirm` were removed in v2. Use Nuxt UI controls (`UInput` with slots, `URadioGroup`, `UColorPicker` + `UPopover`) or register a custom control with `defineControl`.
- `MAutoForm` and `MDataTable` are listed above for discoverability; load their dedicated references before writing code that uses them.

## MCP & docs

- Docs: `/docs/components/<name>` (e.g. `/docs/components/date-picker`, `/docs/components/tree`)
- MCP: `list-components`, `search-components-by-category`, `get-component`, `get-component-metadata`, `get-example`, plus the `find-component-for-usecase` prompt
