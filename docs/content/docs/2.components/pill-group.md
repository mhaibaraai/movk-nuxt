---
title: PillGroup
description: 胶囊式单选/多选选项组，支持字符串与对象选项、数量约束、字段映射和插槽定制。
category: form
seo:
  title: PillGroup
  description: A pill-style single/multiple selection group supporting string and object items, min/max constraints, custom field mapping, per-item color and slot customization.
---

## 简介

`MPillGroup` 是一个胶囊（pill）样式的选项组组件，支持单选与多选。接受字符串数组或对象数组作为选项，通过 `labelKey`、`valueKey`、`descriptionKey` 映射业务对象字段，支持数量约束、按项语义色、激活 / 未激活样式区分以及插槽定制。

## 用法

传入字符串数组即可生成单选胶囊，选中值直接写入 v-model：

::component-code
---
name: MPillGroup
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: 全部
  items: ['全部', '待办', '进行中', '已完成', '已归档']
---
::

### `items` 结构化选项

对象 `items` 可通过 `label`、`description` 与 `icon` 渲染复合内容，同时保留原始对象作为值：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { value: 'free', label: '免费版', description: '基础功能 · 1 用户', icon: 'i-lucide-gift' }
    - { value: 'pro', label: '专业版', description: '团队协作 · 10 用户', icon: 'i-lucide-zap' }
    - { value: 'team', label: '团队版', description: '数据洞察 · 50 用户', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: '企业版', description: '自定义 SLA · 不限', icon: 'i-lucide-building' }
---
::

### `multiple` 多选模式

