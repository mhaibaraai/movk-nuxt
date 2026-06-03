---
title: WithClear
description: 带清除按钮的输入框组件。
category: input
seo:
  title: WithClear
  description: An input with a clear button, built on the Nuxt UI input.
---

## 简介

`MWithClear` 是一个带有一键清除功能的输入框组件。当输入框有内容时，会在右侧显示一个清除按钮（×），点击可快速清空输入框内容。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
基于 Nuxt UI 的 Input 组件封装
::

## 用法

有内容时右侧自动显示清除按钮：

::component-code
---
name: MWithClear
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 张三
---
::

### `leadingIcon` 前置图标

通过 `leadingIcon` 为输入框添加语义化图标：

::component-code
---
name: MWithClear
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: user@example.com
  leadingIcon: i-lucide-mail
---
::

### `size` 尺寸

通过 `size` 切换输入框与清除按钮尺寸：

::component-code
---
name: MWithClear
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 内容
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `buttonProps` 清除按钮

通过 `buttonProps` 自定义清除按钮样式：

::component-code
---
name: MWithClear
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 一些内容
  buttonProps:
    color: error
    icon: i-lucide-x
---
::


## 示例

### 清除事件

通过 `@clear` 事件监听清除操作：

::component-example
---
name: ComponentsWithClearEventExample
---
::

## API

### Props

:component-props{slug="MWithClear"}

### Emits

:component-emits{slug="MWithClear"}

### Slots

:component-slots{slug="MWithClear"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
