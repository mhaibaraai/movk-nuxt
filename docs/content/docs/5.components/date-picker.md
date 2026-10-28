---
title: DatePicker
description: 基于国际化标准的日期选择器组件。
category: advanced
seo:
  title: DatePicker
  description: An internationalized date picker supporting single, range and multiple selection, presets and custom output formats.
---

## 简介

`MDatePicker` 是一个国际化日期选择器，基于 `@internationalized/date` 处理时区与本地化。支持单日期、日期范围、多日期选择，并提供按钮触发、可清空、快捷预设等多种交互形态。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/calendar"}
基于 Nuxt UI 的 Calendar 组件封装
::

::note{to="https://react-spectrum.adobe.com/internationalized/date/index.html"}
使用 `@internationalized/date` 库进行日期处理，确保时区安全和国际化支持。
::

## 用法

默认按钮触发器展示当前日期，点击打开日历面板后选择并写入 v-model：

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

`range` 模式维护 `start` / `end` 两端日期，`numberOfMonths` 可同时展示双月日历：

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
  range: [true, false]
---
::

### `numberOfMonths` 月份数量

`numberOfMonths` 控制弹层内并排展示的月份数量，便于跨月选择：

::component-code
---
name: MDatePicker
props:
  numberOfMonths: 3
items:
  numberOfMonths: [1, 2, 3]
---
::

### `clearable` 可清空

`clearable` 在已有值时显示清除入口，点击后重置且不展开日历：

::component-code
---
name: MDatePicker
props:
  clearable: true
---
::

### `presets` 快捷预设

`presets` 设为 `default` 会按当前模式自动生成「今天」「本周」「本月」等快捷项：

::component-code
---
name: MDatePicker
hide: ['placeholder']
ignore: ['presets']
props:
  range: true
  presets: default
  placeholder: 选择范围
items:
  range: [true, false]
---
::

### `multiple` 多日期选择

`multiple` 模式将多个日期保存在数组中，按钮文案可根据已选数量动态展示：

::component-code
---
name: MDatePicker
prettier: true
props:
  multiple: true
  buttonProps:
    label: 选择多个日期
    color: primary
items:
  multiple: [true, false]
  buttonProps.color: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
---
::

### `buttonProps` 触发按钮

`buttonProps` 透传给触发按钮，可调整 label、color、variant 与 icon：

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
  buttonProps.color: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
  buttonProps.variant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
---
::

## 示例

### 继承字段上下文

放入 `UFormField` 后继承 `size` 与错误态，触发按钮按表单状态渲染：

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
    default: xs
---
::

### 融入`UFieldGroup`

与按钮置于 `UFieldGroup` 时共用尺寸与边框衔接，适合筛选栏中组合快捷操作：

::component-example
---
name: ComponentsDatePickerFieldGroupExample
options:
  - name: size
    items:
      - xs
      - sm
      - md
      - lg
      - xl
    default: xs
---
::

### 限制可选日期边界

`minValue` 与 `maxValue` 会禁用边界外日期，分别约束只能选择未来或过去日期：

::component-example
---
name: ComponentsDatePickerValidationExample
---
::

### 按规则禁用日期

`isDateUnavailable` 可按业务规则禁用日期（如示例中的周末）：

::component-example
---
name: ComponentsDatePickerUnavailableExample
---
::

### 自定义触发按钮文案

`labelFormat` 接收格式化工具和当前值，可把日期与星期信息组合为按钮 label：

::component-example
---
name: ComponentsDatePickerFormatExample
---
::

### 自定义快捷预设

`presets` 传入数组可按业务规则返回日期，每项 `value` 是接收 `formatter` 的函数：

::component-example
---
name: ComponentsDatePickerPresetsExample
---
::

## useDateFormatter

### 用法

使用自动导入的 `useDateFormatter` composable 进行日期格式化、转换和操作，基于 `@internationalized/date` 库实现国际化日期处理。

```vue
<script setup lang="ts">
const formatter = useDateFormatter({ locale: 'zh-CN' })

const today = formatter.getToday()
const formattedDate = formatter.format(today)
// "2025年11月29日"

const isoString = formatter.toISO(today)
// "2025-11-29"
</script>
```

- `useDateFormatter` 基于 `Intl.DateTimeFormat` 提供本地化日期格式化。
- 支持单个日期、日期范围、日期数组以及嵌套对象的批量转换。
- 通过 `timeZone` 选项指定时区（默认本地时区），标识符遵循 IANA 时区数据库规范。

::note
所有格式化和转换方法都内置了错误处理，当传入 `null` 或 `undefined` 时会返回空字符串或 `null`，避免抛出异常。
::

### 能力一览

下表覆盖了 `useDateFormatter` 在常用日期场景下的输出形态：

::component-example
---
name: 'composables-use-date-formatter-overview-example'
---
::

### 与 AutoForm 集成

