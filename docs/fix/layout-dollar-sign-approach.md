# Layout 类型推断修复方案 (v2 - `$layout` 标记方案)

## 问题回顾

使用 `afz.layout()` 方法时,TypeScript 类型推断错误:

```typescript
// 错误的实现
const schema = z.object({
  layout: afz.layout({ fields: { ... } }),
  bio: afz.string()
})

type Schema = z.output<typeof schema>
// ❌ { layout: unknown, bio?: string }
```

**根本原因**: TypeScript 类型系统和运行时分离,使用 `.shape` 展开时类型信息丢失。

## 最终解决方案

### 核心思路

**使用特殊的 `$layout` 字段标记 + 类型体操自动展开**

1. 类型层面: `ExtractLayoutShape` 类型体操自动排除 `$layout` 并展开其 fields
2. 运行时: `processLayoutShape` 函数拦截 `$layout`,展开字段并标记来源
3. 渲染时: `introspectSchema` 检测字段标记,重建布局结构

### 架构实现

#### 1. 布局标记类型

```typescript
interface LayoutFieldMarker<Fields extends Record<string, z.ZodType>> {
  __brand: 'LayoutMarker'
  class?: string
  component?: any
  fields: Fields
}
```

#### 2. 类型体操

```typescript
type ExtractLayoutShape<S> = S extends { $layout: LayoutFieldMarker<infer Fields> }
  ? Omit<S, '$layout'> & Fields
  : S
```

#### 3. 运行时处理

```typescript
function processLayoutShape(shape) {
  const resultShape = {}
  
  for (const [key, value] of Object.entries(shape)) {
    if (key === '$layout' && value.__brand === 'LayoutMarker') {
      // 展开 fields 并标记来源
      for (const [fieldKey, fieldSchema] of Object.entries(value.fields)) {
        resultShape[fieldKey] = fieldSchema
        fieldSchema[LAYOUT_SOURCE_KEY] = { id: '...', config: value }
      }
    } else {
      resultShape[key] = value
    }
  }
  
  return { shape: resultShape }
}
```

### 新 API 使用

```typescript
const schema = afz.object({
  $layout: afz.layout({
    class: 'grid grid-cols-4 gap-4',
    fields: {
      username: afz.string().min(2),
      email: afz.string().email(),
      age: afz.number()
    }
  }),
  bio: afz.string().optional()
})

type Schema = z.output<typeof schema>
// ✅ { username: string, email: string, age: number, bio?: string }
```

## 优势

1. ✅ **类型完美**: `$layout` 自动排除,fields 自动展开
2. ✅ **API 清晰**: `$layout` 明确标识这是布局配置
3. ✅ **运行时正确**: 字段标记保证布局能正确渲染
4. ✅ **类型安全**: 完全自动推断,无需手动类型断言

## 使用示例

### 基本用法

```typescript
const schema = afz.object({
  $layout: afz.layout({
    class: 'grid grid-cols-2',
    fields: {
      firstName: afz.string(),
      lastName: afz.string()
    }
  }),
  bio: afz.string().optional()
})

type User = z.output<typeof schema>
// { firstName: string, lastName: string, bio?: string }
```

### 嵌套布局

```typescript
const schema = afz.object({
  $layout: afz.layout({
    fields: {
      username: afz.string(),
      email: afz.string()
    }
  }),
  address: afz.object({
    $layout: afz.layout({
      class: 'grid grid-cols-3',
      fields: {
        city: afz.string(),
        state: afz.string(),
        zip: afz.string()
      }
    })
  }).optional()
})
```

## 相关文件

- `src/runtime/utils/auto-form-factory.ts` - 核心实现
- `src/runtime/utils/auto-form.ts` - 布局重建逻辑  
- `playground/app/pages/components/auto-form/basic.vue` - 示例
