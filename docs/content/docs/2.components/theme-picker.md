---
title: ThemePicker
description: 可视化主题配置组件。
category: advanced
seo:
  title: ThemePicker
  description: A visual theme configuration component to switch colors, radius, fonts, icon set and dark mode, with CSS/config export.
---

## 简介

`MThemePicker` 是一个可视化的主题配置组件，允许用户实时预览并自定义应用主题。统一调整 `primary`、`neutral`、圆角、字体、图标集与颜色模式，并支持导出 CSS 变量与 `app.config.ts` 配置代码。

::note{to="https://github.com/nuxt/ui/tree/v4/docs/app/components/theme-picker"}
配置变更会存储在本地，下次访问时自动恢复。组件源码来自 Nuxt UI
::

::note
`MThemePicker` 属于主题模块的一部分。若将 [`movk.theme.enabled`](/docs/getting-started/configuration#theme) 设为 `false`，该组件将不会被注册。
::

## 基础用法

`MThemePicker` 通常作为全局主题配置入口，放置在应用头部或工具栏：

::component-example
---
name: ComponentsThemePickerBasicExample
---
::

### 实时主题状态

当前主题 token 在面板操作后即时更新，便于确认配置是否生效。配合 [`useTheme`](/docs/composables/use-theme) 读取响应式状态：

::component-example
---
name: ComponentsThemePickerStateExample
---
::

### 组件主题预览

按钮、徽章、复选框和开关会实时响应主题变量变化，展示全局视觉影响：

::component-example
---
name: ComponentsThemePickerPreviewExample
---
::

## 功能特性

### 主色调配置

- **Primary**：选择主品牌色，支持黑色或预设颜色
- **Neutral**：配置中性色调，影响文本和背景

### 样式配置

- **Radius**：调整全局圆角大小（0–5 级别）
- **Font**：选择字体系列（默认字体 Alibaba PuHuiTi）
- **Icons**：切换图标集（Lucide、Phosphor、Tabler）

### 颜色模式

支持三种颜色模式：
- `light`：浅色模式
- `dark`：深色模式
- `system`：跟随系统

### 导出配置

配置完成后可导出：
- `main.css`：CSS 变量配置
- `app.config.ts`：应用配置代码

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/theme-picker"}
