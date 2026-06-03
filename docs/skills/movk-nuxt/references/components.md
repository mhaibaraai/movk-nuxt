# Movk Nuxt Components

Quick-reference index of all `M`-prefixed components. Full API docs (props, slots, events, examples) are served by the MCP `get-component` / `get-component-metadata` / `get-example` tools.

All components are auto-registered with the `M` prefix (configurable via `movk.prefix`); reference them directly in templates with no manual `import`.

## Schema-driven

Flagship components that consume a Zod schema and render a complete UI. See dedicated references for in-depth API and patterns.

| Component | Purpose |
| --- | --- |
| `MAutoForm` | Schema-driven form renderer (Zod v4) — fields, controls, layout, validation, submit. Full docs: [auto-form](auto-form.md) |
| `MDataTable` | Data grid with sorting, selection, pagination, tree rows, virtual scroll. Full docs: [data-table](data-table.md) |

## Input enhancement

Wrappers that compose around `UInput` (or any input slot) to add a single capability without rebuilding the control.

| Component | Purpose |
| --- | --- |
| `MWithCopy` | Adds a copy-to-clipboard button to the input |
| `MWithClear` | Adds a clear button that resets the bound value |
| `MWithPasswordToggle` | Adds a show/hide toggle for password fields |
| `MWithCharacterLimit` | Shows a live character counter + max length |
| `MWithFloatingLabel` | Floating-label layout with built-in clear button |
| `MAsPhoneNumberInput` | Input mask formatter for phone numbers |

## Form controls

Standalone interactive controls, usable inside or outside a form.

| Component | Purpose |
| --- | --- |
| `MPillGroup` | Pill-style single/multi select — string or object items, min/max constraint, field mapping, slots |
| `MSearchForm` | Schema-driven collapsible filter bar — reuses the AutoForm engine for inline search |

## Feedback

| Component | Purpose |
| --- | --- |
| `MMessageBox` | Modal message dialog with six semantic types — declarative `<MMessageBox>` or imperative via `useMessageBox()` |
| `MPopconfirm` | Bubble-style action confirmation (lightweight inline confirm) |

## Advanced

| Component | Purpose |
| --- | --- |
| `MDatePicker` | Calendar-backed date picker built on `@internationalized/date` |
| `MStarRating` | Interactive star rating control |
| `MColorChooser` | Visual color picker |
| `MSlideVerify` | Slide-to-verify human-check widget |
| `MThemePicker` | Visual theme configuration panel (paired with `MThemePickerButton` as the launcher) |

Notes:
- Components register automatically; the prefix is configurable via `movk.prefix` (default `M`).
- When you need explicit prop / emit types, import the component types from `@movk/nuxt`.
- For `MMessageBox`'s imperative API (`confirm()` / `alert()` returning a `Promise`), see [composables](composables.md).
- `MAutoForm` and `MDataTable` are listed above for discoverability; load their dedicated references before writing code that uses them.

## MCP & docs

- Docs: `/docs/components/<name>` (e.g. `/docs/components/date-picker`, `/docs/components/pill-group`)
- MCP: `list-components`, `search-components-by-category`, `get-component`, `get-component-metadata`, `get-example`, plus the `find-component-for-usecase` prompt
