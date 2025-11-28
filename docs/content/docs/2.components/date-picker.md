---
title: DatePicker
description: 基于国际化标准的日期选择器组件
category: advanced
---

## 简介

`MDatePicker` 是一个功能强大的日期选择器组件，基于 `@internationalized/date` 提供国际化日期处理能力。支持单日期、日期范围、多日期选择等多种模式，并提供丰富的日期验证和格式化选项。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/calendar"}
基于 Nuxt UI 的 Calendar 组件封装
::

::note{to="https://react-spectrum.adobe.com/internationalized/date/index.html"}
使用 `@internationalized/date` 库进行日期处理，确保时区安全和国际化支持。
::

## 基础用法

最基础的日期选择器：

::component-example
---
name: 'components-date-picker-basic-example'
---
::

## 日期范围

通过 `range` 启用范围选择模式：

::component-example
---
name: 'components-date-picker-range-example'
---
::

## 多日期选择

通过 `multiple` 启用多选模式：

::component-example
---
name: 'components-date-picker-multiple-example'
---
::

## 日期限制

限制可选日期范围：

::component-example
---
name: 'components-date-picker-validation-example'
---
::

## 禁用特定日期

使用 `isDateUnavailable` 禁用特定日期：

::component-example
---
name: 'components-date-picker-unavailable-example'
---
::

## 格式化显示

支持多种日期格式输出：

::component-example
---
name: 'components-date-picker-format-example'
---
::

## 多月份显示

通过 `numberOfMonths` 同时显示多个月份的日历：

::component-example
---
name: 'components-date-picker-months-example'
---
::

## 自定义按钮

通过 `buttonProps` 自定义按钮样式：

::component-example
---
name: 'components-date-picker-button-example'
---
::

## API

### Props

:component-props{slug="MDatePicker"}

### Emits

:component-emits{slug="MDatePicker"}

### Slots

:component-slots{slug="MDatePicker"}

## Changelog

:commit-changelog{prefix="/components"}
