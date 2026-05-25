---
title: SlideVerify
description: 流畅的滑动验证组件。
category: advanced
seo:
  title: SlideVerify
  description: A smooth slide-to-verify component with configurable threshold, size and success feedback.
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
options:
  - name: 'text'
    label: 'text'
    default: '请向右滑动验证'
  - name: 'icon'
    label: 'icon'
    default: 'i-lucide-chevrons-right'
---
::

## 自定义文本

自定义提示文本和图标：

::component-example
---
name: 'components-slide-verify-text-example'
options:
  - name: 'text'
    label: 'text'
    default: '滑动解锁'
  - name: 'successText'
    label: 'successText'
    default: '解锁成功'
  - name: 'icon'
    label: 'icon'
    default: 'i-lucide-lock'
  - name: 'successIcon'
    label: 'successIcon'
    default: 'i-lucide-unlock'
---
::

## 自定义尺寸

通过 `size` 调整组件尺寸：

::component-example
---
name: 'components-slide-verify-size-example'
options:
  - name: 'size'
    label: 'size'
    items: ['xs', 'sm', 'md', 'lg', 'xl']
    default: 'md'
---
::

## 禁用状态

禁用滑动验证：

::component-example
---
name: 'components-slide-verify-disabled-example'
options:
  - name: 'disabled'
    label: 'disabled'
    items: ['true', 'false']
    default: 'true'
---
::

## 自定义阈值

通过 `threshold` 设置完成验证所需的滑动距离百分比（0-1）：

::component-example
---
name: 'components-slide-verify-threshold-example'
options:
  - name: 'threshold'
    label: 'threshold'
    default: '0.7'
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

| Name | Type |
| ---- | ---- |
| `reset()`{lang="ts-type"} | `Promise<void>`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>重置验证状态</p> |

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
