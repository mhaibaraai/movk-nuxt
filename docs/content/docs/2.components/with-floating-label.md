---
title: WithFloatingLabel
description: 带浮动标签和清除按钮的输入框组件。
category: input
seo:
  title: WithFloatingLabel
  description: An input with a floating label and clear button, built on the Nuxt UI input.
---

## 简介

`MWithFloatingLabel` 是一个带有浮动标签效果的输入框组件。标签在输入框为空时居中显示为占位符，聚焦或有内容时自动上浮，同时内置清除按钮，有内容时右侧自动显示。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
基于 Nuxt UI 的 Input 组件封装
::

## 基础用法

标签在空值时居中显示，聚焦或有内容时自动上浮：

::component-code
---
name: MWithFloatingLabel
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: test@example.com
  label: 邮箱地址
---
::

### `leadingIcon` 图标

通过 `leadingIcon` 为输入框添加前置图标：

::component-code
---
name: MWithFloatingLabel
props:
  label: 用户名
  leadingIcon: i-lucide-user
---
::

### `size` 尺寸

通过 `size` 切换输入框与标签尺寸：

::component-code
---
name: MWithFloatingLabel
props:
  label: 尺寸演示
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `clearButtonProps`

::component-code
---
name: MWithFloatingLabel
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: test@example.com
  label: 邮箱地址
  ui:
    label: text-warning
  clearButtonProps:
    color: error
    icon: i-lucide-x
items:
  clearButtonProps.color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

## 示例

### 清除事件

通过 `@clear` 事件监听清除操作：

::component-example
---
name: ComponentsWithFloatingLabelClearExample
---
::

## API

### Props

:component-props{slug="MWithFloatingLabel"}

### Emits

:component-emits{slug="MWithFloatingLabel"}

### Slots

:component-slots{slug="MWithFloatingLabel"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
