---
title: DatePicker
description: 按钮触发的日期选择器，支持单选、范围、多选、月 / 年粒度与 v-model 输出格式转换。
category: advanced
seo:
  title: DatePicker
  description: A button-triggered date picker built on Nuxt UI Calendar, supporting single, range and multiple selection, month and year granularity, presets, clearing and configurable v-model value formats, plus the useDateFormatter composable.
---

需要在表单或筛选栏里选择日期，并希望 v-model 直接是后端要的 ISO 字符串或时间戳时，使用 `MDatePicker`。它把 Nuxt UI 的 `UPopover`、`UButton` 与 `UCalendar` 组合成一个字段控件：继承 `UFormField` / `UFieldGroup` 的尺寸与错误态，并在 v-model 与日历之间自动转换值格式。AutoForm 的 `afz.calendarDate()` 字段默认渲染的就是它。

日期计算与格式化由同页的 [`useDateFormatter`](#usedateformatter) 提供，基于 [`@internationalized/date`](https://react-spectrum.adobe.com/internationalized/date/index.html)，与时区无关的 `CalendarDate` 不会因用户所在时区偏移一天。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/calendar"}
未被 `MDatePicker` 声明的 props（`minValue`、`maxValue`、`isDateUnavailable`、`numberOfMonths`、`weekStartsOn` 等）全部透传给 Nuxt UI Calendar。
::

## 用法

默认选择单个日期，v-model 为 `DateValue`（如 `CalendarDate`）：

::component-code
---
name: MDatePicker
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
---
::

### `range` 日期范围

`range` 作用：v-model 变为 `{ start, end }`，配合 `numberOfMonths` 并排展示多个月份，便于跨月选择：

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

### `multiple` 多日期

`multiple` 作用：v-model 变为日期数组，按钮依次列出已选日期：

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

### `type` 月 / 年粒度

`type` 作用：切换为月份或年份选择面板，按钮文案只显示到对应粒度（如「2025年3月」「2025年」）：

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
`formatOptions` 优先于粒度默认格式；`presets: 'default'` 只在 `type` 为 `date` 时生成快捷项，自定义预设数组不受此限制。
::

### `valueFormat` 输出格式

`valueFormat` 作用：决定 v-model 的值形态，组件内部负责双向转换，日历始终操作 `DateValue`。可选 `date-value`（默认）、`iso`、`timestamp`（毫秒）、`unix`（秒）、`date`（JS `Date`），对单值、范围与数组同样生效：

::component-example
---
name: ComponentsDatePickerValueFormatExample
---
::

::note
纯日期转为 `timestamp` / `unix` / `date` 时取 UTC 零点，任何时区下回读都是同一天；无时区的日期时间按 `timeZone` 解释，带时区的值保留对应时刻。
::

### `labelFormat` 按钮文案格式

`labelFormat` 作用：控制触发按钮上的日期展示，可选 `formatted`（默认，按 `locale` 与 `formatOptions` 本地化）、`iso`、`date`、`timestamp`、`unix`。选择日期后切换观察：

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

传入函数可完全接管文案，参数为格式化器与当前日历值：

```vue
<template>
  <MDatePicker
    v-model="date"
    :label-format="(f, value) => f.isDateValue(value) ? `${f.format(value)} ${f.getDayOfWeekName(value)}` : '选择日期'"
  />
</template>
```

### `placeholder` 空值文案

`placeholder` 作用：未选择日期时的按钮文案。缺省时依次取 `buttonProps.label`、locale 的 `datePicker.placeholder`：

::component-code
---
name: MDatePicker
props:
  placeholder: 选择入职日期
---
::

### `buttonProps` 触发按钮

`buttonProps` 作用：透传给触发按钮，覆盖 `color`、`variant`、`icon`、`ui` 等。`label` 只作为空值文案，选中日期后按钮仍显示日期：

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
组件上的 `class` / `style` 落在触发按钮上（按钮默认 `w-full`），其余未声明的属性透传给日历；弹层配置用 `popoverProps`。
::

### `clearable` 可清除

`clearable` 作用：有值且未禁用时在按钮末尾显示清除按钮，点击后清空且不展开日历。单值与范围清除后得到 `undefined`，`multiple` 得到 `[]`；清除按钮的无障碍文案来自 locale 的 `datePicker.clear`。选择日期后可见：

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

### `presets` 快捷预设

`presets` 作用：在日历左侧渲染快捷项。设为 `'default'` 时单选生成「今天 / 昨天 / 明天」，范围生成「今天 / 本周 / 本月 / 最近 7 天 / 最近 30 天」，`multiple` 不生成；文案随 locale 切换：

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

### `size` 尺寸

`size` 作用：同时作用于触发按钮与日历；未传时继承外层 `UFormField` / `UFieldGroup` 的尺寸：

::component-code
---
name: MDatePicker
props:
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `color` 主色

`color` 作用：日历选中态的主色。触发按钮默认使用 `neutral`，表单错误态或 `color: error` 时使用 `error`；可用 `buttonProps.color` 单独覆盖：

::component-code
---
name: MDatePicker
props:
  color: success
items:
  color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

### `disabled` 禁用

`disabled` 作用：同时禁用触发按钮与日历；未传时继承外层 `UFormField` 的禁用状态：

::component-code
---
name: MDatePicker
props:
  disabled: true
---
::

### `open` 受控弹层

`open` 作用：用 `v-model:open` 双向绑定弹层开关；组件实例另暴露 `open()` / `close()`，可在外部按钮或流程中打开日历：

::component-example
---
name: ComponentsDatePickerOpenExample
---
::

## 示例

### 表单字段上下文

放入 `UFormField` 时继承尺寸、`id` 与错误态；放入 `UFieldGroup` 时与相邻按钮共用尺寸与边框衔接：

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

### 限制可选日期

`minValue` / `maxValue` 限定边界，`isDateUnavailable` 按规则禁用日期（下例禁用周末），二者都透传给日历：

::component-example
---
name: ComponentsDatePickerValidationExample
---
::

### 自定义快捷预设

`presets` 传入数组时，每项 `value` 可以是固定值，也可以是接收格式化器的函数，按当前日期动态计算：

::component-example
---
name: ComponentsDatePickerPresetsExample
---
::

## useDateFormatter

需要在脚本中格式化、换算或比较日期，或在提交前把表单里的日期统一转成 ISO 字符串时，使用自动导入的 `useDateFormatter`。`MDatePicker` 的按钮文案、预设与 `valueFormat` 转换都由它完成。

```ts
const f = useDateFormatter()

const today = f.getToday()
f.format(today) // 按当前 locale 本地化，如 "2025年11月29日"
f.toISO(today) // "2025-11-29"
f.fromISO('2025-11-29') // CalendarDate
```

### 选项

| 选项 | 说明 |
| --- | --- |
| `locale` | 语言区域。未传时跟随 `<UApp :locale>`，在组件 `setup` 之外调用时为 `'en'` |
| `formatOptions` | [`Intl.DateTimeFormat`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) 选项，默认 `{ dateStyle: 'medium' }` |
| `timeZone` | IANA 时区标识（如 `'Asia/Shanghai'`），默认本地时区 |

::note
locale 在调用时解析一次，切换 `<UApp :locale>` 后需重新调用 `useDateFormatter()`（如放进 `computed`）才能拿到新语言。
::

### 能力一览

当前 locale 与时区下常用方法的实际输出：

::component-example
---
name: ComposablesUseDateFormatterOverviewExample
---
::

### 提交前批量转换

`convertToISO` 递归处理单个日期、`{ start, end }` 范围、数组与普通对象，保持结构不变，适合在 AutoForm 提交时一次性转换：

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
如果后端只接受某一种格式，也可以直接给 `MDatePicker` 设置 `valueFormat`，表单数据从一开始就是目标格式。
::

### 返回值

`format`、`formatRange`、`formatArray` 与 `toISO` 对空值返回空字符串；`toDate`、时间戳转换与反向解析对空值或非法值返回 `null`。`toFormat` 的空值结果为 `undefined`。日期查询和周 / 月 / 年边界方法要求有效的 `DateValue`，不提供统一的空值兜底。

| 分类 | 方法 | 说明 |
| --- | --- | --- |
| 格式化 | `format(date)` | 本地化字符串 |
| | `formatRange(start, end, separator?)` | 范围字符串，默认分隔符 `' - '`，任一端为空返回空串 |
| | `formatArray(dates, separator?)` | 数组字符串，默认分隔符 `', '` |
| | `getDayOfWeekName(date, style?)` | 星期名，`style` 为 `'narrow'` / `'short'` / `'long'`（默认） |
| 正向转换 | `toISO(date)` | ISO 8601 字符串 |
| | `toDate(date)` | JS `Date`，纯日期取 UTC 零点 |
| | `toTimestamp(date)` / `toUnixTimestamp(date)` | 毫秒 / 秒时间戳 |
| | `toFormat(date, valueFormat)` | 按 `ValueFormat` 分发 |
| 反向解析 | `parse(value)` / `fromISO(value)` | 解析 ISO 字符串，按内容返回 `CalendarDate`、`CalendarDateTime` 或 `ZonedDateTime`，支持 `Z`、`±HH:mm` 偏移与 `[Asia/Shanghai]` 时区后缀 |
| | `fromDate(value)` | JS `Date` 转 `CalendarDate`（与 `toDate` 互逆） |
| | `fromTimestamp(value)` / `fromUnixTimestamp(value)` | 时间戳转 `CalendarDate` |
| | `fromFormat(value, valueFormat)` | 按 `ValueFormat` 分发，类型不匹配返回 `null` |
| 批量转换 | `convertData(data, converter)` | 递归转换日期、范围、数组与普通对象，`Date` 与类实例原样保留 |
| | `convertToISO(data)` / `convertToFormatted(data)` / `convertToDate(data)` | `convertData` 的常用预设 |
| | `convertToFormat(data, valueFormat)` / `convertFromFormat(data, valueFormat)` | 按 `ValueFormat` 双向转换，`MDatePicker` 的 `valueFormat` 即基于此 |
| 取日期 | `getToday()` / `getNow()` | 今天（`CalendarDate`）/ 当前时刻（`ZonedDateTime`） |
| | `getStartOfWeek(date)` / `getEndOfWeek(date)` | 周首 / 周末，按 locale 决定一周起始日 |
| | `getStartOfMonth(date)` / `getEndOfMonth(date)` | 月初 / 月末 |
| | `getStartOfYear(date)` / `getEndOfYear(date)` | 年初 / 年末 |
| 查询 | `getDayOfWeek(date)` | 0-6，0 为当前 locale 的一周第一天 |
| | `getWeeksInMonth(date)` | 当月周数 |
| | `isWeekday(date)` / `isWeekend(date)` / `isToday(date)` | 工作日 / 周末 / 今天 |
| | `isSameDay(a, b)` / `isSameMonth(a, b)` / `isSameYear(a, b)` | 同日 / 同月 / 同年 |
| | `isDateValue(value)` / `isDateRange(value)` | 类型守卫 |
| 属性 | `locale` / `timeZone` | 实际生效的语言区域与时区 |

`CalendarDate` 随 `useDateFormatter` 自动导入；`DateValue`、`DateRange`、`DateFormatter`、`ValueFormat` 等类型从 `@movk/nuxt` 导入。

## API

### Props

:component-props{slug="MDatePicker"}

### Emits

:component-emits{slug="MDatePicker"}

### Slots

:component-slots{slug="MDatePicker"}

### Expose

通过 [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) 访问组件实例（类型 `DatePickerExposed`）。

| Name | Type |
| ---- | ---- |
| `open()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-default mt-1"><p>打开弹层</p></div> |
| `close()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-default mt-1"><p>关闭弹层</p></div> |

## Theme

通过 `app.config.ts` 的 `ui.movkDatePicker` 覆盖组件主题，弹层部分沿用 Nuxt UI Popover 的 slots：

:component-theme

## Changelog

:commit-changelog{prefix="components"}
