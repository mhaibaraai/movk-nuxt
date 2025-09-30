# Zod v4 链式调用元数据丢失问题修复

## 问题描述

在使用 Zod v4 进行表单 schema 定义时，通过链式调用方法（如 `.meta()`、`.nonempty()` 等）会导致自定义元数据丢失。

### 问题示例

```typescript
const schema = afz.string({
  controlProps: ({ value }) => ({
    placeholder: `请输入姓名${value}`,
    class: 'w-100px',
  }),
})
  .meta({
    hidden: ({ state }) => state.visibleTest,
    label: ({ value }) => `${value} 姓名`,
  })
  .nonempty()
```

**预期行为**：schema 应包含 `controlProps`、`hidden`、`label` 三个元数据属性

**实际行为**：调用 `.meta()` 和 `.nonempty()` 后，`controlProps` 元数据丢失

## 根本原因

Zod v4 采用**不可变设计（Immutable Design）**，每次调用链式方法时都会返回一个新的 schema 实例：

```typescript
const schema1 = z.string()              // 实例 A
const schema2 = schema1.nonempty()      // 返回新实例 B（不是 A）
const schema3 = schema2.meta({...})     // 返回新实例 C（不是 B）
```

初始尝试使用直接属性存储元数据，但链式调用会丢失：
- 实例 A 上存储的元数据无法传递到实例 B 和 C
- 每次克隆都会创建新对象，原始属性不会被复制
- 链式调用越多，元数据丢失越严重

## 解决方案：方法拦截（Method Interception）

### 核心思路

在原始 schema 实例上拦截所有会返回新实例的方法，在新实例创建时**自动复制元数据**。

### 实现步骤

#### 1. 定义需要拦截的方法列表

```typescript
const CLONE_METHODS = [
  'meta', 'optional', 'nullable', 'nullish', 'array', 'promise',
  'or', 'and', 'transform', 'default', 'catch', 'pipe', 'readonly',
  'describe', 'brand', 'min', 'max', 'length', 'nonempty', 'email',
  'url', 'uuid', 'regex', 'trim', 'toLowerCase', 'toUpperCase',
  'startsWith', 'endsWith', 'includes', 'datetime', 'ip',
]
```

#### 2. 实现拦截器函数

```typescript
/**
 * 拦截 Zod Schema 的克隆方法，实现元数据自动传递
 */
function interceptCloneMethods<T extends z.ZodType>(
  schema: T,
  customMeta: Record<string, any>
): T {
  for (const methodName of CLONE_METHODS) {
    const originalMethod = (schema as any)[methodName]
    if (!originalMethod || typeof originalMethod !== 'function') {
      continue
    }

    // 替换原方法
    (schema as any)[methodName] = function (...args: any[]) {
      // 调用原始方法获取新 schema
      const newSchema = originalMethod.apply(this, args)

      // 特殊处理 .meta()：合并新旧元数据
      let newMeta = customMeta
      if (methodName === 'meta' && args.length > 0 && args[0]) {
        newMeta = { ...customMeta, ...args[0] }
      }

      // 将元数据存储到新 schema
      (newSchema as any)[AUTOFORM_META_KEY] = newMeta

      // 递归拦截新 schema 的方法
      interceptCloneMethods(newSchema, newMeta)

      return newSchema
    }
  }

  return schema
}
```

#### 3. 在 applyMeta 中调用拦截器

```typescript
function applyMeta<T extends z.ZodType, M = unknown>(
  schema: T,
  meta?: M,
): T {
  if (!meta) return schema

  // 存储元数据到 schema 实例
  (schema as any)[AUTOFORM_META_KEY] = meta

  // 拦截所有会克隆的方法，确保链式调用时元数据不丢失
  interceptCloneMethods(schema, meta as Record<string, any>)

  return schema
}
```

#### 4. 提取元数据

```typescript
export function getAutoFormMetadata(schema: z.ZodType): Record<string, any> {
  return (schema as any)[AUTOFORM_META_KEY] || {}
}
```

### 工作原理

