---
title: WithCopy
description: 带复制功能的输入框组件。
category: input
seo:
  title: WithCopy
  description: An input with a copy-to-clipboard button, built on the Nuxt UI input.
---

## 简介

`WithCopy` 是一个带有一键复制功能的输入框组件。当输入框有内容时，会在右侧显示一个复制按钮，点击可快速复制输入框中的内容到剪贴板。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
基于 Nuxt UI 的 Input 组件封装
::

## 基础用法

右侧复制按钮一键复制内容到剪贴板：

::component-code
---
name: MWithCopy
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: sk-1234567890abcdef
---
::

### `leadingIcon` 图标

通过 `leadingIcon` 为输入框添加语义化图标：

::component-code
---
name: MWithCopy
props:
  leadingIcon: i-lucide-key
---
::

### `size` 尺寸

通过 `size` 切换输入框与复制按钮尺寸：

::component-code
---
name: MWithCopy
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ABC123XYZ
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `buttonProps`

通过 `buttonProps` 自定义复制按钮样式：

::component-code
---
name: MWithCopy
prettier: true
props:
  modelValue: ABC123XYZ
  buttonProps:
    variant: soft
    color: primary
items:
  buttonProps.variant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
  buttonProps.color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

## 示例

### 复制事件

通过 `@copy` 事件监听复制操作：

::component-example
---
name: ComponentsWithCopyEventExample
---
::

## API

### Props

:component-props{slug=MWithCopy}

### Emits

:component-emits{slug=MWithCopy}

### Slots

:component-slots{slug=MWithCopy}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
