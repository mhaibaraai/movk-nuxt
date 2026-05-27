---
title: SearchForm
description: Schema 驱动的可折叠搜索表单组件。
category: form
seo:
  title: SearchForm
  description: A schema-driven, collapsible search form with grid layout, search/reset actions and auto row collapsing.
---

## 简介

`MSearchForm` 是一个 Schema 驱动的搜索表单组件，内置网格布局、搜索 / 重置按钮和折叠行为。当搜索项较多时，超出可见行数的字段会自动折叠，用户可点击展开 / 收起按钮查看全部搜索项。

::callout{color="neutral" to="/docs/auto-form/quickstart"}
复用 AutoForm 基础设施（schema 内省、控件映射、字段渲染器），通过 Zod schema 定义搜索字段。
::

## 用法

按 AutoForm schema 渲染字段，`cols` 控制栅格，内置搜索与重置按钮；点「搜索」触发校验并发出 `@submit`：

::component-example
---
name: ComponentsSearchFormBasicExample
---
::

### `v-model` 绑定

`v-model` 双向绑定表单数据，传入的初始值会被记录为重置基准：点「重置」恢复到该初始值而非清空。

::component-example
---
name: ComponentsSearchFormModelExample
---
::

### `cols` 网格列数

`cols` 控制网格列数：传数字固定列数，传断点对象则列数随窗口宽度在 `sm`、`md`、`lg`、`xl` 间切换。

::component-example
---
name: ComponentsSearchFormColsExample
options:
  - name: cols
    label: cols
    items: [1, 2, 3, 4]
    default: 4
---
::

::component-example
---
name: ComponentsSearchFormResponsiveExample
---
::

### `visibleRows` 折叠行为

`visibleRows` 控制可见行数，超出的字段折叠到展开区。下方拖动 `cols`、`visibleRows` 实时改变折叠阈值。

::component-example
---
name: ComponentsSearchFormExpandExample
options:
  - name: visibleRows
    label: visibleRows
    items: [1, 2, 3]
    default: 1
  - name: cols
    label: cols
    items: [2, 3, 4]
    default: 3
---
::

### `expanded` 受控展开

`v-model:expanded` 接管展开状态，优先级高于 `defaultExpanded`，可由外部按钮或逻辑驱动。

::component-example
---
name: ComponentsSearchFormExpandedControlledExample
---
::

### `expandText` / `collapseText` / `icon` 展开按钮

`expandText`、`collapseText` 自定义展开 / 收起文案，`icon` 切换按钮图标，`collapseButtonProps` 透传按钮属性。

::component-example
---
name: ComponentsSearchFormToggleButtonExample
options:
  - name: icon
    label: icon
    default: 'i-lucide-chevron-down'
  - name: expandText
    label: expandText
    default: '更多筛选'
  - name: collapseText
    label: collapseText
    default: '收起'
---
::

### `actions` 操作按钮

`actions` 数组扩展或裁剪按钮：

- 内置 `key: search` 自动绑定提交，`key: reset` 自动绑定重置
- 自定义 `key` 需提供 `onClick(ctx)`，`ctx` 含 `state`、`errors`、`search`、`reset`、`clear`、`toggle`、`loading`、`expanded`
- 传 `actions: []` 关闭所有内置按钮，配合 `actions` slot 完全自定义

::component-example
---
name: ComponentsSearchFormHideButtonsExample
prettier: true
collapse: true
---
::

::component-example
---
name: ComponentsSearchFormCustomExample
prettier: true
collapse: true
---
::

## 示例

### 接管操作区

`#actions` 插槽暴露 `search`、`clear`、`loading`，可用自定义按钮替换默认操作区：

::component-example
---
name: ComponentsSearchFormActionsSlotExample
prettier: true
---
::

### 扩展布局区域

`header`、`footer`、`extraActions` 插入辅助内容，slot props 随展开与表单值更新：

::component-example
---
name: ComponentsSearchFormLayoutSlotsExample
prettier: true
---
::

### 异步提交与校验

`loading` 控制按钮加载态，`@error` 返回 Zod 校验失败的错误列表：

::component-example
---
name: ComponentsSearchFormAsyncExample
prettier: true
---
::

## API

### Props

:component-props{slug="MSearchForm"}

### Emits

:component-emits{slug="MSearchForm"}

::note
`@submit` 转发自底层 `UForm`，未列入上表。校验通过后触发，返回 `FormSubmitEvent`，搜索条件位于 `event.data`——这是接收查询参数的主要出口。
::

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
