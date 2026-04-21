---
title: Popconfirm
description: 基于气泡弹出层的操作确认组件
category: feedback
---

## 简介

`MPopconfirm` 是一个气泡式确认组件，在用户执行危险或不可逆操作前弹出确认气泡。支持同步与异步确认回调，并完整透传 `UPopover` 的所有定位参数。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/popover"}
基于 Nuxt UI 的 Popover 组件封装
::

## 基础用法

将触发元素放入默认 slot，通过 `:on-confirm` 传入确认回调：

::component-example
---
name: 'components-popconfirm-basic-example'
---
::

## 异步确认

`:on-confirm` 支持返回 `Promise`，期间按钮显示 loading 状态：

::component-example
---
name: 'components-popconfirm-async-example'
---
::

## 自定义外观

自定义图标、按钮颜色和文本：

::component-example
---
name: 'components-popconfirm-custom-example'
---
::

## 禁用取消按钮

通过 `:cancel-button="false"` 隐藏取消按钮，强制用户确认：

::component-example
---
name: 'components-popconfirm-no-cancel-example'
---
::

## 弹出方向

通过 `:content="{ side: 'top' }"` 透传 Popover 定位参数：

::component-example
---
name: 'components-popconfirm-side-example'
---
::

## API

### Props

:component-props{slug="MPopconfirm"}

### Emits

:component-emits{slug="MPopconfirm"}

### Slots

:component-slots{slug="MPopconfirm"}

## Changelog

:commit-changelog{prefix="components"}
