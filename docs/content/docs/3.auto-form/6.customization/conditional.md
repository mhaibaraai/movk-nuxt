---
title: 条件渲染
description: 根据表单状态动态显示或隐藏字段，创建智能响应式表单。
---

## 基本概念

::note
AutoForm 提供了两种条件渲染方式：
- **`hidden`** - 隐藏字段（字段仍存在于 DOM 中）
- **`if`** - 条件渲染（不满足条件时字段不会创建）
::

## 基础用法

根据账户类型显示不同的字段集：

::component-example
---
name: 'auto-form-advanced-conditional-example'
props:
  class: 'px-4'
---
::