```typescript
// 1. 创建 schema 并应用元数据
const schema1 = afz.string({ controlProps: ... })
// → 调用 applyMeta，存储 { controlProps } 到 __autoform_meta__
// → 拦截 schema1 的所有克隆方法

// 2. 调用 .meta()
const schema2 = schema1.meta({ hidden: ..., label: ... })
// → 触发拦截器
// → 合并元数据：{ controlProps, hidden, label }
// → 存储到 schema2 的 __autoform_meta__
// → 递归拦截 schema2 的所有克隆方法

// 3. 调用 .nonempty()
const schema3 = schema2.nonempty()
// → 触发拦截器
// → 传递完整元数据：{ controlProps, hidden, label }
// → 存储到 schema3 的 __autoform_meta__
// → 递归拦截 schema3 的所有克隆方法
```

## 验证结果

修复后，元数据成功传递到最终 schema：

```typescript
const schema = afz.string({ controlProps: ... })
  .meta({ hidden: ..., label: ... })
  .nonempty()

// 提取元数据
const metadata = getAutoFormMetadata(schema)
// {
//   controlProps: [Function],
//   hidden: [Function],
//   label: [Function]
// }
```

✅ 所有元数据成功传递到最终 schema

## 关键技术点

### 1. 直接属性存储

```typescript
// 直接在 schema 实例上存储元数据
(schema as any)[AUTOFORM_META_KEY] = metadata
```

**优势：**
- 简单直接，无需额外数据结构
- 性能最优，直接属性访问
- 代码更清晰，易于理解和维护

### 2. .meta() 方法特殊处理

```typescript
if (methodName === 'meta' && args.length > 0 && args[0]) {
  newMeta = { ...customMeta, ...args[0] }  // 合并新旧元数据
}
```

确保用户调用 Zod 原生的 `.meta()` 时，不会覆盖我们的自定义元数据。

### 3. 递归拦截

```typescript
interceptCloneMethods(newSchema, newMeta)
```

确保链式调用的每一层都能继续传递元数据。

## 修改的文件

### 1. `src/runtime/shared/auto-form.ts`

**核心修改：**
- 新增 `AUTOFORM_META_KEY` 常量 - 元数据存储键名
- 新增 `CLONE_METHODS` 数组 - 需要拦截的方法列表
- 新增 `interceptCloneMethods()` 函数 - 方法拦截器实现
- 简化 `applyMeta()` 函数 - 直接存储元数据并拦截
- 简化 `getAutoFormMetadata()` 函数 - 单行读取

**代码量变化：** 新增 ~50 行核心逻辑

### 2. `src/runtime/utils/auto-form.ts`

**核心修改：**
- 简化 `extractSchemaInfo()` 函数 - 直接内联读取元数据，无需遍历链
- 新增 `extractChecks()` 函数 - 提取 Zod checks 信息

**代码量变化：** 删除 ~15 行冗余代码

### 代码简化总结

通过优化实现，相比初始版本：
- ❌ 删除 WeakMap 备用存储（~5 行）
- ❌ 删除 collectAllMetadata 函数（~15 行）
- ❌ 删除复杂的链式遍历逻辑（~20 行）
- ✅ 保留核心拦截机制（~50 行）
- **总计：** 简化代码约 40 行，保留核心功能

## 总结

通过**方法拦截（Method Interception）**技术，成功解决了 Zod v4 不可变设计导致的元数据丢失问题。

### 解决方案特点

- ✅ **API 兼容性**：保持 Zod 原生 API 不变，用户无需改变使用习惯
- ✅ **动态元数据**：支持函数形式的元数据（如 `controlProps`）
- ✅ **元数据合并**：`.meta()` 方法自动合并新旧元数据
- ✅ **代码简洁**：核心实现仅 ~50 行，易于理解和维护
- ✅ **性能优化**：直接属性访问，无额外数据结构开销
- ✅ **向后兼容**：完全兼容现有代码

### 技术亮点

1. **方法拦截模式**：在对象方法上进行 AOP（面向切面编程）
2. **递归传播**：确保多层链式调用都能保持元数据
3. **智能合并**：特殊处理 `.meta()` 方法，避免覆盖
4. **最小侵入**：仅在必要时拦截，不影响 Zod 原有功能

### 性能影响

- 拦截开销：O(n)，n 为 CLONE_METHODS 数组长度（一次性）
- 元数据读取：O(1)，直接属性访问
- 内存占用：每个 schema 实例增加一个属性（~可忽略不计）

## 相关参考

- [Zod v4 不可变设计](https://github.com/colinhacks/zod)
- [JavaScript 方法拦截模式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [面向切面编程（AOP）](https://en.wikipedia.org/wiki/Aspect-oriented_programming)