---
title: 自定义控件
description: 注册和使用自定义 Vue 组件作为表单字段的渲染控件，扩展 AutoForm 的功能。
category: customization
---

## 概述

`AutoForm` 支持两种方式来使用自定义 Vue 组件作为表单控件：

- **注册类型**：通过 `useAutoForm()` 注册控件类型，在 schema 中通过 `type` 引用，适合需要复用的控件
- **直接传入**：在 schema 中通过 `component` 直接传入组件实例，适合一次性使用

## 注册自定义控件

通过 `useAutoForm()` 注册控件，然后在 schema 中通过 `type` 字段引用：

```ts
import { TagSelector } from '#components'

const { afz, controls } = useAutoForm({
  tagSelector: {
    component: TagSelector,
    controlProps: { class: 'w-full' } // 全局 controlProps（可被字段级覆盖）
  }
})
```

在 schema 中使用注册的控件类型：

```ts
const schema = afz.object({
  skills: afz
    .array(afz.string(), {
      type: 'tagSelector',       // 指定控件类型
      controlProps: {
        options: ['Vue.js', 'Nuxt', 'TypeScript'],
        max: 5
      }
    })
    .meta({ label: '技能标签' })
})
```

将 `controls` 传给 `MAutoForm`：

```vue
<MAutoForm
  :schema="schema"
  :state="form"
  :controls="controls"
  @submit="onSubmit"
/>
```

## 直接传入组件

无需注册，直接在 schema 的 meta 中传入组件实例：

```ts
import { StarRating } from '#components'

const schema = afz.object({
  rating: afz.number({
    component: StarRating,
    controlProps: { max: 10 }
  }).meta({ label: '评分' })
})
```

::note
直接传入组件时，`type` 与 `component` 互斥，同时存在时以 `component` 为准。
::

## 示例

::component-example
---
name: 'auto-form-custom-control-example'
collapse: true
props:
  class: 'p-4 w-full'
---
::

## 自定义控件规范

自定义控件组件需满足以下要求：

### 支持 v-model

```vue
<script setup>
// Vue 3.4+ 推荐写法
const model = defineModel()

// 或传统写法
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>
```

### 接受 controlProps

`controlProps` 中的字段会作为 props 透传给控件组件。组件应声明对应的 props：

```vue
<script setup>
defineProps<{
  modelValue?: string[]
  options?: string[]  // 对应 controlProps.options
  max?: number        // 对应 controlProps.max
  disabled?: boolean
}>()
</script>
```

## 注意事项

::note
**类型推断**
Zod schema 的类型推断基于底层数据类型（如 `string()`、`number()`），而非控件类型。自定义控件不影响表单数据的类型推断。
::

::tip
**Props 合并**
`useAutoForm()` 中注册时的 `controlProps` 与字段级的 `controlProps` 会进行浅合并，字段级配置优先级更高。
::

::warning
**组件导入**
确保自定义控件组件已正确导入。在 Nuxt 项目中，推荐使用 `#components` 自动导入。
::
