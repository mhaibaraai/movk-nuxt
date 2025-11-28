---
title: WithCharacterLimit
description: 带字符数限制和计数显示的输入框组件
---

## 简介

`MWithCharacterLimit` 是一个带有字符数限制和实时计数显示的输入框组件。在输入框右侧实时显示当前字符数和最大字符限制，帮助用户控制输入长度。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
基于 Nuxt UI 的 Input 组件封装
::

## 基础用法

默认限制 50 个字符：

::component-example
---
name: 'components-with-character-limit-basic-example'
collapse: true
props:
  class: 'px-4'
---
::

## 自定义限制

通过 `maxLength` 设置最大字符数：

::component-example
---
name: 'components-with-character-limit-custom-example'
collapse: true
props:
  class: 'px-4'
---
::

## 带图标

为输入框添加语义化图标：

::component-example
---
name: 'components-with-character-limit-icon-example'
collapse: true
props:
  class: 'px-4'
---
::

## 不同尺寸

支持多种尺寸：

::component-example
---
name: 'components-with-character-limit-size-example'
collapse: true
props:
  class: 'px-4'
---
::

## 自定义计数器样式

通过 `counterClass` 自定义计数器样式：

::component-example
---
name: 'components-with-character-limit-counter-example'
collapse: true
props:
  class: 'px-4'
---
::

## 表单场景

在表单字段中限制输入长度：

::component-example
---
name: 'components-with-character-limit-form-example'
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
| `maxLength` | `number` | `50` | 最大字符数限制 |
| `counterClass` | `string` | `''` | 计数器的自定义样式类名 |

### Emits

继承自 [UInput](https://ui.nuxt.com/docs/components/input#emits) 的所有事件。

### Slots

继承 UInput 的所有插槽，除了 `trailing` 插槽（被计数器占用）。

## 无障碍支持

组件内置了完善的无障碍支持：

- `maxlength` 属性：浏览器原生限制输入长度
- `aria-describedby`: 关联字符计数器
- `role="status"`: 标记计数器为动态状态信息
- `aria-live="polite"`: 让屏幕阅读器播报字符数变化

## 使用场景

- **用户评论**：限制评论长度，避免过长内容
- **社交媒体**：类似 Twitter 的字数限制
- **表单输入**：用户名、标题等需要控制长度的字段
- **短信/消息**：模拟短信字数限制的输入体验
- **SEO 优化**：限制 Meta 描述、标题等字段长度
