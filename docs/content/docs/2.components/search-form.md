---
title: SearchForm
description: Schema 驱动的可折叠搜索表单组件。
category: form
seo:
  title: SearchForm
  description: A schema-driven, collapsible search form with grid layout, search/reset actions and auto row collapsing.
---

## 简介

`MSearchForm` 是一个 Schema 驱动的搜索表单组件，内置网格布局、搜索 / 重置按钮和折叠行为。当搜索项较多时，超出可见行数的字段会自动折叠，用户可以点击展开 / 收起按钮查看全部搜索项。

复用 AutoForm 的底层基础设施（schema 内省、控件映射、字段渲染器），通过 Zod schema 定义搜索字段。

## 基础用法

按 AutoForm schema 渲染字段，`cols` 控制栅格，内置搜索与重置按钮：

::component-example
---
name: ComponentsSearchFormBasicExample
---
::

### v-model 绑定

通过 `v-model` 双向绑定表单数据。传入的初始值会被组件记录为重置基准——点击「重置」按钮时恢复到初始值而非清空：

::component-example
---
name: ComponentsSearchFormModelExample
---
::

### 多列布局

通过 `cols` 属性控制网格列数：

::component-example
---
name: ComponentsSearchFormColsExample
---
::

### 折叠行为

通过 `visibleRows` 控制可见行数，`defaultExpanded` 设置默认展开状态：

::component-example
---
name: ComponentsSearchFormExpandExample
---
::

### 响应式列数

`cols` 接收断点对象，列数随窗口宽度在 `sm`、`md`、`lg`、`xl` 间切换：

::component-example
---
name: ComponentsSearchFormResponsiveExample
---
::

### 自定义 actions

通过 `actions` 数组扩展或裁剪按钮：

- 内置 `key: 'search'` 自动绑定提交，`key: 'reset'` 自动绑定重置
- 自定义 `key` 需提供 `onClick(ctx)`，`ctx` 中含 `state / errors / search / reset / clear / toggle / loading / expanded`
- 传 `actions: []` 关闭所有内置按钮，配合 `actions` slot 完全自定义

::component-example
---
name: ComponentsSearchFormHideButtonsExample
---
::

::component-example
---
name: ComponentsSearchFormCustomExample
---
::

## 示例

### 接管操作区

`#actions` 插槽暴露 `search`、`clear`、`loading`，可用自定义按钮替换默认操作区：

::component-example
---
name: ComponentsSearchFormActionsSlotExample
---
::

### 扩展布局区域

`header`、`footer`、`extraActions` 插入辅助内容，slot props 随展开与表单值更新：

::component-example
---
name: ComponentsSearchFormLayoutSlotsExample
---
::

### 异步提交与校验

`loading` 控制按钮加载态，`@error` 返回 Zod 校验失败的错误列表：

::component-example
---
name: ComponentsSearchFormAsyncExample
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
| `submit()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>程序化触发表单提交（等价于点击 search 按钮）</p> |
| `reset()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>恢复到 baseline（首次挂载的 v-model 快照），并触发 `reset` 事件</p> |
| `clear()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>清空表单所有字段为空值，并触发 `clear` 事件</p> |
| `setBaseline(value?)`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>设置 `reset()` 的恢复基准；不传参时使用当前 v-model 值</p> |
| `expanded`{lang="ts-type"} | `ComputedRef<boolean>`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>当前展开 / 收起状态</p> |
| `toggle()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>切换展开 / 收起，并 emit `expand` 与 `update:expanded`</p> |

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
