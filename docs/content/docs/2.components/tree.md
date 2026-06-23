---
title: Tree
description: 基于 Nuxt UI Tree 的树形组件，补齐搜索、懒加载、工具栏、复选框与父子策略。
category: advanced
seo:
  title: Tree
  description: A tree component built on Nuxt UI Tree, adding search filtering with highlight, async lazy loading, a toolbar, cascading checkboxes, parent/child strategy, key-based binding and an imperative API.
---

## 简介

`MTree` 在 Nuxt UI `Tree` 之上做薄壳封装，透传其全部 props、事件与插槽，并补齐多项增强能力：搜索过滤与高亮、异步懒加载、工具栏（展开/折叠切换、三态全选）、复选框多选与父子策略（级联 / 互不关联）、键绑定（`v-model:selectedKeys`）以及命令式 API 与选中分类。树形数据的归一化、过滤、遍历等运算复用 `@movk/core` 的 `Tree` 工具方法。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/tree"}
基于 Nuxt UI 的 Tree 组件构建，原生 props 与插槽完全透传
::

## 用法

传入 `items` 渲染层级结构，节点 `defaultExpanded` 控制初始展开，`v-model` 绑定选中节点：

::component-example
---
name: ComponentsTreeBasicExample
---
::

### `defaultExpanded` 默认展开

`defaultExpanded` 作用：以策略推导初始展开的父节点，缺省回退节点上的 `defaultExpanded` 标记。传 `true` 展开全部父级、传 `number` 仅展开 depth 小于该值的父级、传函数按节点与深度自定义：

::component-example
---
name: ComponentsTreeDefaultExpandedExample
---
::

### `searchable` 搜索过滤

`searchable` 作用：在顶部渲染搜索框，按关键字剪枝并保留命中节点的祖先链；`highlight` 默认开启，高亮命中文本，命中后自动展开。`filter` 可自定义匹配谓词，`search` 支持 `v-model:search` 双向绑定关键字：

::component-example
---
name: ComponentsTreeSearchExample
---
::

### `checkable` 复选框级联

`checkable` 作用：在节点前渲染复选框，内部启用 `multiple` 与父子级联、子级半选冒泡，`v-model` 收集选中节点数组。复选框与节点 `icon`、父节点 folder 图标共存：

::component-example
---
name: ComponentsTreeCheckableExample
---
::

::note
`checkable` 等价于 `multiple` + `strategy`（默认 `cascade`）的语法糖。仅需多选而不渲染复选框时改用 `multiple`。
::

### `multiple` 多选

`multiple` 作用：开启多选但不渲染复选框，点击节点累加选中，`v-model` 收集选中节点数组：

::component-example
---
name: ComponentsTreeMultipleExample
---
::

### `strategy` 父子策略

`strategy` 作用：控制多选 / `checkable` 下的父子勾选关系。`cascade`（默认）父子级联且子级全选时回填父级，`isolated` 父子互不关联、半选不冒泡：

::component-example
---
name: ComponentsTreeStrategyExample
---
::

### `selectedKeys` 键绑定

`selectedKeys` 作用：以节点 key 数组双向绑定选中，适合从后端回显或与路由同步。`v-model:selectedKeys` 与 `v-model` 互通，键由 `getKey` / `labelKey` 派生：

::component-example
---
name: ComponentsTreeSelectedKeysExample
---
::

### `toolbar` 工具栏

`toolbar` 作用：渲染顶部工具栏，提供展开 / 折叠切换按钮；`searchable` 时内嵌可清除的搜索框，`checkable` 时附带三态全选复选框与选中计数：

::component-example
---
name: ComponentsTreeToolbarExample
---
::

::note
工具栏的全选计数按**叶子**计：级联下选中父级会带上子级 key，按叶子统计可避免重复计数。
::

### `lazy` 异步懒加载

`lazy` 作用：配合 `loadChildren`，展开未加载的父节点时拉取子节点并显示加载态；节点 `isLeaf` 标记为叶子，不渲染展开占位：

::component-example
---
name: ComponentsTreeLazyExample
---
::

### `childrenKey` 字段映射

`childrenKey` 作用：将后端的子节点字段归一化为 `children`，`labelKey` 指定展示字段，无需预先改造数据结构：

::component-example
---
name: ComponentsTreeFieldExample
---
::

### `virtualize` 虚拟滚动

`virtualize` 作用：透传 Nuxt UI Tree 的虚拟化能力，仅渲染可视区节点，适配大数据量树：

::component-example
---
name: ComponentsTreeVirtualizeExample
---
::

### `disabled` 禁用

`disabled` 作用：禁用整棵树，同时阻断点击节点、工具栏控件与复选框的展开、折叠、选中操作；节点级 `item.disabled` 单独禁用该节点的复选框：

::component-example
---
name: ComponentsTreeDisabledExample
---
::

::note
命令式 API（`expandToDepth`、`selectAll` 等）属显式调用，不受 `disabled` 影响；`disabled` 仅拦截用户的点击与工具栏交互。
::

## 示例

### 自定义节点

通过透传的 `item-trailing` 等插槽自定义节点内容，未覆盖的插槽仍由 Nuxt UI Tree 默认渲染：

::component-example
---
name: ComponentsTreeSlotExample
---
::

### 自定义工具栏

`toolbar-leading` / `toolbar-trailing` 在默认工具栏首尾追加内容；需要完全接管时改用 `#toolbar` 插槽，其作用域暴露 `toggleExpand`、`selectAll`、`clear`、`selectionSummary` 等方法与状态：

::component-example
---
name: ComponentsTreeCustomToolbarExample
---
::

### 命令式控制

通过 `useTemplateRef` 拿到组件实例，调用 `expandToDepth`、`collapseAll`、`selectAll`、`clearSelection` 等方法控制树：

::component-example
---
name: ComponentsTreeImperativeExample
---
::

### 选中结果分类

实例的 `treeSelection` 反应式回传选中分类：`leaves`（选中叶子）、`parents`（满选父级）、`halfSelected`（半选父级）、`strictlyChecked`（剔除随父级联的子节点）：

::component-example
---
name: ComponentsTreeSelectionExample
---
::

## API

### Props

:component-props{slug="MTree"}

### Emits

:component-emits{slug="MTree"}

::tip
除透传 Nuxt UI Tree 的 `update:modelValue`、`update:expanded` 外，`MTree` 额外提供：

- `update:search`：搜索关键字变化时触发，支持 `v-model:search`。
- `update:selectedKeys`：选中 key 列表变化时触发，支持 `v-model:selectedKeys`。
- `change`：选中变化时触发，载荷为 `{ value, keys, selection }`，`keys` 由 `getKey`/`labelKey` 派生，`selection` 为选中结果分类。
::

### Slots

:component-slots{slug="MTree"}

### Expose

您可以通过 [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) 访问该类型化组件实例。

| Name | Type |
| ---- | ---- |
| `expandAll()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>展开全部可展开节点</p> |
| `collapseAll()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>收起全部节点</p> |
| `expandToDepth(depth)`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>展开到指定层级，`depth=0` 收起全部</p> |
| `selectAll()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>选中全部可选节点</p> |
| `clearSelection()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>清空选中</p> |
| `treeSelection`{lang="ts-type"} | `TreeSelectionResult`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>当前选中结果分类（`selected` / `leaves` / `parents` / `halfSelected` / `strictlyChecked`）</p> |

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
