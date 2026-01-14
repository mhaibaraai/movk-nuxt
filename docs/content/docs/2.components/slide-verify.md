---
title: SlideVerify
description: 流畅的滑动验证组件
category: advanced
---

## 简介

`MSlideVerify` 是一个现代化的滑动验证组件，提供流畅的拖拽交互体验。基于 `motion-v` 实现丰富的动画效果，可用于表单验证、敏感操作确认等场景。

::tip
使用 Motion 动画库提供流畅的拖拽交互和状态转换动画
::

## 基础用法

最简单的滑动验证：

::component-example
---
name: 'components-slide-verify-basic-example'
---
::

## 自定义文本

自定义提示文本和图标：

::component-example
---
name: 'components-slide-verify-text-example'
---
::

## 自定义尺寸

通过 `height` 和 `sliderWidth` 调整组件尺寸：

::component-example
---
name: 'components-slide-verify-size-example'
---
::

## 禁用状态

禁用滑动验证：

::component-example
---
name: 'components-slide-verify-disabled-example'
---
::

## 自定义阈值

通过 `threshold` 设置完成验证所需的滑动距离百分比（0-1）：

::component-example
---
name: 'components-slide-verify-threshold-example'
---
::

## 事件处理

监听验证事件并使用 `reset` 方法重置验证状态：

::component-example
---
name: 'components-slide-verify-events-example'
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

```vue
<script setup lang="ts">
const slideVerifyRef = useTemplateRef('slideVerifyRef')
</script>

<template>
  <MSlideVerify ref="slideVerifyRef" />
</template>
```

这将使您能够访问以下内容：

| Name | Type |
| ---- | ---- |
| `reset()`{lang="ts-type"} | `Promise<void>`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>重置验证状态</p> |

## Changelog

:commit-changelog{prefix="/components"}
