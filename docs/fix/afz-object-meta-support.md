# afz.object 元数据支持修复

## 问题描述

`afz.object` 方法无法获取 meta 属性,导致对象 schema 无法使用自定义元数据功能。

### 问题示例

```typescript
// ❌ 这样无法获取 meta
const schema = afz.object({
  name: afz.string(),
}).meta({ label: '用户信息' })

const meta = getAutoFormMetadata(schema) // 返回 {}
```

## 根本原因

在 `createObjectFactory` 函数中,直接调用了 Zod 的原生 `z.object()` 方法,没有应用 `applyMeta` 函数,导致:

1. **初始创建时未应用拦截器**: 没有调用 `applyMeta`,导致拦截器未被注册
2. **链式调用失败**: 由于初始 schema 没有拦截器,后续的 `.meta()` 调用无法正确传递元数据
3. **与其他类型不一致**: `string`、`number` 等类型使用 `createZodFactoryMethod`,会自动应用 `applyMeta`

### 原始实现

```typescript
function createObjectFactory<T extends 'object' | 'looseObject' | 'strictObject'>(
  method: T,
) {
  return ((...args: any[]) => {
    if (args.length === 0) {
      return (shape: any) => (z as any)[method](shape) // ❌ 未应用 applyMeta
    }
    return (z as any)[method](args[0]) // ❌ 未应用 applyMeta
  }) as any
}
```

## 解决方案

### 1. 修改 `createObjectFactory` 实现

为所有创建的 schema 应用 `applyMeta`,确保拦截器被正确注册:

```typescript
function createObjectFactory<T extends 'object' | 'looseObject' | 'strictObject'>(
  method: T,
) {
  return ((...args: any[]) => {
    if (args.length === 0) {
      // 柯里化写法: afz.object<State>()({...}, meta?)
      return (shape: any, meta?: any) => {
        const schema = (z as any)[method](shape)
        return meta ? applyMeta(schema, meta) : applyMeta(schema, {})
      }
    }
    // 直接写法: afz.object({...}, meta?)
    const [shape, meta] = args
    const schema = (z as any)[method](shape)
    return meta ? applyMeta(schema, meta) : applyMeta(schema, {})
  }) as any
}
```

### 2. 更新 TypeScript 类型定义

添加可选的 `meta` 参数支持:

```typescript
interface TypedZodFactory<TC extends AutoFormControls> {
  object: {
    // 1. 柯里化写法：afz.object<State>()({...}, meta?)
    <T extends object>(): <S extends Record<string, z.ZodType>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<S, z.core.$strip>

    // 2. 直接写法：afz.object({...}, meta?)
    <S extends Record<string, z.ZodType>>(
      shape: S,
      meta?: any
    ): z.ZodObject<S, z.core.$strip>
  }

  looseObject: {
    <T extends object>(): <S extends Record<string, z.ZodType>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<S, z.core.$loose>

    <S extends Record<string, z.ZodType>>(
      shape: S,
      meta?: any
    ): z.ZodObject<S, z.core.$loose>
  }

  strictObject: {
    <T extends object>(): <S extends Record<string, z.ZodType>>(
      shape: S & Partial<Record<KeysOf<T>, any>>,
      meta?: any
    ) => z.ZodObject<S, z.core.$strict>

    <S extends Record<string, z.ZodType>>(
      shape: S,
      meta?: any
    ): z.ZodObject<S, z.core.$strict>
  }
}
```

## 使用方式

修复后,`afz.object` 支持多种元数据传递方式:

### 1. 直接传入 meta 参数

```typescript
const schema = afz.object({
  name: afz.string(),
}, { label: '用户信息' })

const meta = getAutoFormMetadata(schema)
// { label: '用户信息' }
```

### 2. 链式调用 .meta()

```typescript
const schema = afz.object({
  name: afz.string(),
}).meta({ label: '用户信息' })

const meta = getAutoFormMetadata(schema)
// { label: '用户信息' }
```

### 3. 柯里化写法 + meta 参数

```typescript
interface State {
  name: string
}

const schema = afz.object<State>()({
  name: afz.string(),
}, { label: '用户信息' })

const meta = getAutoFormMetadata(schema)
// { label: '用户信息' }
```

### 4. 柯里化写法 + 链式调用

```typescript
interface State {
  name: string
}

const schema = afz.object<State>()({
  name: afz.string(),
}).meta({ label: '用户信息' })

const meta = getAutoFormMetadata(schema)
// { label: '用户信息' }
```

