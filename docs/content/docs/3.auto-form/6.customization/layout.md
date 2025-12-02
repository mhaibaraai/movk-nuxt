---
title: 布局系统
description: 使用布局系统灵活控制表单字段的视觉呈现和组织结构
---

## 基础用法

### 简单容器布局

使用 `afz.layout` 创建一个基础的容器布局，通过 `class` 属性控制样式：

::component-example
---
name: 'auto-form-layout-simple-example'
collapse: true
props:
  class: 'px-4'
---
::

::note
布局字段的 key（如 `$layout`）以 `$` 开头是惯例写法，但不是必需的。你可以使用任何字段名，只要其值为 `afz.layout()` 即可。
::

### 网格布局

使用 CSS Grid 创建多列布局，通过字段级别的 `class` 控制跨列：

::component-example
---
name: 'auto-form-layout-grid-example'
collapse: true
props:
  class: 'px-4'
---
::

### 响应式多列布局

利用 Tailwind 的响应式前缀，创建自适应不同屏幕尺寸的布局：

::component-example
---
name: 'auto-form-layout-responsive-example'
collapse: true
props:
  class: 'px-4'
---
::

::tip
使用 Tailwind 的响应式前缀（`md:`、`lg:`）可以轻松实现跨设备的自适应布局。字段可以通过 `col-span-full` 占据整行。
::

## 高级布局容器

### 手风琴布局

使用 Nuxt UI 的 `UAccordion` 组件，将字段组织在可折叠的面板中：

::component-example
---
name: 'auto-form-layout-accordion-example'
collapse: true
props:
  class: 'px-4'
---
::

::tip
`fieldSlots` 用于将不同字段分配到布局组件的不同插槽中。插槽名称需要与 `items` 中定义的 `slot` 对应。
::

### 标签页布局

使用 `UTabs` 组件创建分页式表单，支持动态响应式配置：

::component-example
---
name: 'auto-form-layout-tabs-example'
collapse: true
props:
  class: 'px-4'
---
::

::tip
标签页布局展示了如何根据表单状态动态调整布局结构。切换用户类型时，标签页标题和字段分布会自动更新。
::

::warning
在使用条件渲染（`if`）时，建议将字段标记为 `.optional()`，避免验证错误。
::

## 布局配置详解

### AutoFormLayoutConfig

`afz.layout` 接受一个配置对象，包含以下属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| `component` | `Component \| string`{lang="ts-type"} | 布局容器组件（默认：`'div'`） |
| `class` | `string \| (context) => string`{lang="ts-type"} | CSS 类名，支持响应式函数 |
| `props` | `object \| (context) => object`{lang="ts-type"} | 组件属性，支持响应式函数 |
| `slots` | `Record<string, () => VNode> \| (context) => ...`{lang="ts-type"} | 组件插槽内容 |
| `fields` | `Record<string, ZodType>`{lang="ts-type"} | 包含的字段定义 |
| `fieldSlot` | `string \| (context) => string`{lang="ts-type"} | 将**所有**字段渲染到指定插槽 |
| `fieldSlots` | `Record<string, string> \| (context) => ...`{lang="ts-type"} | 将**不同**字段分配到不同插槽 |

### 响应式配置函数

`class`、`props`、`slots`、`fieldSlot` 和 `fieldSlots` 都支持响应式函数，接收一个上下文对象：

```ts
interface LayoutContext {
  state: FormState          // 表单当前状态
  path: string             // 布局字段的路径
  value: any               // 布局字段的值（通常为空）
  setValue: (value) => void // 设置值的函数
}
```

**示例**:

```ts
afz.layout({
  class: ({ state }) => state?.mode === 'advanced'
    ? 'grid grid-cols-3 gap-4'
    : 'space-y-4',

  props: ({ state }) => ({
    disabled: state?.readOnly === true
  })
})
```

### fieldSlot vs fieldSlots

- **`fieldSlot`** - 将所有字段渲染到同一个插槽，适用于简单场景：

```ts
afz.layout({
  component: UAccordion,
  fieldSlot: 'content',  // 所有字段都渲染到 'content' 插槽
  fields: { /* ... */ }
})
```

- **`fieldSlots`** - 精确控制每个字段的插槽位置，适用于分组场景：

```ts
afz.layout({
  component: UAccordion,
  fieldSlots: {
    name: 'panel-1',
    email: 'panel-1',
    bio: 'panel-2'
  },
  fields: { /* ... */ }
})
```

## 嵌套布局

布局字段可以无限嵌套，构建复杂的层级结构：

::component-example
---
name: 'auto-form-layout-nested-example'
collapse: true
props:
  class: 'px-4'
---
::

::note
嵌套布局的深度没有限制，但过深的嵌套可能影响可读性。建议保持在 2-3 层。
::

## 数据提取机制

布局字段在数据验证时会被**自动展开**为其内部的实际数据字段：

```ts
const schema = afz.object({
  $layout: afz.layout({
    fields: {
      name: afz.string(),
      email: afz.email()
    }
  })
})

// 表单数据结构（不包含 $layout）
const formData = {
  name: 'John',
  email: 'john@example.com'
}
```

这个机制由 `extractPureSchema` 函数实现，它会递归遍历 schema，提取所有布局字段中的实际数据字段，生成一个“纯净”的验证 schema。

::tip
这意味着你可以自由调整布局结构，而不影响现有的数据结构或验证逻辑。
::
