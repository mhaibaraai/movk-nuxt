---
title: WithCharacterLimit
description: 带字符数限制和计数显示的输入框组件
category: input
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
---
::

## 自定义限制

通过 `maxLength` 设置最大字符数：

::component-example
---
name: 'components-with-character-limit-custom-example'
---
::

## 带图标

为输入框添加语义化图标：

::component-example
---
name: 'components-with-character-limit-icon-example'
---
::

## 不同尺寸

支持多种尺寸：

::component-example
---
name: 'components-with-character-limit-size-example'
---
::

## 自定义计数器样式

通过 `counterClass` 自定义计数器样式：

::component-example
---
name: 'components-with-character-limit-counter-example'
---
::

## 表单场景

在表单字段中限制输入长度：

::component-example
---
name: 'components-with-character-limit-form-example'
---
::

## API

### Props

:component-props{slug="MWithCharacterLimit"}

### Emits

:component-emits{slug="MWithCharacterLimit"}

### Slots

:component-slots{slug="MWithCharacterLimit"}

## Changelog

:commit-changelog{prefix="/components/input"}
