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

## 基础用法

最简单的清除功能输入框：

::component-example
---
name: 'components-with-clear-basic-example'
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
    default: 'i-lucide-user'
---
::

## 带图标

为输入框添加语义化图标：

::component-example
---
name: 'components-with-clear-icon-example'
options:
  - name: 'size'
    label: 'size'
    items: ['xs', 'sm', 'md', 'lg', 'xl']
    default: 'md'
  - name: 'leadingIcon'
    label: 'leadingIcon'
    default: 'i-lucide-mail'
---
::

## 搜索框

常用于搜索场景，快速清除搜索关键词：

::component-example
---
name: 'components-with-clear-search-example'
options:
  - name: 'size'
    label: 'size'
    items: ['xs', 'sm', 'md', 'lg', 'xl']
    default: 'lg'
  - name: 'leadingIcon'
    label: 'leadingIcon'
    default: 'i-lucide-search'
---
::

## 清除事件

通过 `@clear` 事件监听清除操作：

::component-example
---
name: 'components-with-clear-event-example'
options:
  - name: 'size'
    label: 'size'
    items: ['xs', 'sm', 'md', 'lg', 'xl']
    default: 'md'
  - name: 'leadingIcon'
    label: 'leadingIcon'
    default: 'i-lucide-search'
---
::

## 自定义按钮

通过 `buttonProps` 自定义清除按钮样式：

::component-example
---
name: 'components-with-clear-custom-example'
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
