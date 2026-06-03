---
title: SlideVerify
description: 流畅的滑动验证组件。
category: advanced
seo:
  title: SlideVerify
  description: A smooth slide-to-verify component with configurable threshold, size and success feedback.
---

## 简介

`MSlideVerify` 是一个滑动验证组件，提供拖拽交互与状态转换动画。基于 `motion-v` 实现流畅过渡，适用于表单验证、敏感操作确认等场景。

::callout{color="neutral"}
使用 [Motion](https://motion.dev/) 动画库提供拖拽交互与状态转换动画
::

## 用法

按住滑块并向右拖动至阈值即可通过验证：

::component-code
---
name: MSlideVerify
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: false
---
::

### `threshold` 通过阈值

`threshold` 决定拖动占比达到多少判定通过，默认 `0.9`，调低可放宽校验：

::component-code
---
name: MSlideVerify
props:
  threshold: 0.5
  text: 拖到一半即可
---
::

### `text` 提示文案

`text` 设定待验证提示，`successText` 设定通过后的文案：

::component-code
---
name: MSlideVerify
props:
  text: 按住并向右拖动
  successText: 人机校验已通过
---
::

### `icon` 滑块图标

`icon` 设定待验证图标，`successIcon` 设定通过后的图标：

::component-code
---
name: MSlideVerify
props:
  icon: i-lucide-arrow-right
  successIcon: i-lucide-shield-check
---
::

### `size` 尺寸

通过 `size` 调整组件尺寸：

::component-code
---
name: MSlideVerify
props:
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `disabled` 禁用状态

`disabled` 冻结滑块，光标不可拖动且保持当前未验证态：

::component-code
---
name: MSlideVerify
props:
  disabled: true
---
::

## 示例

### 继承字段上下文

放入 `UFormField` 后接收字段尺寸与错误态，滑块按表单状态渲染：

::component-code
---
name: UFormField
prettier: true
hide: ['class']
props:
  class: w-sm
  label: 滑动验证
  size: xs
  error: 示例错误态
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MSlideVerify />
---
:m-slide-verify
::

### 融入`UFieldGroup`

与重置按钮组合时共享 `UFieldGroup` 尺寸，滑块区域和按钮保持统一高度：

::component-code
---
name: UFieldGroup
prettier: true
hide: ['class']
props:
  class: w-sm
  size: xs
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MSlideVerify class="flex-1" />
    <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="subtle" />
---
:m-slide-verify{class="flex-1"}
:u-button{color="neutral" variant="subtle" icon="i-lucide-rotate-ccw"}
::

### 自定义滑块内容

`slider` 插槽接管滑块内部渲染，可读取 `verified` 与 `progress` 动态展示进度：

::component-example
---
name: ComponentsSlideVerifySliderSlotExample
prettier: true
---
::

### 事件回调

开始拖动触发 `dragStart`，松手触发 `dragEnd` 并回传是否成功，达到阈值额外触发 `success`：

::component-example
---
name: ComponentsSlideVerifyEventsExample
prettier: true
---
::

## API

### Props

:component-props{slug="MSlideVerify"}

### Emits

:component-emits{slug="MSlideVerify"}

### Slots

:component-slots{slug="MSlideVerify"}

### Expose

您可以通过 [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref) 访问该类型化组件实例。

| Name | Type |
| ---- | ---- |
| `reset()`{lang="ts-type"} | `Promise<void>`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>重置验证状态</p> |

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/slide-verify"}
