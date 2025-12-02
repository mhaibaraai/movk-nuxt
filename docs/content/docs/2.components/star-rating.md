---
title: StarRating
description: 交互式星级评分组件
category: advanced
---

## 简介

`MStarRating` 是一个功能丰富的星级评分组件。支持整星和半星评分、只读展示、自定义星星数量等多种模式，适用于评价、评级等场景。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/button"}
基于 Nuxt UI 的 Button 和 Badge 组件构建
::

## 基础用法

默认 5 星评分系统：

::component-example
---
name: 'components-star-rating-basic-example'
---
::

## 自定义星星数量

通过 `max` 设置星星总数：

::component-example
---
name: 'components-star-rating-max-example'
---
::

## 只读模式

用于展示评分结果，不可交互：

::component-example
---
name: 'components-star-rating-readonly-example'
---
::

## 半星评分

通过 `allow-half` 启用半星评分：

::component-example
---
name: 'components-star-rating-half-example'
---
::

## 可清除评分

通过 `clearable` 允许点击已选星星清除评分：

::component-example
---
name: 'components-star-rating-clearable-example'
---
::

## 隐藏评分徽章

通过 `show-badge` 控制评分数字徽章的显示：

::component-example
---
name: 'components-star-rating-badge-example'
---
::

## 不同尺寸

通过 `size` 调整星星大小：

::component-example
---
name: 'components-star-rating-size-example'
---
::

## 自定义颜色

通过 `color` 设置选中星星的颜色：

::component-example
---
name: 'components-star-rating-color-example'
---
::

## 自定义图标

通过图标属性使用不同的图标样式：

::component-example
---
name: 'components-star-rating-icon-example'
---
::

## 事件监听

通过事件监听评分和悬停状态：

::component-example
---
name: 'components-star-rating-events-example'
---
::

## 键盘导航

组件支持完整的键盘交互，提升无障碍访问性：

- **方向键**：`←` `→` `↑` `↓` 增减评分（支持半星步进）
- **快捷键**：`Home` 设置最小评分，`End` 设置最大评分
- **数字键**：`0-9` 直接跳转到对应评分
- **清除键**：`Backspace` / `Delete` 清除评分（需启用 `clearable`）

::callout{color="primary" icon="i-lucide-keyboard"}
组件遵循 WCAG 无障碍规范，包含完整的 ARIA 属性和键盘焦点管理
::

## 禁用状态

通过 `disabled` 禁用交互：

::component-example
---
name: 'components-star-rating-disabled-example'
---
::

## 自定义插槽

通过插槽添加前缀、后缀或自定义徽章：

::component-example
---
name: 'components-star-rating-slot-example'
---
::

## API

### Props

:component-props{slug="MStarRating"}

### Emits

:component-emits{slug="MStarRating"}

### Slots

:component-slots{slug="MStarRating"}

## Changelog

:commit-changelog{prefix="/components"}
