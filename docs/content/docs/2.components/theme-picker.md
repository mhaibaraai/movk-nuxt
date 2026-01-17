---
title: ThemePicker
description: 可视化主题配置组件
category: advanced
---

## 简介

`ThemePicker` 是一个可视化的主题配置组件，允许用户实时预览和自定义应用主题。用户可以调整主色调、中性色、圆角、字体、图标集和颜色模式，并导出配置代码。

::callout{color="info" to="https://github.com/nuxt/ui/tree/v4/docs/app/components/theme-picker"}
配置变更会存储在本地，下次访问时自动恢复。组件源码来自 Nuxt UI
::

## 功能特性

### 主色调配置

- **Primary**：选择主品牌色，支持黑色或预设颜色
- **Neutral**：配置中性色调，影响文本和背景

### 样式配置

- **Radius**：调整全局圆角大小（0-5 级别）
- **Font**：选择字体系列
- **Icons**：切换图标集（Lucide、Heroicons 等）

### 颜色模式

支持三种颜色模式：
- `light`：浅色模式
- `dark`：深色模式
- `system`：跟随系统

### 导出配置

配置完成后可导出：
- `main.css`：CSS 变量配置
- `app.config.ts`：应用配置代码

## 基础用法

ThemePicker 通常作为全局主题配置入口，放置在应用的头部或工具栏中：

::component-example
---
name: 'components-theme-picker-basic-example'
---
::

## Changelog

:commit-changelog{prefix="/components/theme-picker"}
