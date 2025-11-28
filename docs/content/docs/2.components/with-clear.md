---
title: WithClear
description: 带清除按钮的输入框组件
category: input
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
---
::

## 带图标

为输入框添加语义化图标：

::component-example
---
name: 'components-with-clear-icon-example'
---
::

## 搜索框

常用于搜索场景，快速清除搜索关键词：

::component-example
---
name: 'components-with-clear-search-example'
---
::

## 清除事件

通过 `@clear` 事件监听清除操作：

::component-example
---
name: 'components-with-clear-event-example'
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

## Changelog

:commit-changelog{prefix="/components/input"}
