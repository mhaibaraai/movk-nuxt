---
title: MessageBox
description: 模态消息对话框，支持 primary / info / success / warning / error 五种类型
category: feedback
---

## 简介

`MMessageBox` 是一个模态对话框组件，适用于重要通知或需要用户明确确认的场景。提供 `alert` 和 `confirm` 两种模式，内置五种语义化类型（primary / info / success / warning / error），并支持通过 `useMessageBox()` 进行编程式调用。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/modal"}
基于 Nuxt UI 的 Modal 组件封装
::

## Alert 模式

`alert` 模式仅提供确认按钮，用于展示通知消息：

::component-example
---
name: 'components-message-box-alert-example'
---
::

## Confirm 模式

`confirm` 模式提供取消和确认两个按钮，用于危险操作前的二次确认：

::component-example
---
name: 'components-message-box-confirm-example'
---
::

## 五种 type

通过 `type` 属性设置语义化类型，影响图标和默认按钮颜色。默认值为 `primary`，更适合通用提示：

::component-example
---
name: 'components-message-box-types-example'
---
::

## 编程式用法

使用 `useMessageBox()` 在任意逻辑中调用对话框，`confirm()` 返回 `Promise<boolean>`：

::component-example
---
name: 'components-message-box-programmatic-example'
---
::

## API

### Props

:component-props{slug="MMessageBox"}

### Emits

:component-emits{slug="MMessageBox"}

## Changelog

:commit-changelog{prefix="components"}
