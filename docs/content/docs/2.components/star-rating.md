---
title: StarRating
description: 交互式星级评分组件
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
collapse: true
props:
  class: 'px-4'
---
::

## 自定义星星数量

通过 `max` 设置星星总数：

::component-example
---
name: 'components-star-rating-max-example'
collapse: true
props:
  class: 'px-4'
---
::

## 只读模式

用于展示评分结果，不可交互：

::component-example
---
name: 'components-star-rating-readonly-example'
collapse: true
props:
  class: 'px-4'
---
::

## 半星评分

通过 `allow-half` 启用半星评分：

::component-example
---
name: 'components-star-rating-half-example'
collapse: true
props:
  class: 'px-4'
---
::

## 可清除评分

通过 `clearable` 允许点击已选星星清除评分：

::component-example
---
name: 'components-star-rating-clearable-example'
collapse: true
props:
  class: 'px-4'
---
::

## 隐藏评分徽章

通过 `show-badge` 控制评分数字徽章的显示：

::component-example
---
name: 'components-star-rating-badge-example'
collapse: true
props:
  class: 'px-4'
---
::

## 不同尺寸

通过 `size` 调整星星大小：

::component-example
---
name: 'components-star-rating-size-example'
collapse: true
props:
  class: 'px-4'
---
::

## 自定义颜色

通过 `color` 设置选中星星的颜色：

::component-example
---
name: 'components-star-rating-color-example'
collapse: true
props:
  class: 'px-4'
---
::

## 自定义图标

通过图标属性使用不同的图标样式：

::component-example
---
name: 'components-star-rating-icon-example'
collapse: true
props:
  class: 'px-4'
---
::

## 事件监听

通过事件监听评分和悬停状态：

::component-example
---
name: 'components-star-rating-events-example'
collapse: true
props:
  class: 'px-4'
---
::

## 禁用状态

通过 `disabled` 禁用交互：

::component-example
---
name: 'components-star-rating-disabled-example'
collapse: true
props:
  class: 'px-4'
---
::

## 自定义插槽

通过插槽添加前缀、后缀或自定义徽章：

::component-example
---
name: 'components-star-rating-slot-example'
collapse: true
props:
  class: 'px-4'
---
::

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `number` | `0` | 当前评分值（支持 v-model） |
| `max` | `number` | `5` | 最大星级数 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `showBadge` | `boolean` | `true` | 是否显示评分徽章 |
| `allowHalf` | `boolean` | `false` | 是否允许半星 |
| `clearable` | `boolean` | `false` | 是否允许清除评分 |
| `color` | `ButtonProps['color']` | `'warning'` | 选中星星的颜色 |
| `size` | `ButtonProps['size']` | `'sm'` | 星星大小 |
| `emptyIcon` | `string` | `'i-lucide-star'` | 未选中星星的图标 |
| `filledIcon` | `string` | `'i-lucide-star'` | 选中星星的图标 |
| `halfIcon` | `string` | `'i-lucide-star-half'` | 半星图标 |
| `buttonProps` | `Partial<ButtonProps>` | - | 自定义星星按钮属性 |

### Emits

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: number)` | 评分值更新时触发 |
| `change` | `(value: number)` | 评分改变时触发 |
| `hover` | `(value: number \| null)` | 鼠标悬停/离开星星时触发 |

### Slots

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `prefix` | `{ value, max }` | 评分组件前置内容 |
| `suffix` | `{ value, max }` | 评分组件后置内容 |
| `badge` | `{ value, max, label }` | 自定义评分徽章 |

## 交互说明

### 整星模式
- 点击星星：设置为对应的整数评分
- 启用 `clearable` 后，点击当前评分星星可清除评分

### 半星模式（`allow-half`）
- 点击星星左半部分：设置为 N.5 分
- 点击星星右半部分：设置为整数分
- 悬停时实时显示半星预览

### 状态说明
- `disabled`: 完全禁用，不可交互，显示为灰色
- `readonly`: 只读展示，不可修改，保持彩色显示

## 使用场景

- **商品评价**：电商平台的商品评分系统
- **内容评级**：文章、视频等内容的质量评分
- **服务评价**：外卖、打车等服务评分
- **用户反馈**：满意度调查、用户体验评分
- **技能等级**：简历中的技能熟练度展示
- **难度评估**：游戏、题目难度等级显示
