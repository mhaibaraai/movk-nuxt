# Component selection

Use the names below with the default `M` prefix. For a custom prefix, check `movk.prefix` in Nuxt or `prefix` in the Vite plugin.

| Task | Component |
| --- | --- |
| Render an editor from a Zod schema | `MAutoForm`. See [AutoForm and SearchForm](auto-form.md). |
| Build a schema-driven filter bar | `MSearchForm`. See [AutoForm and SearchForm](auto-form.md). |
| Render sortable columns, paginated records, or hierarchical rows | `MDataTable`. See [DataTable](data-table.md). |
| Pick a date, date range, or multiple dates | `MDatePicker`. Use `v-model:open` for controlled popover visibility and check `value-format` before typing the model. [DatePicker](https://nuxt.mhaibaraai.cn/docs/components/date-picker) |
| Browse or select hierarchical items | `MTree`. Choose a selection strategy for checkboxes. Decide between local and remote search with `searchMethod`, and use the exposed `reload(key)` for lazy branches. [Tree](https://nuxt.mhaibaraai.cn/docs/components/tree) |
| Display a confirmation or alert | `MMessageBox` for declarative rendering. Use `useMessageBox()` when a handler needs to await the result. [MessageBox](https://nuxt.mhaibaraai.cn/docs/components/message-box) |
| Let users adjust theme settings | `MThemePicker` or its launcher `MThemePickerButton`. Check that the Movk theme is enabled. [Theme](https://nuxt.mhaibaraai.cn/docs/getting-started/theme) |

For standard inputs, buttons, and other UI primitives, use Nuxt UI components. In v2, replace v1 wrappers such as `MWithClear`, `MWithCopy`, and `MWithPasswordToggle` with `UInput` slots. If the same customized input appears in several schemas, register it as an AutoForm control. [Migration guide](https://nuxt.mhaibaraai.cn/docs/getting-started/migration)
