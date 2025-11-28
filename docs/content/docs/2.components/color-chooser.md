---
title: ColorChooser
description: 可视化颜色选择器组件
---

## 简介

`MColorChooser` 是一个可视化的颜色选择器组件，提供直观的颜色拾取界面。用户可以通过色盘、HSL 滑块等方式选择颜色，支持多种颜色格式输出。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/color-picker"}
基于 Nuxt UI 的 ColorPicker 组件封装
::

## 基础用法

最简单的颜色选择器：

::component-example
---
name: 'components-color-chooser-basic-example'
collapse: true
props:
  class: 'px-4'
---
::

## 颜色格式

通过 `format` 指定颜色输出格式：

::component-example
---
name: 'components-color-chooser-format-example'
collapse: true
props:
  class: 'px-4'
---
::

## 预设颜色

提供常用颜色快捷选择：

::component-example
---
name: 'components-color-chooser-swatches-example'
collapse: true
props:
  class: 'px-4'
---
::

## 自定义按钮

通过 `buttonProps` 自定义按钮样式：

::component-example
---
name: 'components-color-chooser-button-example'
collapse: true
props:
  class: 'px-4'
---
::

## 表单集成

在表单中选择颜色配置：

::component-example
---
name: 'components-color-chooser-form-example'
collapse: true
props:
  class: 'px-4'
---
::

## 禁用状态

通过 `disabled` 禁用颜色选择：

::component-example
---
name: 'components-color-chooser-disabled-example'
collapse: true
props:
  class: 'px-4'
---
::

## 自定义插槽

使用默认插槽自定义触发元素：

::component-example
---
name: 'components-color-chooser-slot-example'
collapse: true
props:
  class: 'px-4'
---
::

## API

### Props

继承自 [UColorPicker](https://ui.nuxt.com/docs/components/color-picker#props) 的所有属性，并扩展：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `buttonProps` | `ButtonProps` | - | 触发按钮的属性 |
| `popoverProps` | `PopoverProps` | - | Popover 弹出层属性 |

### Emits

继承自 UPopover 的所有事件。

### Slots

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `default` | `{ open }` | 自定义触发器 |
| `anchor` | - | Popover 锚点 |
| `leading` | - | 按钮前置内容（默认显示颜色色块） |
| `trailing` | - | 按钮后置内容 |

## 颜色格式支持

组件支持以下颜色格式的输入和输出：

- **HEX**: `#3b82f6`, `#3b82f6ff`（带透明度）
- **RGB**: `rgb(59, 130, 246)`, `rgba(59, 130, 246, 0.5)`
- **HSL**: `hsl(217, 91%, 60%)`, `hsla(217, 91%, 60%, 0.5)`

## 使用场景

- **主题定制**：网站、应用的主题色配置
- **设计工具**：图形编辑、绘图应用中的颜色选择
- **品牌设置**：企业品牌色、Logo 颜色配置
- **样式编辑器**：CSS 样式可视化编辑
- **数据可视化**：图表颜色配置
- **文本编辑器**：富文本中的文字颜色选择
