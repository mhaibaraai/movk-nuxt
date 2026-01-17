---
title: 自定义控件
description: 注册和使用自定义 Vue 组件作为表单字段的渲染控件，扩展 AutoForm 的功能。
category: customization
---

## 概述

`AutoForm` 允许你注册自定义 Vue 组件作为表单字段的渲染控件。这使得你可以扩展 `AutoForm` 的功能，使用任何 UI 组件库或自定义组件来渲染特定类型的字段。

自定义控件适用于以下场景：

- 集成第三方组件库（如富文本编辑器、颜色选择器等）
- 实现特定业务逻辑的输入控件
- 复用现有的表单组件
- 为特定字段类型提供统一的渲染方式

## 基本用法

通过 `useAutoForm` 注册自定义控件：

```ts
import { RichTextEditor } from '#components'

const { afz, controls } = useAutoForm({
  // 注册控件类型为 'richtext'
  richtext: {
    component: RichTextEditor,
    controlProps: { class: 'w-full' }
  }
})
```

然后在 schema 中使用自定义控件：

```ts
const schema = afz.object({
  content: afz
    .string({
      type: 'richtext',  // 指定使用自定义控件
      controlProps: {
        readonly: false
      }
    })
    .meta({
      label: '文章内容',
      description: '使用富文本编辑器编写文章内容'
    })
})
```

最后将 `controls` 传递给 `AutoForm` 组件：

```vue
<MAutoForm
  :schema="schema"
  :state="form"
  :controls="controls"
  @submit="onSubmit"
/>
```

## 控件组件要求

自定义控件组件需要满足以下要求：

1. **接受 v-model**：组件必须支持 `v-model` 绑定

```vue
<script setup>
// 使用 defineModel (Vue 3.4+)
const modelValue = defineModel()

// 或使用 props + emit
const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>
```

2. **接收 controlProps**：组件应该能够接收并处理传入的 props

```vue
<script setup>
defineProps<{
  modelValue: string
  readonly?: boolean
  placeholder?: string
  // 其他自定义 props...
}>()
</script>
```

## 示例

::component-example
---
name: 'auto-form-custom-control-rich-text-example'
collapse: true
props:
  class: 'p-4 w-full'
---
::

## 注意事项

::note
**类型推断**
使用自定义控件时，Zod schema 的类型推断仍然基于底层的数据类型（如 `string()`、`number()` 等），而不是控件类型。
::

::tip
**Props 合并**
`useAutoForm` 中的 `controlProps` 和字段级别的 `controlProps` 会进行浅合并，字段级别的配置优先级更高。
::

::warning
**组件导入**
确保自定义控件组件已正确导入。在 Nuxt 项目中，可以使用 `#components` 自动导入，或手动导入组件。
::
