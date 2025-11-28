---
title: DatePicker
description: 基于国际化标准的日期选择器组件
---

## 简介

`MDatePicker` 是一个功能强大的日期选择器组件，基于 `@internationalized/date` 提供国际化日期处理能力。支持单日期、日期范围、多日期选择等多种模式，并提供丰富的日期验证和格式化选项。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/calendar"}
基于 Nuxt UI 的 Calendar 组件封装
::

::note{to="https://react-spectrum.adobe.com/internationalized/date/"}
使用 `@internationalized/date` 库进行日期处理，确保时区安全和国际化支持。
::

## 基础用法

最基础的日期选择器：

::component-example
---
name: 'components-date-picker-basic-example'
collapse: true
props:
  class: 'px-4'
---
::

## 日期范围

通过 `range` 启用范围选择模式：

::component-example
---
name: 'components-date-picker-range-example'
collapse: true
props:
  class: 'px-4'
---
::

## 多日期选择

通过 `multiple` 启用多选模式：

::component-example
---
name: 'components-date-picker-multiple-example'
collapse: true
props:
  class: 'px-4'
---
::

## 日期限制

限制可选日期范围：

::component-example
---
name: 'components-date-picker-validation-example'
collapse: true
props:
  class: 'px-4'
---
::

## 禁用特定日期

使用 `isDateUnavailable` 禁用特定日期：

::component-example
---
name: 'components-date-picker-unavailable-example'
collapse: true
props:
  class: 'px-4'
---
::

## 格式化显示

支持多种日期格式输出：

::component-example
---
name: 'components-date-picker-format-example'
collapse: true
props:
  class: 'px-4'
---
::

## 多月份显示

通过 `numberOfMonths` 同时显示多个月份的日历：

::component-example
---
name: 'components-date-picker-months-example'
collapse: true
props:
  class: 'px-4'
---
::

## 自定义按钮

通过 `buttonProps` 自定义按钮样式：

::component-example
---
name: 'components-date-picker-button-example'
collapse: true
props:
  class: 'px-4'
---
::

## API

### Props

继承自 [UCalendar](https://ui.nuxt.com/docs/components/calendar#props) 的所有属性（除了 `modelValue`），并扩展：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `buttonProps` | `ButtonProps` | `{ label: '选择日期' }` | 触发按钮的属性 |
| `popoverProps` | `PopoverProps` | - | Popover 弹出层属性 |
| `labelFormat` | `LabelFormat \| Function` | `'formatted'` | 标签格式化方式 |
| `locale` | `string` | - | 日期本地化语言 |
| `formatOptions` | `Intl.DateTimeFormatOptions` | `{ dateStyle: 'medium' }` | 日期格式化选项 |

**labelFormat 选项**：
- `'iso'`: ISO 8601 格式（如：2025-11-18）
- `'formatted'`: 本地化格式（默认）
- `'date'`: Date 对象字符串
- `'timestamp'`: 时间戳（毫秒）
- `'unix'`: Unix 时间戳（秒）
- `Function`: 自定义格式化函数

### Emits

继承自 [UCalendar](https://ui.nuxt.com/docs/components/calendar#emits) 和 UPopover 的所有事件。

### Slots

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `default` | `{ open }` | 自定义触发器 |
| `anchor` | - | Popover 锚点 |
| `leading` | - | 按钮前置内容 |
| `trailing` | - | 按钮后置内容 |
| `day` | `{ date }` | 自定义日期单元格 |
| `heading` | - | 自定义日历头部 |
| `week-day` | - | 自定义星期标题 |

## 日期工具

组件提供 `useDateFormatter` composable 用于日期处理：

```typescript
const formatter = useDateFormatter()

// 获取今天
const today = formatter.getToday()

// 格式化日期
const formatted = formatter.format(date)

// 转换为 ISO 字符串
const iso = formatter.toISO(date)

// 转换为时间戳
const timestamp = formatter.toTimestamp(date)

// 判断是否为周末
const isWeekend = formatter.isWeekend(date)

// 获取星期几
const dayOfWeek = formatter.getDayOfWeek(date)
```

## 使用场景

- **预订系统**：酒店、机票等日期范围选择
- **任务管理**：设置任务截止日期
- **数据筛选**：选择日期范围过滤数据
- **日程安排**：会议、活动日期选择
- **表单输入**：生日、入职日期等信息录入
