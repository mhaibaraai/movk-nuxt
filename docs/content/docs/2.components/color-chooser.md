---
title: ColorChooser
description: 可视化颜色选择器组件
category: advanced
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
---
::

## 颜色格式

通过 `format` 指定颜色输出格式，在表单中选择颜色配置：

::component-example
---
name: 'components-color-chooser-format-example'
---
::

## 自定义按钮

通过 `buttonProps` 自定义按钮样式：

::component-example
---
name: 'components-color-chooser-button-example'
---
::

## 自定义插槽

使用默认插槽自定义触发元素：

::component-example
---
name: 'components-color-chooser-slot-example'
---
::

## API

### Props

:component-props{slug=MColorChooser}

### Emits

:component-emits{slug=MColorChooser}

### Slots

:component-slots{slug=MColorChooser}

## Changelog

:commit-changelog{prefix="/components"}
