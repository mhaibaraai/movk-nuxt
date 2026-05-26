---
title: ColorChooser
description: 可视化颜色选择器组件。
category: advanced
seo:
  title: ColorChooser
  description: A visual color picker supporting hex/rgb/hsl formats, preset swatches, copy and clearable selection.
---

## 简介

`MColorChooser` 是一个可视化的颜色选择器组件。提供色盘与 HSL 滑块取色，支持自定义触发器形态、预设色板、复制与清除，并将值同步为 hex、rgb 或 hsl 三种格式之一。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/color-picker"}
基于 Nuxt UI 的 ColorPicker 组件封装
::

## 用法

默认按钮触发器展示当前色值，点击打开 popover 后从面板选择并同步 v-model：

::component-code
---
name: MColorChooser
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#0ea5e9'
---
::

### `formats` 输出格式

在 popover 顶部切换 `hex`、`rgb`、`hsl` 、`cmyk`、`lab`，当前值会转换为对应格式：

::component-code
---
name: MColorChooser
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#22c55e'
  formats: ['hex', 'rgb', 'hsl', 'cmyk', 'lab']
---
::

### `swatches` 单组预设

一维 `swatches` 渲染为连续色板，点击色块选中颜色并默认关闭弹层：

::component-code
---
name: MColorChooser
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#ef4444'
  swatches:
    - '#ef4444'
    - '#f97316'
    - '#f59e0b'
    - '#eab308'
    - '#84cc16'
    - '#22c55e'
    - '#10b981'
    - '#14b8a6'
    - '#06b6d4'
    - '#0ea5e9'
    - '#3b82f6'
    - '#6366f1'
    - '#8b5cf6'
    - '#a855f7'
    - '#d946ef'
    - '#ec4899'
---
::

### `swatches` 分组预设

二维 `swatches` 按行分组展示色相与中性色，`closeOnSwatch` 控制选择后是否关闭：

::component-code
---
name: MColorChooser
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#3b82f6'
  closeOnSwatch: false
  swatches:
    - ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6']
    - ['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']
    - ['#0a0a0a', '#404040', '#737373', '#a3a3a3', '#d4d4d4', '#e5e5e5', '#f5f5f5', '#ffffff']
---
::

### `trigger` 触发器

`trigger` 控制触发器形态：`button` 渲染按钮，`chip` 仅渲染紧凑色块，`input` 提供色点 + 文本输入并在 blur 时校验 hex：

::component-code
---
name: MColorChooser
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#f59e0b'
  trigger: chip
items:
  trigger: ['button', 'chip', 'input']
---
::

### `copyable` 复制按钮

`copyable` 启用 popover 底部的复制按钮，点击触发 `@copy` 事件：

::component-code
---
name: MColorChooser
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#a855f7'
  copyable: true
---
::

### `clearable` 清除按钮

`clearable` 启用 popover 底部的清除按钮，点击重置当前值并触发 `@clear` 事件：

::component-code
---
name: MColorChooser
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#a855f7'
  clearable: true
---
::

### `ui` 样式定制

`ui` 覆盖内部 slot 的 class，可定制色板网格与色块尺寸，不影响取色、复制和清除机制：

::component-code
---
name: MColorChooser
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#14b8a6'
  ui:
    swatches: grid grid-cols-4 gap-2
    swatch: size-8 rounded-lg ring-2 ring-default cursor-pointer hover:ring-primary
  swatches:
    - '#ef4444'
    - '#f97316'
    - '#f59e0b'
    - '#eab308'
    - '#84cc16'
    - '#22c55e'
    - '#10b981'
    - '#14b8a6'
    - '#06b6d4'
    - '#0ea5e9'
    - '#3b82f6'
    - '#6366f1'
    - '#8b5cf6'
    - '#a855f7'
    - '#d946ef'
    - '#ec4899'
---
::

### `disabled` 禁用状态

`disabled` 阻止 popover 打开，`input` 触发器进入只读状态，当前值保持可展示：

::component-code
---
name: MColorChooser
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#6b7280'
  disabled: true
---
::

## 示例

### 继承字段上下文

放入 `UFormField` 后继承 `size` 与错误态，触发器按表单状态渲染：

::component-code
---
name: UFormField
prettier: true
props:
  label: 品牌色
  size: xs
  error: 示例错误态
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MColorChooser />
---
:m-color-chooser
::

### 融入`UFieldGroup`

与按钮置于 `UFieldGroup` 时共用尺寸、圆角和边框衔接，适合表单行内取色：

::component-code
---
name: UFieldGroup
prettier: true
props:
  size: xs
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MColorChooser trigger="input" />
    <UButton icon="i-lucide-pipette" color="neutral" variant="subtle" />
---
:m-color-chooser{trigger="input"}
:u-button{color="neutral" variant="subtle" icon="i-lucide-pipette"}
::

### 自定义触发器渲染

`default` 插槽可完全接管触发器外观，同时通过 `open` 与 `value` slot props 保持弹层状态可见：

::component-example
---
name: ComponentsColorChooserSlotExample
prettier: true
---
::

## API

### Props

:component-props{slug="MColorChooser"}

### Emits

:component-emits{slug="MColorChooser"}

### Slots

:component-slots{slug="MColorChooser"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