### 5. 多次链式调用合并元数据

```typescript
const schema = afz.object({
  name: afz.string(),
})
  .meta({ label: '用户信息' })
  .meta({ description: '请填写用户信息' })

const meta = getAutoFormMetadata(schema)
// { label: '用户信息', description: '请填写用户信息' }
```

### 6. 嵌套对象元数据

```typescript
const schema = afz.object({
  user: afz.object({
    name: afz.string(),
  }).meta({ label: '用户' }),
}).meta({ label: '表单' })

const meta = getAutoFormMetadata(schema)
// { label: '表单' }

const userMeta = getAutoFormMetadata(schema.shape.user)
// { label: '用户' }
```

## 验证测试

创建了完整的测试用例 `test/auto-form-object-meta.test.ts`,涵盖所有使用场景:

```bash
pnpm test auto-form-object-meta
```

**测试结果:**

```
✓ test/auto-form-object-meta.test.ts (7 tests) 3ms
  ✓ 应该支持在 object 创建时直接传入 meta
  ✓ 应该支持链式调用 .meta()
  ✓ 应该支持柯里化写法传入 meta
  ✓ 应该支持柯里化写法链式调用 .meta()
  ✓ 应该支持链式调用后继续获取 meta
  ✓ 应该支持嵌套 object 的 meta
  ✓ 应该支持多次调用 .meta() 合并元数据
```

✅ 所有测试通过

## 修改的文件

### 1. `src/runtime/shared/auto-form.ts`

**核心修改:**

- 修改 `createObjectFactory` 函数 - 为所有创建的 schema 应用 `applyMeta`
- 更新 `TypedZodFactory` 接口 - 为 `object`、`looseObject`、`strictObject` 添加可选 `meta` 参数

**代码量变化:** 修改 ~20 行

### 2. `test/auto-form-object-meta.test.ts` (新建)

**新增内容:**

- 7 个测试用例,覆盖所有使用场景
- 验证元数据传递、合并、嵌套等功能

**代码量变化:** 新增 ~90 行

## 技术要点

### 1. 统一元数据处理

所有 schema 创建方法(包括 `object`)都使用 `applyMeta`:

```typescript
const schema = (z as any)[method](shape)
return meta ? applyMeta(schema, meta) : applyMeta(schema, {})
```

**优势:**

- ✅ 确保拦截器被正确注册
- ✅ 支持链式调用
- ✅ 与其他类型行为一致

### 2. 支持直接传入和链式调用

```typescript
// 方式1: 直接传入
afz.object({...}, { label: '...' })

// 方式2: 链式调用
afz.object({...}).meta({ label: '...' })
```

两种方式都能正常工作,提供灵活性。

### 3. 空元数据也应用拦截器

```typescript
return meta ? applyMeta(schema, meta) : applyMeta(schema, {})
```

即使没有传入 meta,也调用 `applyMeta(schema, {})`,确保拦截器被注册,支持后续链式调用。

## 性能影响

- **拦截器注册开销**: 一次性 O(n),n 为 CLONE_METHODS 数组长度
- **元数据读取**: O(1),直接属性访问
- **内存占用**: 每个 object schema 增加一个属性 (~可忽略不计)

## 向后兼容性

✅ **完全向后兼容**

- 现有代码无需修改,继续使用链式调用 `.meta()`
- 新增可选参数,不影响现有用法
- 类型定义向后兼容

## 总结

通过为 `afz.object` 应用 `applyMeta` 函数,成功解决了对象 schema 无法获取元数据的问题。

### 解决方案特点

- ✅ **API 一致性**: 与 `string`、`number` 等类型行为一致
- ✅ **灵活性**: 支持直接传入和链式调用两种方式
- ✅ **类型安全**: 完善的 TypeScript 类型定义
- ✅ **向后兼容**: 不影响现有代码
- ✅ **测试覆盖**: 7 个测试用例,覆盖所有场景

### 技术亮点

1. **统一处理模式**: 所有 schema 创建方法都应用 `applyMeta`
2. **灵活的 API 设计**: 支持多种元数据传递方式
3. **完整的测试覆盖**: 确保功能稳定性

## 相关参考

- [Zod v4 链式调用元数据丢失问题修复](./zod-v4-metadata-chain-fix.md)
- [方法拦截模式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
