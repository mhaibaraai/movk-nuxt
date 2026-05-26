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
  items: ['全部', '进行中', '已完成', '已归档']
---
::

### 继承字段上下文

放入 `UFormField` 后继承 `size` 与错误态，选项胶囊按表单状态同步显示：

::component-example
---
name: ComponentsPillGroupFormFieldExample
---
::

### 融入`UFieldGroup`

与操作按钮放入 `UFieldGroup` 后共享尺寸和圆角，适合行内筛选与快捷清除：

::component-example
---
name: ComponentsPillGroupFieldGroupBasicExample
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
    - { value: 'free', label: '免费版', description: '基础功能 / 1 用户', icon: 'i-lucide-gift' }
    - { value: 'pro', label: '专业版', description: '团队协作 / 10 用户', icon: 'i-lucide-zap' }
    - { value: 'enterprise', label: '企业版', description: '自定义 SLA / 不限', icon: 'i-lucide-building' }
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
  modelValue: ['free', 'pro']
  items:
    - { value: 'free', label: '免费版', icon: 'i-lucide-gift' }
    - { value: 'pro', label: '专业版', icon: 'i-lucide-zap' }
    - { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
  multiple: true
  valueKey: value
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
    - { value: 'free', label: '免费版', description: '基础功能 / 1 用户', icon: 'i-lucide-gift' }
    - { value: 'pro', label: '专业版', description: '团队协作 / 10 用户', icon: 'i-lucide-zap' }
    - { value: 'enterprise', label: '企业版', description: '自定义 SLA / 不限', icon: 'i-lucide-building' }
  orientation: vertical
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
    - { value: 'enterprise', label: '企业版', icon: 'i-lucide-building' }
  activeVariant: solid
  inactiveVariant: outline
items:
  activeVariant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
  inactiveVariant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
---
::

## 示例

### 多选数量约束

`min` 与 `max` 约束选择数量：触顶时未选项变灰，触底时已选项不可取消：

::component-example
---
name: ComponentsPillGroupConstraintExample
---
::

### 自定义字段映射

`labelKey` 与 `valueKey` 指定从业务对象读取的展示字段与值字段，`modelValue` 只保存稳定 id：

::component-example
---
name: ComponentsPillGroupFieldMappingExample
---
::

### 按选项覆盖语义色

每个选项可携带独立 `color`，渲染时按项应用，便于表达状态差异：

::component-example
---
name: ComponentsPillGroupColorExample
---
::

### 局部与整体禁用

单项 `disabled` 阻止该项交互；组件级 `disabled` 冻结整个选项组并保留当前值：

::component-example
---
name: ComponentsPillGroupDisabledExample
---
::

### 插槽定制选项内容

`item-label`、`item-trailing` 等插槽可接管单项的局部渲染，选中标记随 `selected` slot prop 更新：

::component-example
---
name: ComponentsPillGroupSlotsExample
---
::

### 表单集成

放入 `UFormField` 或 `UFieldGroup` 后，`MPillGroup` 会继承表单上下文的尺寸与状态：

::component-example
---
name: ComponentsPillGroupFieldContextExample
---
::

::component-example
---
name: ComponentsPillGroupFieldGroupExample
---
::

### 事件回调

点击选项依次触发 `update:modelValue`、`change` 与 `select`，`select` 的 payload 含 `item`、`value`、`selected`、`index`：

::component-example
---
name: ComponentsPillGroupEventsExample
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
