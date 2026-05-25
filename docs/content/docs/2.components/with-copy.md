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

最简单的复制功能输入框：

::component-example
---
name: 'components-with-copy-basic-example'
options:
  - name: 'size'
    label: 'size'
    items: ['xs', 'sm', 'md', 'lg', 'xl']
    default: 'md'
  - name: 'color'
    label: 'color'
    items: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
    default: 'primary'
  - name: 'variant'
    label: 'variant'
    items: ['outline', 'soft', 'subtle', 'ghost', 'none']
    default: 'outline'
  - name: 'leadingIcon'
    label: 'leadingIcon'
    default: 'i-lucide-key'
---
::

## 带图标

为输入框添加语义化图标：

::component-example
---
name: 'components-with-copy-icon-example'
options:
  - name: 'size'
    label: 'size'
    items: ['xs', 'sm', 'md', 'lg', 'xl']
    default: 'md'
  - name: 'leadingIcon'
    label: 'leadingIcon'
    default: 'i-lucide-key'
---
::

## 自定义样式

通过 `buttonProps` 自定义复制按钮样式：

::component-example
---
name: 'components-with-copy-custom-example'
---
::

## 复制事件

通过 `@copy` 事件监听复制操作：

::component-example
---
name: 'components-with-copy-event-example'
options:
  - name: 'size'
    label: 'size'
    items: ['xs', 'sm', 'md', 'lg', 'xl']
    default: 'md'
  - name: 'leadingIcon'
    label: 'leadingIcon'
    default: 'i-lucide-clipboard'
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