开启 `multiple` 后 `modelValue` 变为数组；配合 `valueKey` 让选中值只保存稳定字段：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: []
  items:
    - { value: 'free', label: '免费版', icon: 'i-lucide-gift' }
    - { value: 'pro', label: '专业版', icon: 'i-lucide-zap' }
    - { value: 'team', label: '团队版', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
  multiple: true
  valueKey: value
items:
  multiple: [true, false]
  valueKey: ['label', 'value', 'icon']
---
::

### `deselectable` 单选可取消

`deselectable` 允许再次点击当前项清空选择，适合非必选筛选条件（多选模式下忽略该属性）：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { value: 'free', label: '免费版', icon: 'i-lucide-gift' }
    - { value: 'pro', label: '专业版', icon: 'i-lucide-zap' }
    - { value: 'team', label: '团队版', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
  deselectable: true
---
::

### `orientation` 排列方向

`orientation` 设为 `vertical` 将选项纵向堆叠，适合描述较长或窄容器场景：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { value: 'free', label: '免费版', description: '基础功能 · 1 用户', icon: 'i-lucide-gift' }
    - { value: 'pro', label: '专业版', description: '团队协作 · 10 用户', icon: 'i-lucide-zap' }
    - { value: 'team', label: '团队版', description: '数据洞察 · 50 用户', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: '企业版', description: '自定义 SLA · 不限', icon: 'i-lucide-building' }
  orientation: vertical
items:
  orientation: ['vertical', 'horizontal']
---
::

### `activeVariant` 激活样式

`activeVariant` 与 `inactiveVariant` 分别控制选中与未选状态的视觉变体：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { value: 'free', label: '免费版', icon: 'i-lucide-gift' }
    - { value: 'pro', label: '专业版', icon: 'i-lucide-zap' }
    - { value: 'team', label: '团队版', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
  activeVariant: solid
  inactiveVariant: outline
items:
  activeVariant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
  inactiveVariant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
---
::

### `size` 尺寸

通过 `size` 切换胶囊尺寸；放入 `UFormField` 时会自动继承上下文中的 `size`：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { value: 'free', label: '免费版', icon: 'i-lucide-gift' }
    - { value: 'pro', label: '专业版', icon: 'i-lucide-zap' }
    - { value: 'team', label: '团队版', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `color` 主色

通过 `color` 统一组件主色，便于与外部 `UFieldGroup` 或按钮组配色协调：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: 全部
  items: ['全部', '待办', '进行中', '已完成', '已归档']
  color: primary
items:
  color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

### `min` 与 `max` 数量约束

`min` 与 `max` 约束多选数量：触顶时未选项变灰，触底时已选项不可取消：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: ['frontend', 'design']
  items:
    - { value: 'frontend', label: '前端', icon: 'i-lucide-layout' }
    - { value: 'backend', label: '后端', icon: 'i-lucide-server' }
    - { value: 'devops', label: '运维', icon: 'i-lucide-cloud' }
    - { value: 'design', label: '设计', icon: 'i-lucide-palette' }
    - { value: 'data', label: '数据', icon: 'i-lucide-database' }
  multiple: true
  valueKey: value
  min: 1
  max: 3
items:
  multiple: [true, false]
  min: [0, 1, 2]
  max: [2, 3, 4]
---
::

### `labelKey` 展示字段

`labelKey` 指定从业务对象读取的展示字段，未传时回退到 `label`：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { id: 'u1', name: 'Alice', handle: '@alice', email: 'alice@team.dev' }
    - { id: 'u2', name: 'Bob', handle: '@bob', email: 'bob@team.dev' }
    - { id: 'u3', name: 'Carol', handle: '@carol', email: 'carol@team.dev' }
  labelKey: name
items:
  labelKey: ['name', 'handle', 'email', 'id']
---
::

### `valueKey` 值字段

`valueKey` 指定 `modelValue` 写回的字段，便于只保存稳定 id 而非整个对象：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: u1
  items:
    - { id: 'u1', name: 'Alice', handle: '@alice', email: 'alice@team.dev' }
    - { id: 'u2', name: 'Bob', handle: '@bob', email: 'bob@team.dev' }
    - { id: 'u3', name: 'Carol', handle: '@carol', email: 'carol@team.dev' }
  labelKey: name
  valueKey: id
items:
  valueKey: ['id', 'handle', 'email']
---
::

### `color` 选项语义色

每个选项可携带独立 `color`，渲染时按项应用，便于表达状态差异：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: doing
  items:
    - { value: 'todo', label: '待办', icon: 'i-lucide-circle', color: 'neutral' }
    - { value: 'doing', label: '进行中', icon: 'i-lucide-loader', color: 'warning' }
    - { value: 'done', label: '已完成', icon: 'i-lucide-check-circle', color: 'success' }
    - { value: 'block', label: '阻塞', icon: 'i-lucide-octagon-x', color: 'error' }
  valueKey: value
---
::

### `disabled` 禁用

单项 `disabled` 阻止该项交互；组件级 `disabled` 冻结整组并保留当前值：

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: pdf
  items:
    - { value: 'pdf', label: 'PDF', icon: 'i-lucide-file-text' }
    - { value: 'excel', label: 'Excel（敬请期待）', icon: 'i-lucide-file-spreadsheet', disabled: true }
    - { value: 'csv', label: 'CSV', icon: 'i-lucide-file' }
    - { value: 'json', label: 'JSON', icon: 'i-lucide-braces' }
  valueKey: value
  disabled: false
---
::

## 示例

### 插槽定制选项内容

`item-label`、`item-trailing` 等插槽可接管单项的局部渲染，选中标记随 `selected` slot prop 更新：

::component-example
---
name: ComponentsPillGroupSlotsExample
prettier: true
---
::

### 事件回调

点击选项依次触发 `update:modelValue`、`change` 与 `select`，`select` 的 payload 含 `item`、`value`、`selected`、`index`：

::component-example
---
name: ComponentsPillGroupEventsExample
prettier: true
---
::

## API

### Props

:component-props{slug="MPillGroup"}

### Emits

:component-emits{slug="MPillGroup"}

### Slots

:component-slots{slug="MPillGroup"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
