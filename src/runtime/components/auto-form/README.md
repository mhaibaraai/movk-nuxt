## AutoForm 使用指南

### 概览
- **自动渲染**: 遍历 Zod schema 生成字段树
- **控件映射**: 按 `meta.component > meta.type > 自动映射` 决策
- **表单校验**: 使用 Zod 校验并映射到 `UFormField`
- **类型覆盖**: 对象、数组、枚举、可选/默认、判别式联合
- **SSR 安全**: 大型控件默认 `ClientOnly`

参考：Zod v4 Metadata & registries（[链接](https://zod.dev/metadata)）

### 快速开始
```vue
<script setup lang="ts">
import { z } from 'zod/v4'

const userSchema = z.object({
  name: z.string().meta({ label: '姓名', type: 'UInput' }),
  age: z.number().meta({ label: '年龄', type: 'UInputNumber' }),
  active: z.boolean().meta({ label: '启用', type: 'USwitch' }),
  role: z.enum(['user', 'admin']).meta({
    label: '角色',
    type: 'USelect',
    controlProps: { items: [
      { label: '用户', value: 'user' },
      { label: '管理员', value: 'admin' },
    ] },
  }),
})

const state = reactive({ name: '', age: 18, active: true, role: 'user' as const })
function onSubmit(val: any) { console.log('submit', val) }
</script>

<template>
  <MAutoForm :schema="userSchema" v-model="state" @submit="onSubmit" />
</template>
```
- 组件注册：模块已通过 `addComponentsDir` 自动注册，默认前缀 `M`，因此组件名为 `MAutoForm`。

### 元数据键（与 UFormField 对齐 + 控件扩展）
- **字段级**: `label`, `description`, `hint`, `help`, `error`, `required`, `size`, `eagerValidation`, `validateOnInputDelay`, `ui`
- **控件级**: `type`, `component`, `controlProps`, `controlUi`
- **高级**: `discriminant`, `items`, `itemsProvider`, `itemsRefKey`

### 选择协议（InputMenu/SelectMenu）
- **items**: `Array<{ label, value, ... }>`
- **itemsProvider(query?, ctx?)**: `Promise<items> | items`
- **itemsRefKey**: 从 ref/对象里取选项
- **值类型一致**: 单选标量，多选数组（与 Zod 字段一致）

### 嵌套与数组
- **对象**: 自动生成路径（如 `address.street`），与 `UFormField.name` 对齐
- **数组**: 通过 `ArrayField` 管理增删与稳定 key，子项共享 item schema

### 判别式联合（Discriminated Union）
- 依赖 `meta.discriminant` 或 schema 内置 discriminator
- 运行时按当前 `state[discriminant]` 值选择分支

### 校验与错误映射
- `validate(state)` 使用 Zod `safeParseAsync`
- **字段错误**: `{ path, message }`（`path` 对齐 `ZodError.path`，如 `items[0].price`）
- **表单错误**: 跨字段错误聚合到 `__root__`
- 遵循 `UFormField` 规则：`error > help`

### SSR/Hydration 安全
- 默认对大型/仅客户端控件使用 `<ClientOnly>` 包裹（如 `UFileUpload`）

### 类型提示与辅助
- 提供 `defineFieldMeta<C, T, M>(meta)` 与 `ControlType/ControlProps` 帮助为 `controlProps` 提示
```ts
import { defineFieldMeta } from '#movk'

const meta = defineFieldMeta<'USelect', 'user'|'admin'>({
  type: 'USelect',
  controlProps: { items: [
    { label: '用户', value: 'user' },
    { label: '管理员', value: 'admin' },
  ] },
})
```

### 默认控件映射（可覆盖）
- `ZodString → UInput`
- `ZodNumber → UInputNumber`
- `ZodBoolean → USwitch`
- `ZodEnum|ZodNativeEnum → USelect`

### 已知限制
- 根级数组以 `items[0]` 作为模板叶子字段渲染
- `.refine/.superRefine` 的表单级错误合并到 `__root__`
- 文件上传在 SSR 场景建议按需加载
