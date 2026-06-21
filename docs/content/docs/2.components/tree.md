---
title: Tree
description: 基于 Nuxt UI Tree 的树形组件，补齐搜索、懒加载、工具栏与复选框。
category: advanced
seo:
  title: Tree
  description: A tree component built on Nuxt UI Tree, adding search filtering with highlight, async lazy loading, a toolbar and cascading checkboxes, with custom children field mapping.
---

## 简介

`MTree` 在 Nuxt UI `Tree` 之上做薄壳封装，透传其全部 props、事件与插槽，并补齐四项增强能力：搜索过滤与高亮、异步懒加载、工具栏（展开/折叠、全选/清空）、复选框多选与级联。树形数据的归一化、过滤、遍历等运算复用 `@movk/core` 的 `Tree` 工具方法。

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

### `searchable` 搜索过滤

`searchable` 在顶部渲染搜索框，按关键字剪枝并保留命中节点的祖先链；`highlight` 默认开启，高亮命中文本，命中后自动展开。`filter` 可自定义匹配谓词，`search` 支持 `v-model:search` 双向绑定关键字：

::component-example
---
name: ComponentsTreeSearchExample
---
::

### `checkable` 复选框级联

`checkable` 在节点前渲染复选框，并内部启用 `multiple` 与父子级联、子级半选冒泡，`v-model` 收集选中节点数组：

::component-example
---
name: ComponentsTreeCheckableExample
---
::

### `toolbar` 工具栏

`toolbar` 提供展开全部、折叠全部按钮；`searchable` 时内嵌搜索框，`checkable` 时附带全选、清空。也可用 `#toolbar` 插槽完全自定义：

::component-example
---
name: ComponentsTreeToolbarExample
---
::

### `lazy` 异步懒加载

`lazy` 配合 `loadChildren`，展开未加载的父节点时拉取子节点并显示加载态；节点 `isLeaf` 标记为叶子，不渲染展开占位：

::component-example
---
name: ComponentsTreeLazyExample
---
::

### `childrenKey` 字段映射

`childrenKey` 将后端的子节点字段归一化为 `children`，`labelKey` 指定展示字段，无需预先改造数据结构：

::component-example
---
name: ComponentsTreeFieldExample
---
::

### `virtualize` 虚拟滚动

`virtualize` 透传 Nuxt UI Tree 的虚拟化能力，仅渲染可视区节点，适配大数据量树：

::component-example
---
name: ComponentsTreeVirtualizeExample
---
::

## 示例

### 自定义节点

通过透传的 `item-trailing` 等插槽自定义节点内容，未覆盖的插槽仍由 Nuxt UI Tree 默认渲染：

::component-example
---
name: ComponentsTreeSlotExample
---
::

## API

### Props

:component-props{slug="MTree"}

### Emits

:component-emits{slug="MTree"}

::callout{color="neutral"}
除透传 Nuxt UI Tree 的 `update:modelValue`、`update:expanded` 外，`MTree` 额外提供：

- `update:search`：搜索关键字变化时触发，支持 `v-model:search`。
- `change`：选中变化时触发，载荷为 `{ value, keys }`，`keys` 由 `getKey`/`labelKey` 派生。
::

### Slots

:component-slots{slug="MTree"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
