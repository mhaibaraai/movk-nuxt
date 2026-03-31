---
title: WithFloatingLabel
description: 带浮动标签和清除按钮的输入框组件
category: input
---

## 简介

`MWithFloatingLabel` 是一个带有浮动标签效果的输入框组件。标签在输入框为空时居中显示为占位符，聚焦或有内容时自动上浮，同时内置清除按钮，有内容时右侧自动显示。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
基于 Nuxt UI 的 Input 组件封装
::

## 基础用法

最简单的浮动标签输入框：

::component-example
---
name: 'components-with-floating-label-basic-example'
---
::

## 带图标

为输入框添加前置图标：

::component-example
---
name: 'components-with-floating-label-icon-example'
---
::

## 清除事件

通过 `@clear` 事件监听清除操作：

::component-example
---
name: 'components-with-floating-label-clear-example'
---
::

## 自定义样式

通过 `labelClass` 和 `clearButtonProps` 自定义标签与清除按钮：

::component-example
---
name: 'components-with-floating-label-custom-example'
---
::

## 表单场景

结合表单字段使用：

::component-example
---
name: 'components-with-floating-label-form-example'
---
::

## API

### Props

:component-props{slug="MWithFloatingLabel"}

### Emits

:component-emits{slug="MWithFloatingLabel"}

### Slots

:component-slots{slug="MWithFloatingLabel"}

## Changelog

:commit-changelog{prefix="components/input"}
