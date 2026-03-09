---
title: 全局元数据
description: 使用全局元数据统一配置所有字段的行为和样式，简化重复配置。
category: customization
---

## 基础用法

通过 `global-meta` 统一设置字段的大小、必填样式和验证延迟：

::component-example
---
name: 'auto-form-advanced-global-meta-example'
props:
  class: 'px-4'
---
::

## 使用 UTheme 覆盖样式

`globalMeta` 负责 AutoForm 字段行为（大小、必填、验证时机），若需批量调整**子组件的 UI 插槽样式**，可将 AutoForm 包裹在 [`UTheme`](https://ui.nuxt.com/components/theme) 中：

```vue
<template>
  <UTheme
    :ui="{
      formField: {
        label: 'font-semibold text-primary'
      }
    }"
  >
    <MAutoForm
      :schema="schema"
      :state="form"
      :global-meta="{
        size: 'lg',
        required: true
      }"
    />
  </UTheme>
</template>
```