在 AutoForm 中使用日期字段时，建议使用 `convertToISO()` 进行批量转换后提交：

```vue
<script setup lang="ts">
const { afz } = useAutoForm()
const formatter = useDateFormatter()

const schema = afz.object({
  eventDate: afz.calendarDate(),
  eventRange: afz.calendarDate({
    controlProps: { mode: 'range' }
  })
})

const formData = ref()

async function handleSubmit() {
  // 自动处理所有日期字段的转换
  const payload = formatter.convertToISO(formData.value)

  // payload.eventDate: "2025-11-29"
  // payload.eventRange: { start: "2025-11-01", end: "2025-11-30" }

  await api.submit(payload)
}
</script>
```

::note
`convertToISO` 自动遍历所有嵌套日期字段并保持对象结构不变，无需手动转换。
::

### API

#### useDateFormatter()

`useDateFormatter(options?: DateFormatterOptions): DateFormatter`{lang="ts-type"}

创建日期格式化器实例。

##### Parameters

::field-group

  ::field{name="options" type="DateFormatterOptions"}
  日期格式化配置选项。

    ::collapsible

      ::field-group
        ::field{name="locale" type="string"}
        语言区域，默认 `'zh-CN'`。
        ::

        ::field{name="formatOptions" type="Intl.DateTimeFormatOptions"}
        日期格式化选项，遵循 [Intl.DateTimeFormat](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) 规范。默认为 `{ dateStyle: 'medium' }`。
        ::

        ::field{name="timeZone" type="string"}
        时区标识符（如 `'Asia/Shanghai'`, `'America/New_York'`），默认使用本地时区。详见 [@internationalized/date 时区文档](https://react-spectrum.adobe.com/internationalized/date/index.html#timezones)。
        ::
      ::
    ::
  ::
::

##### Returns

返回包含以下方法和属性的日期格式化器对象。

#### 格式化方法

::field-group

  ::field{name="format()" type="(date: DateValue | undefined | null) => string"}
  格式化单个日期为本地化字符串。

    ::collapsible
      ```ts
      formatter.format(date)
      // "2025年11月29日"
      ```
    ::
  ::

  ::field{name="formatRange()" type="(start: DateValue | undefined | null, end: DateValue | undefined | null, separator?: string) => string"}
  格式化日期范围，默认分隔符为 `' - '`。

    ::collapsible
      ```ts
      formatter.formatRange(startDate, endDate)
      // "2025年11月1日 - 2025年11月30日"

      formatter.formatRange(startDate, endDate, ' 至 ')
      // "2025年11月1日 至 2025年11月30日"
      ```
    ::
  ::

  ::field{name="formatArray()" type="(dates: DateValue[] | undefined | null, separator?: string) => string"}
  格式化日期数组，默认分隔符为 `', '`。

    ::collapsible
      ```ts
      formatter.formatArray([date1, date2, date3])
      // "2025年11月1日, 2025年11月15日, 2025年11月29日"
      ```
    ::
  ::
::

#### 转换方法

::field-group

  ::field{name="toISO()" type="(date: DateValue | undefined | null) => string"}
  转换为 ISO 8601 字符串。

    ::collapsible
      ```ts
      formatter.toISO(date)
      // "2025-11-29"
      ```
    ::
  ::

  ::field{name="toDate()" type="(date: DateValue | undefined | null) => Date | null"}
  转换为 JavaScript Date 对象。
  ::

  ::field{name="toTimestamp()" type="(date: DateValue | undefined | null) => number | null"}
  转换为时间戳（毫秒）。

    ::collapsible
      ```ts
      formatter.toTimestamp(date)
      // 1732838400000
      ```
    ::
  ::

  ::field{name="toUnixTimestamp()" type="(date: DateValue | undefined | null) => number | null"}
  转换为 Unix 时间戳（秒）。

    ::collapsible
      ```ts
      formatter.toUnixTimestamp(date)
      // 1732838400
      ```
    ::
  ::

  ::field{name="parse()" type="(value: string) => DateValue | null"}
  解析 ISO 8601 日期字符串。自动识别 `CalendarDate`、`CalendarDateTime` 或 `ZonedDateTime`。

    ::collapsible
      ```ts
      formatter.parse('2025-11-29')
      // CalendarDate

      formatter.parse('2025-11-29T10:30:00')
      // CalendarDateTime

      formatter.parse('2025-11-29T10:30:00[Asia/Shanghai]')
      // ZonedDateTime
      ```
    ::
  ::
::

#### 工具方法 - 获取日期

::field-group
  ::field{name="getToday()" type="() => CalendarDate"}
  获取今天的日期。
  ::

  ::field{name="getNow()" type="() => ZonedDateTime"}
  获取当前日期时间。
  ::

  ::field{name="getStartOfWeek()" type="(date: DateValue) => DateValue"}
  获取一周的开始日期（基于当前语言区域）。
  ::

  ::field{name="getEndOfWeek()" type="(date: DateValue) => DateValue"}
  获取一周的结束日期（基于当前语言区域）。
  ::

  ::field{name="getStartOfMonth()" type="(date: DateValue) => DateValue"}
  获取一月的开始日期。
  ::

  ::field{name="getEndOfMonth()" type="(date: DateValue) => DateValue"}
  获取一月的结束日期。
  ::

  ::field{name="getStartOfYear()" type="(date: DateValue) => DateValue"}
  获取一年的开始日期。
  ::

  ::field{name="getEndOfYear()" type="(date: DateValue) => DateValue"}
  获取一年的结束日期。
  ::
::

#### 工具方法 - 查询

::field-group
  ::field{name="getDayOfWeek()" type="(date: DateValue) => number"}
  获取星期几数字（0-6，0 为本地化的一周第一天）。
  ::

  ::field{name="getDayOfWeekName()" type="(date: DateValue, style?: 'narrow' | 'short' | 'long') => string"}
  获取本地化的星期几名称。

    ::collapsible
      **Parameters**

      ::field-group
        ::field{name="date" type="DateValue" required}
        日期对象。
        ::

        ::field{name="style" type="'narrow' | 'short' | 'long'"}
        格式样式。 默认 `long`

        - `'narrow'` - 最短格式，如「一」
        - `'short'` - 短格式，如「周一」
        - `'long'` - 完整格式，如「星期一」
        ::
      ::

      ```ts
      const date = formatter.getToday()

      formatter.getDayOfWeekName(date, 'narrow')  // "一"
      formatter.getDayOfWeekName(date, 'short')   // "周一"
      formatter.getDayOfWeekName(date, 'long')    // "星期一"
      formatter.getDayOfWeekName(date)            // "星期一" (默认)
      ```
    ::
  ::

  ::field{name="getWeeksInMonth()" type="(date: DateValue) => number"}
  获取本月的周数。
  ::

  ::field{name="isWeekday()" type="(date: DateValue) => boolean"}
  判断是否为工作日。
  ::

  ::field{name="isWeekend()" type="(date: DateValue) => boolean"}
  判断是否为周末。
  ::

  ::field{name="isSameDay()" type="(a: DateValue, b: DateValue) => boolean"}
  判断是否为同一天。
  ::

  ::field{name="isSameMonth()" type="(a: DateValue, b: DateValue) => boolean"}
  判断是否为同一月。
  ::

  ::field{name="isSameYear()" type="(a: DateValue, b: DateValue) => boolean"}
  判断是否为同一年。
  ::

  ::field{name="isToday()" type="(date: DateValue) => boolean"}
  判断是否为今天。
  ::

  ::field{name="isDateValue()" type="(value: unknown) => value is DateValue"}
  类型守卫，判断是否为 `DateValue` 类型。
  ::

  ::field{name="isDateRange()" type="(value: unknown) => value is DateRange"}
  类型守卫，判断是否为 `DateRange` 类型。
  ::
::

#### 批量转换方法

::field-group

  ::field{name="convertData()" type="<T>(data: T, converter: (value: DateValue) => any) => T"}
  通用数据转换函数，自动处理单个日期、日期范围、日期数组以及嵌套对象。

    ::collapsible
      ```ts
      const converted = formatter.convertData(complexData, formatter.toISO)
      ```
    ::
  ::

  ::field{name="convertToISO()" type="<T>(data: T) => T"}
  批量转换为 ISO 字符串。支持单个日期、日期范围、数组和嵌套对象。

    ::collapsible
      ```ts
      // 单个日期
      formatter.convertToISO(date)
      // "2025-11-29"

      // 日期范围
      formatter.convertToISO({ start: date1, end: date2 })
      // { start: "2025-11-01", end: "2025-11-30" }

      // 日期数组
      formatter.convertToISO([date1, date2])
      // ["2025-11-01", "2025-11-15"]

      // 嵌套对象
      formatter.convertToISO({
        createdAt: date1,
        range: { start: date2, end: date3 }
      })
      // {
      //   createdAt: "2025-11-01",
      //   range: { start: "2025-11-20", end: "2025-11-29" }
      // }
      ```
    ::
  ::

  ::field{name="convertToFormatted()" type="<T>(data: T) => T"}
  批量转换为格式化字符串。
  ::

  ::field{name="convertToDate()" type="<T>(data: T) => T"}
  批量转换为 Date 对象。
  ::
::

#### 配置属性

::field-group
  ::field{name="locale" type="string"}
  当前使用的语言区域。
  ::

  ::field{name="timeZone" type="string"}
  当前使用的时区。
  ::
::

### Changelog

:commit-changelog{prefix="composables" suffix="ts"}

## API

### Props

:component-props{slug="MDatePicker"}

### Emits

:component-emits{slug="MDatePicker"}

### Slots

:component-slots{slug="MDatePicker"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
