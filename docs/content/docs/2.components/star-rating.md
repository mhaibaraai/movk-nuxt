---
title: StarRating
description: 交互式星级评分组件。
category: advanced
seo:
  title: StarRating
  description: An interactive star rating component supporting half stars, custom icons, colors, readonly and clearable states.
---

## 简介

`MStarRating` 是一个功能丰富的星级评分组件。支持整星与半星评分、只读展示、自定义星级总数与图标、键盘交互，并提供徽章展示与高亮聚焦态等增强能力。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/button"}
基于 Nuxt UI 的 Button 与 Badge 组件构建
::

## 基础用法

默认 5 星评分系统，点击星星写入 v-model：

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 3
---
::

### 继承字段上下文

放入 `UFormField` 后接收字段尺寸与错误态，评分图标随表单状态更新：

::component-code
---
name: UFormField
prettier: true
props:
  label: 满意度
  size: xs
  error: 示例错误态
slots:
  default: |

    <MStarRating />
---
:m-star-rating
::

### 融入分组控件

与重置按钮置于 `UFieldGroup` 时共享尺寸，适合在紧凑表单行内组合操作：

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

    <MStarRating />
    <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="subtle" />
---
:m-star-rating
:u-button{color="neutral" variant="subtle" icon="i-lucide-rotate-ccw"}
::

### 允许半星评分

`allowHalf` 让每颗星可取半值，点击左右半区分别记为 `.5` 与整数评分：

::component-code
---
name: MStarRating
props:
  modelValue: 3.5
  allowHalf: true
external: ['modelValue']
hide: ['modelValue']
---
::

### 可清除评分

`clearable` 允许再次点击当前值或按 Backspace 将评分清零，适合非必填场景：

::component-code
---
name: MStarRating
props:
  modelValue: 2.5
  allowHalf: true
  clearable: true
external: ['modelValue']
hide: ['modelValue']
---
::

### 只读模式

`readonly` 仅展示评分并保留视觉，用于评价、评级等结果展示：

::component-code
---
name: MStarRating
props:
  modelValue: 4
  readonly: true
external: ['modelValue']
hide: ['modelValue']
---
::

### 自定义星级总数

`max` 调整星星数量，可适配更细粒度的评分量表：

::component-code
---
name: MStarRating
props:
  modelValue: 5
  max: 7
external: ['modelValue']
hide: ['modelValue']
---
::

### 替换评分图标

`emptyIcon`、`filledIcon`、`halfIcon` 可整体替换为其他图标，配合 `allowHalf` 呈现半值形态：

::component-code
---
name: MStarRating
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 2.5
  allowHalf: true
  emptyIcon: i-lucide-heart
  filledIcon: i-lucide-heart
  halfIcon: i-lucide-heart-handshake
---
::

### 隐藏评分徽章

`showBadge` 默认显示当前分值徽章，设为 `false` 后只保留星星本身：

::component-code
---
name: MStarRating
props:
  modelValue: 3
  showBadge: false
external: ['modelValue']
hide: ['modelValue']
---
::

### 自定义颜色

`color` 指定选中星星与徽章颜色：

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 4
  color: primary
items:
  color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

### 高亮聚焦态

`highlight` 为评分控件加上类聚焦的环形高亮，用于强调当前可操作项：

::component-code
---
name: MStarRating
props:
  modelValue: 3
  highlight: true
external: ['modelValue']
hide: ['modelValue']
---
::

### 透传按钮属性

`buttonProps` 透传到每颗星的按钮，可统一调整变体、内边距等底层样式：

::component-code
---
name: MStarRating
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 3
  buttonProps:
    variant: soft
---
::

### 禁用状态

`disabled` 同时阻止交互并降低不透明度：

::component-code
---
name: MStarRating
props:
  modelValue: 4
  disabled: true
external: ['modelValue']
hide: ['modelValue']
---
::

## 示例

### 事件回调

点击、悬浮与键盘交互依次触发 `update:modelValue`、`change` 与 `hover`：

::component-example
---
name: ComponentsStarRatingEventsExample
---
::

### 自定义插槽

通过插槽添加前缀、后缀或自定义徽章：

::component-example
---
name: ComponentsStarRatingSlotExample
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

## API

### Props

:component-props{slug="MStarRating"}

### Emits

:component-emits{slug="MStarRating"}

### Slots

:component-slots{slug="MStarRating"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
