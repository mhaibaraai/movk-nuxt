---
title: WithCharacterLimit
description: 带字符数限制和计数显示的输入框组件。
category: input
seo:
  title: WithCharacterLimit
  description: An input with character limit and live counter display, built on the Nuxt UI input.
---

## 简介

`MWithCharacterLimit` 是一个带有字符数限制和实时计数显示的输入框组件。在输入框右侧实时显示当前字符数和最大字符限制，帮助用户控制输入长度。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
基于 Nuxt UI 的 Input 组件封装
::

## 基础用法

默认限制 50 个字符，右侧实时显示已输入与上限：

::component-code
---
name: MWithCharacterLimit
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 最多输入字符...
---
::

### `maxLength` 限制

通过 `maxLength` 设置最大字符数：

::component-code
---
name: MWithCharacterLimit
props:
  maxLength: 10
---
::

### `leadingIcon` 图标

通过 `leadingIcon` 为输入框添加语义化图标：

::component-code
---
name: MWithCharacterLimit
props:
  leadingIcon: i-lucide-message-square
---
::

### `size` 尺寸

通过 `size` 切换输入框与计数器尺寸：

::component-code
---
name: MWithCharacterLimit
props:
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `ui` 样式

通过 `ui.counter` 自定义计数器样式：

::component-code
---
name: MWithCharacterLimit
prettier: true
props:
  maxLength: 100
  ui:
    counter: text-success
---
::

## API

### Props

:component-props{slug="MWithCharacterLimit"}

### Emits

:component-emits{slug="MWithCharacterLimit"}

### Slots

:component-slots{slug="MWithCharacterLimit"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
