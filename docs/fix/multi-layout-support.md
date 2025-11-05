# Layout 布局系统 - 多布局支持

## 问题背景

使用固定 `$layout` 键名时，无法在同一对象中定义多个布局：

```typescript
// ❌ 错误：对象键名不能重复
const schema = afz.object({
  $layout: afz.layout({ fields: { firstName, lastName } }),
  bio: afz.string(),
  $layout: afz.layout({ fields: { avatar, website } })  // 语法错误！
})
```

**问题**: JavaScript 对象键名必须唯一，无法支持多个布局标记。

## 解决方案

### 核心设计

通过 `__brand: 'LayoutMarker'` 识别布局标记，支持任意键名：

```
用户代码              类型层面                  运行时                    渲染层
  ↓                      ↓                        ↓                         ↓
任意键名          FilterLayoutMarkers    processLayoutShape      handleLayoutFields
布局标记    →    类型自动过滤+展开   →   收集配置+记录顺序   →    按顺序渲染
```

### 实现架构

#### 1. 布局标记识别

```typescript
interface LayoutFieldMarker<Fields> {
  __brand: 'LayoutMarker'  // 标识符，不依赖键名
  class?: string
  component?: any
  props?: any
  slots?: any
  fields: Fields
}

function isLayoutMarker(value: any): boolean {
  return value?.__brand === 'LayoutMarker'
}
```

#### 2. 类型层 - 自动过滤和展开

```typescript
// 移除所有布局标记字段
type FilterLayoutMarkers<S> = {
  [K in keyof S as S[K] extends LayoutFieldMarker<any> ? never : K]: S[K]
}

// 提取所有布局的 fields 并合并
type ExtractAllLayoutFields<S> = UnionToIntersection<
  { [K in keyof S]: S[K] extends LayoutFieldMarker<infer Fields> ? Fields : {} }[keyof S]
>

// 最终类型 = 普通字段 + 所有布局字段
type ExtractLayoutShape<S> = FilterLayoutMarkers<S> & ExtractAllLayoutFields<S>
```
#### 3. 运行时 - 字段展开和顺序追踪

```typescript
function processLayoutShape(shape): {
  shape: Record<string, ZodType>
  layouts: AutoFormLayoutConfig[]
  fieldOrder: Array<{ key: string, type: 'layout' | 'field', layoutIndex?: number }>
} {
  const layouts = []
  const resultShape = {}
  const fieldOrder = []

  for (const [key, value] of Object.entries(shape)) {
    if (isLayoutMarker(value)) {
      // 收集布局配置并记录位置
      const layoutIndex = layouts.length
      layouts.push({ ...value, __originalKey: key })
      fieldOrder.push({ key, type: 'layout', layoutIndex })
      
      // 展开布局字段到 shape（供 Zod 验证）
      Object.assign(resultShape, value.fields)
    } else {
      // 普通字段：保留并记录位置
      resultShape[key] = value
      fieldOrder.push({ key, type: 'field' })
    }
  }

  return { shape: resultShape, layouts, fieldOrder }
}
```

**关键数据**：
- `layouts`: 布局配置数组
- `fieldOrder`: 渲染顺序数组
- `resultShape`: 展开后的 shape，只包含数据字段

#### 4. 元数据存储 - Zod v4 不可变传递

```typescript
function applyMeta(schema, meta, layouts, fieldOrder) {
  schema[AUTOFORM_LAYOUT_KEY] = layouts
  schema[AUTOFORM_FIELD_ORDER_KEY] = fieldOrder
  
  // 拦截所有克隆方法，确保链式调用时传递元数据
  interceptCloneMethods(schema, meta, layouts, fieldOrder)
  return schema
}
```

#### 5. 渲染层 - 按顺序重建布局

```typescript
function handleLayoutFields(schema, layoutConfigs, ...): AutoFormField[] {
  const fieldOrder = getAutoFormFieldOrder(schema)
  const processedShape = schema.shape
  const result = []
  
  for (const item of fieldOrder) {
    if (item.type === 'layout') {
      // 渲染整个布局（包含其所有字段）
      const layoutConfig = layoutConfigs[item.layoutIndex]
      result.push(...handleLayoutField(schema, layoutConfig, ...))
    } else {
      // 渲染独立字段
      const fieldSchema = processedShape[item.key]
      result.push(...introspectSchema(fieldSchema, ...))
    }
  }
  
  return result
}
```

## API 使用

### 单个布局

```typescript
const schema = afz.object({
  nameLayout: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      firstName: afz.string().min(2),
      lastName: afz.string()
    }
  }),
  bio: afz.string().optional()
})

type User = z.output<typeof schema>
// ✅ { firstName: string, lastName: string, bio?: string }
// 注意：nameLayout 不在类型中
```

### 多个布局

```typescript
const schema = afz.object({
  userName: afz.string(),
  nameLayout: afz.layout({
    class: 'grid grid-cols-2',
    fields: {
      firstName: afz.string(),
      lastName: afz.string()
    }
  }),
  bio: afz.string(),
  profileLayout: afz.layout({
    class: 'flex gap-4',
    fields: {
      avatar: afz.string(),
      website: afz.string()
    }
  }),
  settings: afz.boolean()
})

type Profile = z.output<typeof schema>
// ✅ { userName, firstName, lastName, bio, avatar, website, settings }

// 渲染顺序：userName → nameLayout → bio → profileLayout → settings
```

### 嵌套布局

```typescript
const schema = afz.object({
  mainLayout: afz.layout({
    class: 'grid grid-cols-4',
    fields: {
      field1: afz.string(),
      field2: afz.string()
    }
  }),
  settings: afz.object({
    settingsLayout: afz.layout({
      class: 'grid grid-cols-2',
      fields: {
        notifications: afz.boolean(),
        autoSave: afz.boolean()
      }
    })
  }).meta({ label: '设置' }).optional()
})
```

## 技术优势

1. **完美类型推断**: 布局标记自动过滤，字段自动展开
2. **多布局支持**: 使用任意键名，不受对象键名限制
3. **顺序保证**: 按原始定义顺序渲染
4. **嵌套支持**: 多层嵌套布局，保留所有装饰器信息
5. **零侵入**: 不影响 Zod 原生验证逻辑

## 关键技术点

### UnionToIntersection 类型体操

```typescript
// 合并多个布局的 fields
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

// 示例：UnionToIntersection<{ a: string } | { b: number }> → { a: string } & { b: number }
```

### Zod v4 不可变设计

所有链式调用都会创建新实例，需要拦截克隆方法传递元数据：

```typescript
for (const methodName of CLONE_METHODS) {
  schema[methodName] = function(...args) {
    const newSchema = originalMethod.apply(this, args)
    newSchema[AUTOFORM_LAYOUT_KEY] = layouts
    newSchema[AUTOFORM_FIELD_ORDER_KEY] = fieldOrder
    return interceptCloneMethods(newSchema, meta, layouts, fieldOrder)
  }
}
```

### JavaScript 对象键顺序

ES2015+ 保证对象键顺序（字符串键按插入顺序），因此 `Object.entries(shape)` 遍历顺序即定义顺序。

## 相关文件

- `src/runtime/utils/auto-form-factory.ts` - 类型体操 + 运行时处理
- `src/runtime/utils/auto-form.ts` - 渲染策略
- `playground/app/pages/components/auto-form/basic.vue` - 测试示例
