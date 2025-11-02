# Auto Form 组件开发规划

## 参考文档

- [auto-form](https://www.shadcn-vue.com/docs/components/auto-form)
- [nuxt-auto-form](https://nuxt-auto-form.norbiros.dev/)

## 架构概述

当前 AutoForm 组件基于以下核心架构：

### 核心组件

- **AutoForm.vue**: 主入口，负责 Schema 内省、状态管理、字段分类渲染
- **AutoFormRendererField.vue**: 叶子字段渲染器，处理单个表单字段
- **AutoFormRendererNested.vue**: 嵌套对象渲染器，支持 UCollapsible 折叠功能

### 工作流程

1. **Schema 内省**: 通过 `introspectSchema` 解析 Zod schema 生成字段树
2. **字段分类**: 区分叶子字段和嵌套对象字段进行不同渲染
3. **控件映射**: 优先级 `component > type > zodType` 选择合适控件
4. **响应式处理**: 通过 `useAutoFormProvider` 管理字段上下文和状态更新
5. **插槽系统**: 支持全局、字段特定、路径特定多层级插槽

### 已实现功能

- ✅ 基础类型控件映射 (string/UInput, number/UInputNumber, boolean/USwitch, date/UCalendar)
- ✅ 响应式元数据 (label, description, required, hidden, if 等)
- ✅ 嵌套对象支持 (UCollapsible 包装，可配置)
- ✅ 柯里化 API (object/looseObject/strictObject 工厂)
- ✅ 类型安全和智能提示
- ✅ 插槽系统 (支持路径特定插槽如 `label:nestedObject.field`)
- ✅ 默认值自动初始化
- ✅ readonly 属性处理 (转换为 disabled)

## 功能增强

### P0 - 关键功能缺失

#### 更多内置控件支持

```ts
// 需要补充的控件类型
const EXTENDED_CONTROLS = {
  select: createAutoFormControl({ component: USelect }),
  textarea: createAutoFormControl({ component: UTextarea }),
  radio: createAutoFormControl({ component: URadio }),
  checkbox: createAutoFormControl({ component: UCheckbox }),
  file: createAutoFormControl({ component: UInput, controlProps: { type: 'file' } }),
  email: createAutoFormControl({ component: UInput, controlProps: { type: 'email' } }),
  password: createAutoFormControl({ component: UInput, controlProps: { type: 'password' } }),
  url: createAutoFormControl({ component: UInput, controlProps: { type: 'url' } }),
}
```

## 性能优化

- 事件监听器泄漏防护 [✅]
- 插槽系统优化 [✅]
  - 移除冗余对象展开
  - 修复 `createSlotProps` 未传递 `extraProps` 导致插槽无法获取 `errors` 和 `loading` 的问题

> **注意**: 不需要考虑向后兼容性，可以进行破坏性变更以优化设计。

## 插槽系统

### 已实现功能 [✅]

- **统一的插槽参数类型** (`AutoFormSlotProps`)
  - `header`: 表单字段前的插槽
  - `footer`: 表单字段后的插槽
  - `submit`: 提交按钮插槽
  - 所有插槽都接收 `{ errors, loading, fields, state }` 参数

- **动态字段插槽** (DynamicFormSlots)
  - 支持路径特定插槽：`field-default:username`
  - 支持通用插槽：`field-default`
  - 支持字段级插槽：通过 `fieldSlots` meta 配置
  - 插槽类型：`default`, `label`, `description`, `hint`, `help`, `error`
  - 嵌套对象插槽：`field-content:nestedObject.field`

- **提交按钮控制**
  - `submitButton` prop 控制是否显示默认提交按钮
  - 默认值：`true`

### 使用示例

```vue
<AutoForm v-model="data" :schema="schema">
  <!-- 表单头部 -->
  <template #header="{ errors, loading }">
    <UAlert v-if="errors.length" title="表单验证失败" />
  </template>

  <!-- 字段级插槽 -->
  <template #field-default:username="{ value, setValue }">
    <UInput :model-value="value" @update:model-value="setValue" />
  </template>

  <!-- 嵌套对象内容插槽 -->
  <template #field-content:address="{ state }">
    <CustomAddressFields :data="state.address" />
  </template>

  <!-- 自定义提交区域 -->
  <template #submit="{ loading }">
    <UButton type="submit" :loading="loading">保存</UButton>
  </template>
</AutoForm>

<!-- 或隐藏默认提交按钮 -->
<AutoForm v-model="data" :schema="schema" :submit-button="false" />
```

## 数组字段支持 z.array()

### 已实现功能 [✅]

#### 核心架构

- **AutoFormRendererArray.vue**: 专用数组字段渲染器
  - 支持原始类型数组（如 `z.array(z.string())`）
  - 支持对象类型数组（如 `z.array(z.object({...}))`）
  - 自动路径更新和字段克隆机制
  - 响应式数组值管理

#### 字段内省 (introspectSchema)

- ✅ 数组类型自动识别（基于 `meta.type === 'array'`）
- ✅ 数组元素 schema 提取（`arrayElement` 属性）
- ✅ 嵌套数组支持（数组的元素可以是对象或数组）

#### 渲染能力

- ✅ 折叠功能支持（通过 `UCollapsible` 包装）
- ✅ 动态添加/删除项
  - 默认添加按钮（可通过 `addButtonProps` 自定义）
  - 删除按钮（集成在 hint 插槽中）
- ✅ 数组元素路径自动更新（`field.path` 包含索引）
- ✅ 默认值初始化（支持通过 `.default([...])` 设置）

#### 插槽系统

- ✅ 支持数组级别插槽：`field-content:arrayField`
- ✅ 支持数组元素插槽：
  - 通过 `count` 参数标识元素索引
  - 动态 label：`label: ({ count }) => `标签 ${count! + 1}``
- ✅ Hint 插槽集成：
  - 原始类型数组：仅显示删除按钮
  - 对象类型数组：显示删除按钮 + Chevron 图标
  - 嵌套对象内的数组：仅显示 Chevron 图标

#### 类型定义

```ts
interface AutoFormField {
  // ... 其他属性
  /** 数组元素模板 */
  arrayElement?: AutoFormField
}

type DynamicFormSlots<T> = {
  // ... 其他插槽
  // 数组字段内容插槽
  [`field-content:${ArrayFieldKeys<T>}`]: (props: AutoFormFieldContext<T>) => any
}
```

### 使用示例

```ts
import { createAutoFormZ } from '@movk/nuxt'

const { afz } = createAutoFormZ()

// 原始类型数组
const schema1 = afz.object({
  tags: afz.array(
    afz.string().meta({ 
      label: ({ count }) => `标签 ${count! + 1}` 
    })
  ).default(['tag1', 'tag2']).meta({
    label: '标签列表',
    collapsible: {
      defaultOpen: true
    }
  })
})

// 对象类型数组
const schema2 = afz.object({
  scores: afz.array(
    afz.object({
      subject: afz.string().meta({ label: '科目' }).default(''),
      score: afz.number().meta({ label: '分数' }).default(0),
    })
  ).meta({ 
    label: '成绩',
    description: '添加多个科目成绩'
  })
})

// 嵌套数组（数组的元素包含对象）
const schema3 = afz.object({
  projects: afz.array(
    afz.object({
      name: afz.string().meta({ label: '项目名称' }),
      members: afz.array(afz.string().meta({ 
        label: ({ count }) => `成员 ${count! + 1}` 
      }))
    })
  ).meta({ label: '项目列表' })
})
```

```vue
<template>
  <AutoForm 
    v-model="data" 
    :schema="schema"
    :add-button-props="{ 
      icon: 'i-lucide-plus-circle', 
      color: 'primary' 
    }"
  >
    <!-- 自定义数组内容 -->
    <template #field-content:tags="{ state, count }">
      <CustomTagsRenderer :tags="state.tags" />
    </template>
  </AutoForm>
</template>
```

### 实现细节

#### 路径更新机制

```ts
// 自动将数组元素模板的路径更新为包含索引的路径
// 例如: "scores" -> "scores.0", "scores.1", ...
function updateFieldPaths(
  template: AutoFormField, 
  oldBasePath: string, 
  newBasePath: string
): AutoFormField {
  return {
    ...template,
    path: template.path.replace(oldBasePath, newBasePath),
    // 递归更新子字段路径
    children: template.children?.map(child => 
      updateFieldPaths(child, oldBasePath, newBasePath)
    )
  }
}
```

#### 添加/删除逻辑

```ts
// 添加项：创建默认值并追加到数组
function addItem() {
  const newArray = [...arrayValue.value, createDefaultValue()]
  context.setValue(newArray)
}

// 删除项：通过索引移除
function removeItem(count?: number) {
  const arr = arrayValue.value
  const newArray = [...arr.slice(0, count), ...arr.slice(count + 1)]
  context.setValue(newArray)
}
```

#### Hint 插槽工厂

```ts
// 根据字段类型和路径生成不同的 hint 内容
createHintSlotFactory(removeCallback) {
  return (field, path, open, count) => {
    const isNested = path.includes('.')
    const isObject = field.meta?.type === 'object'
    
    // 嵌套路径但非对象：不显示内容
    if (isNested && !isObject) return undefined
    
    // 嵌套路径且为对象：仅显示 Chevron
    if (isNested) return chevronIcon
    
    // 非嵌套且非对象：仅显示删除按钮
    if (!isObject) return deleteButton
    
    // 非嵌套且为对象：删除按钮 + Chevron
    return [deleteButton, chevronIcon]
  }
}
```

### 已知限制

1. **性能考虑**
   - 大数组（>1000 项）可能影响性能
   - 每次数组修改都会触发完整重渲染
   
2. **验证限制**
   - 暂不支持数组级别的最小/最大长度验证提示
   - 跨数组元素的复杂验证（如唯一性）需手动处理

3. **UI 限制**
   - 删除按钮样式固定（通过 hint 插槽控制）
   - 拖拽排序功能暂未实现

### 潜在优化方向

- [ ] 虚拟滚动支持（大数组性能优化）
- [ ] 拖拽排序功能（集成 @vueuse/gesture 或 dnd-kit）
- [ ] 数组长度验证提示（`min/max` 元数据支持）
- [ ] 批量操作（全部删除、批量添加）
- [ ] 数组项展开/折叠状态持久化
- [ ] 自定义添加按钮位置（顶部/底部/内联）
