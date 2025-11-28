---
title: WithClear
description: 带清除按钮的输入框组件
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
collapse: true
props:
  class: 'px-4'
---
::

## 带图标

为输入框添加语义化图标：

::component-example
---
name: 'components-with-clear-icon-example'
collapse: true
props:
  class: 'px-4'
---
::

## 搜索框

常用于搜索场景，快速清除搜索关键词：

::component-example
---
name: 'components-with-clear-search-example'
collapse: true
props:
  class: 'px-4'
---
::

## 清除事件

通过 `@clear` 事件监听清除操作：

::component-example
---
name: 'components-with-clear-event-example'
collapse: true
props:
  class: 'px-4'
---
::

## 自定义按钮

通过 `buttonProps` 自定义清除按钮样式：

::component-example
---
name: 'components-with-clear-custom-example'
collapse: true
props:
  class: 'px-4'
---
::

## API

### Props

继承自 [UInput](https://ui.nuxt.com/docs/components/input#props) 的所有属性，并扩展：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `buttonProps` | `ButtonProps` | - | 自定义清除按钮的属性 |

### Emits

继承自 [UInput](https://ui.nuxt.com/docs/components/input#emits) 的所有事件，并扩展：

| 事件 | 参数 | 说明 |
|------|------|------|
| `clear` | - | 清除内容时触发 |

### Slots

继承 UInput 的所有插槽，除了 `trailing` 插槽（被清除按钮占用）。

## 使用场景

- **搜索框**：方便用户快速清除搜索关键词重新输入
- **表单输入**：在填写表单时快速清空错误输入
- **筛选器**：清除筛选条件恢复默认状态
- **临时数据**：快速清除不需要保存的临时输入
