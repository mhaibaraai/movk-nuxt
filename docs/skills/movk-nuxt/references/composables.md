# Composables and theming

These composables work in Nuxt and Vue + Vite with the respective Movk setup. Form and API composables are covered in the [form](auto-form.md) and [API](api.md) references.

| Need | API |
| --- | --- |
| Format a calendar value, range, or array | `useDateFormatter()` with `format`, `formatRange`, or `formatArray`. Use `parse` and `toISO` at data boundaries. [Date formatting](https://nuxt.mhaibaraai.cn/docs/components/date-picker#usedateformatter) |
| Await a dialog | `useMessageBox().confirm(options)` resolves to a boolean. `alert(options)` resolves when the dialog closes. |
| Read or update theme preferences | `useTheme()`. Set the writable refs `primary`, `neutral`, `radius`, `icon`, or `mode` from client interactions. `color` is a derived value. Use `exportCSS()` or `exportConfig()` to export settings and `resetTheme()` to restore defaults. [Theme](https://nuxt.mhaibaraai.cn/docs/getting-started/theme) |
| Customize localized component labels | Use `extendMovkLocale(locale, messages)` with the locale passed to `UApp`. In Nuxt, configure schema validation separately under `movk.zod`. [Localization](https://nuxt.mhaibaraai.cn/docs/getting-started/configuration) |

`useDateFormatter()` defaults to the locale supplied by Nuxt UI when available. Pass an explicit `locale` when the format must stay the same across UI languages. Use `@internationalized/date` values with the calendar controls and select the desired string representation at the API boundary.

Call `useMessageBox()` in setup with a root `UApp`. Perform the action only after the user confirms.

```ts
const { confirm } = useMessageBox()

async function requestRemoval() {
  const accepted = await confirm({
    title: 'Remove this record?',
    description: 'This action cannot be undone.',
    type: 'warning'
  })

  if (accepted) {
    await removeRecord()
  }
}
```
