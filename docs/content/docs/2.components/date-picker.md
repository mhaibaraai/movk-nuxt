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

## 基础用法

默认按钮触发器展示当前日期，点击打开日历面板后选择并写入 v-model：

::component-code
---
name: MDatePicker
---
::

### 继承字段上下文

放入 `UFormField` 后继承 `size` 与错误态，触发按钮按表单状态渲染：

::component-code
---
name: UFormField
prettier: true
props:
  label: 预约日期
  size: xs
  error: 示例错误态
slots:
  default: |

    <MDatePicker />
---
:m-date-picker
::

### 融入分组控件

与按钮置于 `UFieldGroup` 时共用尺寸与边框衔接，适合筛选栏中组合快捷操作：

::component-code
---
name: UFieldGroup
prettier: true
props:
  size: xs
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MDatePicker />
    <UButton icon="i-lucide-calendar-check" color="neutral" variant="subtle" />
---
:m-date-picker
:u-button{color="neutral" variant="subtle" icon="i-lucide-calendar-check"}
::

### 日期范围

`range` 模式维护 `start` / `end` 两端日期，`numberOfMonths` 可同时展示双月日历：

::component-code
---
name: MDatePicker
props:
  range: true
  numberOfMonths: 2
---
::

### 多月份日历面板

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

### 可清空选择

`clearable` 在已有值时显示清除入口，点击后重置且不展开日历：

::component-code
---
name: MDatePicker
props:
  clearable: true
---
::

### 默认快捷预设

`presets` 设为 `default` 会按当前模式自动生成「今天」「本周」「本月」等快捷项：

::component-code
---
name: MDatePicker
props:
  range: true
  presets: default
  placeholder: 选择范围
---
::

### 自定义按钮

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
---
::

## 示例

### 多日期选择

`multiple` 模式将多个日期保存在数组中，按钮文案可根据已选数量动态展示：

::component-example
---
name: ComponentsDatePickerMultipleExample
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
