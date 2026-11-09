---
title: DatePicker
description: A button-triggered date picker with single, range and multiple selection, month and year views, and configurable v-model output formats.
category: advanced
seo:
  title: DatePicker
  description: A button-triggered date picker built on Nuxt UI Calendar, supporting single, range and multiple selection, month and year granularity, presets, clearing and configurable v-model value formats, plus the useDateFormatter composable.
---

Use `MDatePicker` when a form or filter bar needs a date field, especially when v-model should contain an ISO string or timestamp for your backend. It combines Nuxt UI `UPopover`, `UButton` and `UCalendar`, inherits size and error state from `UFormField` / `UFieldGroup`, and converts values between v-model and the calendar. AutoForm uses it by default for `afz.calendarDate()` fields.

Date calculations and formatting use [`useDateFormatter`](#usedateformatter), documented below and built on [`@internationalized/date`](https://react-spectrum.adobe.com/internationalized/date/index.html). A timezone-independent `CalendarDate` keeps its calendar date across user time zones.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/calendar"}
Props not declared by `MDatePicker`, including `minValue`, `maxValue`, `isDateUnavailable`, `numberOfMonths` and `weekStartsOn`, are forwarded to Nuxt UI Calendar.
::

## Usage

By default, the picker selects one date and v-model contains a `DateValue`, such as `CalendarDate`:

::component-code
---
name: MDatePicker
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
---
::

### `range` Date Range

`range` changes v-model to `{ start, end }`. Use `numberOfMonths` to display multiple months side by side for cross-month selection:

::component-code
---
name: MDatePicker
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
  range: true
  numberOfMonths: 2
items:
  numberOfMonths: [1, 2, 3]
---
::

### `multiple` Multiple Dates

`multiple` changes v-model to an array of dates. The trigger lists the selected dates:

::component-code
---
name: MDatePicker
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
  multiple: true
---
::

### `type` Month and Year Views

`type` switches to a month or year selection panel. The trigger label uses the corresponding granularity, such as “March 2025” or “2025”:

::component-code
---
name: MDatePicker
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
  type: month
items:
  type: ['date', 'month', 'year']
---
::

::note
`formatOptions` overrides the default format for the selected granularity. `presets: 'default'` generates shortcuts only when `type` is `date`; custom preset arrays are not restricted by this condition.
::

### `valueFormat` Output Format

`valueFormat` determines the shape of v-model. The component converts in both directions while the calendar always uses `DateValue`. Available formats are `date-value` (default), `iso`, `timestamp` (milliseconds), `unix` (seconds) and `date` (JavaScript `Date`), for single values, ranges and arrays:

::component-example
---
name: ComponentsDatePickerValueFormatExample
---
::

::note
Date-only values convert to `timestamp`, `unix` and `date` at UTC midnight, preserving the same calendar date when read back in any time zone. Date-time values without a time zone use `timeZone`; zoned values retain their instant.
::

### `labelFormat` Trigger Label Format

`labelFormat` controls how dates appear on the trigger. Choose `formatted` (default, localized using `locale` and `formatOptions`), `iso`, `date`, `timestamp` or `unix`. Select a date, then switch formats:

::component-code
---
name: MDatePicker
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
  labelFormat: iso
items:
  labelFormat: ['formatted', 'iso', 'date', 'timestamp', 'unix']
---
::

Pass a function for complete control of the label. It receives the formatter and the current calendar value:

```vue
<template>
  <MDatePicker
    v-model="date"
    :label-format="(f, value) => f.isDateValue(value) ? `${f.format(value)} ${f.getDayOfWeekName(value)}` : 'Select a date'"
  />
</template>
```

### `placeholder` Empty Label

`placeholder` sets the trigger label when no date is selected. If omitted, the component uses `buttonProps.label`, then the locale's `datePicker.placeholder`:

::component-code
---
name: MDatePicker
props:
  placeholder: 选择入职日期
---
::

### `buttonProps` Trigger Button

`buttonProps` forwards options to the trigger button, including `color`, `variant`, `icon` and `ui`. Its `label` is used only when the value is empty; selecting a date replaces it with the date label:

::component-code
---
name: MDatePicker
prettier: true
props:
  buttonProps:
    label: 选择生日
    color: primary
    variant: outline
    icon: i-lucide-cake
items:
  buttonProps.color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
  buttonProps.variant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
---
::

::note
The component's `class` and `style` apply to the trigger button, which defaults to `w-full`. Other undeclared attributes are forwarded to the calendar. Configure the popover with `popoverProps`.
::

### `clearable` Clear Selection

`clearable` shows a trailing clear button when the picker has a value and is enabled. Clicking it clears the value without opening the calendar. Single values and ranges become `undefined`; `multiple` becomes `[]`. The accessible label comes from the locale's `datePicker.clear`. Select dates to reveal the button:

::component-code
---
name: MDatePicker
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
  clearable: true
  range: true
---
::

### `presets` Shortcuts

`presets` displays shortcuts to the left of the calendar. Set it to `'default'` to generate Today / Yesterday / Tomorrow for single selection, or Today / This week / This month / Last 7 days / Last 30 days for ranges. No default presets are generated for `multiple`. Labels follow the locale:

::component-code
---
name: MDatePicker
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
  range: true
  presets: default
items:
  range: [true, false]
---
::

### `size` Size

`size` applies to both the trigger button and the calendar. If omitted, it inherits the size of the surrounding `UFormField` / `UFieldGroup`:

::component-code
---
name: MDatePicker
props:
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `color` Accent Color

`color` sets the calendar selection color. The trigger defaults to `neutral`, or `error` when the form field has an error or `color` is `error`. Override the trigger separately with `buttonProps.color`:

::component-code
---
name: MDatePicker
props:
  color: success
items:
  color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

### `disabled` Disabled State

`disabled` disables both the trigger button and the calendar. If omitted, it inherits the surrounding `UFormField` disabled state:

::component-code
---
name: MDatePicker
props:
  disabled: true
---
::

### `open` Controlled Popover

`open` supports two-way binding with `v-model:open`. The component also exposes `open()` and `close()` so external buttons or application flows can control the calendar:

::component-example
---
name: ComponentsDatePickerOpenExample
---
::

## Examples

### Form Field Context

Inside `UFormField`, the picker inherits size, `id` and error state. Inside `UFieldGroup`, it shares the size and connected borders of neighboring buttons:

::component-example
---
name: ComponentsDatePickerFormFieldExample
options:
  - name: size
    items:
      - xs
      - sm
      - md
      - lg
      - xl
    default: md
---
::

### Restrict Available Dates

`minValue` and `maxValue` set the date boundaries. `isDateUnavailable` disables dates by a rule, such as weekends below. These props are forwarded to the calendar:

::component-example
---
name: ComponentsDatePickerValidationExample
---
::

### Custom Shortcuts

When `presets` is an array, each item's `value` can be a fixed value or a function receiving the formatter to calculate a value relative to the current date:

::component-example
---
name: ComponentsDatePickerPresetsExample
---
::

## useDateFormatter

Use the auto-imported `useDateFormatter` to format, convert or compare dates in scripts, or convert form dates to ISO strings before submission. It also powers `MDatePicker` labels, presets and `valueFormat` conversions.

```ts
const f = useDateFormatter()

const today = f.getToday()
f.format(today) // Localized using the current locale, for example "Nov 29, 2025"
f.toISO(today) // "2025-11-29"
f.fromISO('2025-11-29') // CalendarDate
```

### Options

| Option | Description |
| --- | --- |
| `locale` | Locale code. Defaults to `<UApp :locale>` inside component setup, or `'en'` outside a component |
| `formatOptions` | [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) options; defaults to `{ dateStyle: 'medium' }` |
| `timeZone` | IANA time zone identifier, such as `'Asia/Shanghai'`; defaults to the local time zone |

::note
The locale is resolved once per call. After `<UApp :locale>` changes, call `useDateFormatter()` again, for example inside `computed`, to use the new locale.
::

### Method Overview

Inspect the output of common methods using the current locale and time zone:

::component-example
---
name: ComposablesUseDateFormatterOverviewExample
---
::

### Batch Conversion Before Submission

`convertToISO` recursively processes individual dates, `{ start, end }` ranges, arrays and plain objects while preserving their structure. Use it to convert AutoForm data in one step:

```ts
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const f = useDateFormatter()

const schema = afz.object({
  eventDate: afz.calendarDate(),
  eventRange: afz.calendarDate({ controlProps: { range: true } })
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  const payload = f.convertToISO(event.data)
  // { eventDate: '2025-11-29', eventRange: { start: '2025-11-01', end: '2025-11-30' } }
  await $fetch('/api/events', { method: 'POST', body: payload })
}
```

::tip
If your backend accepts a single date format, you can set `valueFormat` on `MDatePicker` so form data uses that format from the start.
::

### Return Value

`format`, `formatRange`, `formatArray` and `toISO` return an empty string for empty values. `toDate`, timestamp conversions and reverse parsers return `null` for empty or invalid values. `toFormat` returns `undefined` for an empty value. Date queries and week / month / year boundary methods require a valid `DateValue` and do not provide a shared empty-value fallback.

| Category | Method | Description |
| --- | --- | --- |
| Formatting | `format(date)` | Localized date string |
| | `formatRange(start, end, separator?)` | Range string; separator defaults to `' - '`. Returns an empty string if either endpoint is empty |
| | `formatArray(dates, separator?)` | Array string; separator defaults to `', '` |
| | `getDayOfWeekName(date, style?)` | Weekday name; `style` is `'narrow'`, `'short'` or `'long'` (default) |
| Forward conversion | `toISO(date)` | ISO 8601 string |
| | `toDate(date)` | JavaScript `Date`; date-only values use UTC midnight |
| | `toTimestamp(date)` / `toUnixTimestamp(date)` | Millisecond / second timestamp |
| | `toFormat(date, valueFormat)` | Dispatches by `ValueFormat` |
| Reverse parsing | `parse(value)` / `fromISO(value)` | Parses an ISO string into `CalendarDate`, `CalendarDateTime` or `ZonedDateTime`. Supports `Z`, `±HH:mm` offsets and `[Asia/Shanghai]` time zone suffixes |
| | `fromDate(value)` | Converts JavaScript `Date` to `CalendarDate`, reversing date-only `toDate` conversion |
| | `fromTimestamp(value)` / `fromUnixTimestamp(value)` | Converts a timestamp to `CalendarDate` |
| | `fromFormat(value, valueFormat)` | Dispatches by `ValueFormat`; returns `null` for a type mismatch |
| Batch conversion | `convertData(data, converter)` | Recursively converts dates, ranges, arrays and plain objects; preserves JavaScript `Date` and class instances |
| | `convertToISO(data)` / `convertToFormatted(data)` / `convertToDate(data)` | Common `convertData` presets |
| | `convertToFormat(data, valueFormat)` / `convertFromFormat(data, valueFormat)` | Converts by `ValueFormat` in either direction; used by `MDatePicker` value formatting |
| Date creation | `getToday()` / `getNow()` | Today (`CalendarDate`) / current instant (`ZonedDateTime`) |
| | `getStartOfWeek(date)` / `getEndOfWeek(date)` | First / last day of the week, using the locale's week start |
| | `getStartOfMonth(date)` / `getEndOfMonth(date)` | First / last day of the month |
| | `getStartOfYear(date)` / `getEndOfYear(date)` | First / last day of the year |
| Queries | `getDayOfWeek(date)` | 0–6, with 0 representing the locale's first weekday |
| | `getWeeksInMonth(date)` | Number of weeks in the month |
| | `isWeekday(date)` / `isWeekend(date)` / `isToday(date)` | Weekday / weekend / today checks |
| | `isSameDay(a, b)` / `isSameMonth(a, b)` / `isSameYear(a, b)` | Same day / month / year checks |
| | `isDateValue(value)` / `isDateRange(value)` | Type guards |
| Properties | `locale` / `timeZone` | Effective locale and time zone |

`CalendarDate` is auto-imported alongside `useDateFormatter`. Import types such as `DateValue`, `DateRange`, `DateFormatter` and `ValueFormat` from `@movk/nuxt`.

## API

### Props

:component-props{slug="MDatePicker"}

### Emits

:component-emits{slug="MDatePicker"}

### Slots

:component-slots{slug="MDatePicker"}

### Expose

Access the component instance with [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref), using the `DatePickerExposed` type.

| Name | Type |
| ---- | ---- |
| `open()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-default mt-1"><p>Open the popover</p></div> |
| `close()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-default mt-1"><p>Close the popover</p></div> |

## Theme

Override the component theme through `ui.movkDatePicker` in `app.config.ts`. The popover uses Nuxt UI Popover slots:

:component-theme

## Changelog

:commit-changelog{prefix="components"}
