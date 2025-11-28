---
title: WithCopy
description: 带复制功能的输入框组件
category: input
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
---
::

## 带图标

为输入框添加语义化图标：

::component-example
---
name: 'components-with-copy-icon-example'
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
---
::

## API

### Props

::note{to="https://ui.nuxt.com/docs/components/input#props"}
继承自 UInput 的所有属性
::

:component-props{slug=MWithCopy}

### Emits

继承自 [UInput](https://ui.nuxt.com/docs/components/input#emits) 的所有事件，并扩展：

| 事件 | 参数 | 说明 |
|------|------|------|
| `copy` | `(value: string)` | 复制内容时触发 |

### Slots

继承 UInput 的所有插槽，除了 `trailing` 插槽（被复制按钮占用）。

## 使用场景

- **API 密钥展示**：方便用户快速复制 Token、API Key 等凭证
- **分享链接**：一键复制分享 URL 或邀请码
- **代码片段**：复制配置项、命令行等技术内容
- **身份标识**：用户 ID、订单号等需要频繁复制的信息
