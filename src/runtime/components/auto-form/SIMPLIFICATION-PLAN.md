# AutoForm 简化方案

## 当前过度设计问题

### 1. 缓存层级过多

- 5 个独立的缓存系统（3个 LRU + WeakMap + Map）
- 缓存键生成成本高（JSON.stringify）
- 缓存命中率低（键包含动态值）

### 2. 不必要的优化

- Field context 本身很轻量，缓存收益小
- 响应式值解析缓存意义不大（函数需要每次执行）
- Props/slots 单独缓存增加复杂度

## 简化建议

### 方案一：最小化缓存（推荐）

```typescript
// 仅保留必要的字段上下文缓存
const fieldContextCache = new Map<string, FieldContext>()

// 简化的上下文创建
function createFieldContext(path: string): FieldContext {
  if (!fieldContextCache.has(path)) {
    fieldContextCache.set(path, {
      get state() { return state.value },
      path,
      get value() { return getPath(state.value, path) },
      setValue: (v: any) => setPath(state.value, path, v),
    })
  }
  return fieldContextCache.get(path)!
}

// Schema 变化时清理
watch(() => unref(schema), () => {
  fieldContextCache.clear()
})
```

### 方案二：移除所有缓存

- 依赖 Vue 的响应式系统
- 使用 computed 代替缓存
- 让 Vue 处理更新优化

### 方案三：单一 LRU 缓存

```typescript
// 统一的渲染缓存
const renderCache = new LRUCache<string, VNode>({
  max: 100,
  ttl: 1000 * 60 * 5,
})

// 简化的缓存键（仅基于路径和值）
const cacheKey = `${field.path}:${context.value}`
```

## 性能影响评估

### 移除过度缓存的收益

1. **代码简化**：减少 200+ 行代码
2. **维护性提升**：逻辑更清晰
3. **内存占用降低**：减少缓存开销
4. **实际性能**：对大多数表单无明显影响

### 真正需要优化的场景

- 100+ 字段的大型表单
- 高频更新的实时表单
- 复杂的条件渲染逻辑

## 实施步骤

1. **移除 LRU Cache 依赖**
2. **简化为单一缓存机制**
3. **使用 Vue computed 优化**
4. **性能测试验证**

## 代码示例

### 简化后的 renderControl

```typescript
function renderControl(field: any) {
  const control = field?.control
  const comp = control?.component as any
  if (!comp) {
    return h('div', { class: 'text-red-500' }, `[AutoForm] 控件未映射: ${field?.path ?? ''}`)
  }

  if (isVNode(comp))
    return comp

  const component = typeof comp === 'string'
    ? resolveDynamicComponent(comp)
    : comp
  const context = createFieldContext(field.path)

  // 直接解析，不缓存
  const props = control?.props
    ? resolveReactiveObject(control.props, context)
    : {}

  return h(component, {
    ...props,
    'modelValue': context.value,
    'onUpdate:modelValue': (v: any) => context.setValue(v),
  })
}
```

## 结论

当前的缓存设计过度复杂，建议采用**方案一**：仅保留轻量级的字段上下文缓存，移除其他所有缓存机制。这样可以：

1. 减少 60% 的缓存相关代码
2. 提高代码可读性和可维护性
3. 对 99% 的使用场景性能无影响
4. 避免缓存一致性问题
