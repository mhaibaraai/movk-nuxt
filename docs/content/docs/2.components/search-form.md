---
title: SearchForm
description: Schema 驱动的可折叠搜索表单组件
category: form
---

## 简介

`MSearchForm` 是一个 Schema 驱动的搜索表单组件，内置网格布局、搜索/重置按钮和折叠行为。当搜索项较多时，超出可见行数的字段会自动折叠，用户可以点击展开/收起按钮查看全部搜索项。

复用 AutoForm 的底层基础设施（schema 内省、控件映射、字段渲染器），支持通过 Zod schema 定义搜索字段。

## 基础用法

最简单的搜索表单，3 列布局，超出 1 行的字段自动折叠：

::component-example
---
name: 'components-search-form-basic-example'
---
::

## 多列布局

通过 `cols` 属性控制网格列数：

::component-example
---
name: 'components-search-form-cols-example'
---
::

## 折叠行为

通过 `visibleRows` 控制可见行数，`defaultExpanded` 设置默认展开状态：

::component-example
---
name: 'components-search-form-expand-example'
---
::

## 按钮显隐

通过 `showSearchButton` / `showResetButton` 控制按钮显隐，配合 `actions` slot 可完全自定义按钮区域：

::component-example
---
name: 'components-search-form-hide-buttons-example'
---
::

## 自定义按钮

自定义按钮文本和样式：

::component-example
---
name: 'components-search-form-custom-example'
---
::

## 响应式列数

`cols` 支持响应式对象，根据屏幕宽度自动调整列数：

::component-example
---
name: 'components-search-form-responsive-example'
---
::

## API

### Props

:component-props{slug="MSearchForm"}

### Emits

:component-emits{slug="MSearchForm"}

### Slots

:component-slots{slug="MSearchForm"}

### Expose

您可以通过 [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) 访问该类型化组件实例。

| Name | Type |
| ---- | ---- |
| `formRef`{lang="ts-type"} | `Ref<InstanceType<typeof UForm>>`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>UForm 组件引用</p> |
| `reset()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>重置表单到初始状态</p> |
| `clear()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>清空表单所有字段</p> |
| `expanded`{lang="ts-type"} | `Ref<boolean>`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>当前展开/收起状态</p> |
| `toggle()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>切换展开/收起</p> |

## Changelog

:commit-changelog{prefix="/components"}
