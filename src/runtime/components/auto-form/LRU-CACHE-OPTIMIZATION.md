# LRU Cache 性能优化方案

## 实现概述

使用 `lru-cache` v11.2.1 替代原有的 `useMemoize` 和 `WeakMap` 缓存机制，提供更智能的缓存管理。

## LRU Cache 配置

```typescript
const LRU_CACHE_CONFIG = {
  // Field Context 缓存
  contextCache: {
    max: 100, // 最多缓存 100 个字段上下文
    ttl: 1000 * 60 * 5, // 5 分钟 TTL
  },
  // 渲染结果缓存
  renderCache: {
    max: 50, // 最多缓存 50 个渲染结果
    ttl: 1000 * 60 * 2, // 2 分钟 TTL
    updateAgeOnGet: true, // 访问时更新时间
  },
  // 解析结果缓存
  resolveCache: {
    max: 200, // 最多缓存 200 个解析结果
    ttl: 1000 * 60 * 1, // 1 分钟 TTL
  },
}
```

## 主要优势

### 1. **自动内存管理**

- 限制最大缓存数量，防止内存泄漏
- LRU 策略自动淘汰最少使用的项
- TTL 确保缓存不会无限期存在

### 2. **性能优化**

- O(1) 的 get/set 操作
- 智能的缓存键生成策略
- 分层缓存（context、render、resolve）

### 3. **缓存策略**

#### Field Context 缓存

```typescript
function createFieldContext(path: string): FieldContext {
  const cached = fieldContextLRU.get(path)
  if (!cached) {
    // 创建新 context，使用 getter 确保动态获取最新值
    const context: FieldContext = {
      get state() { return state.value },
      path,
      get value() { return getPath(state.value, path) },
      setValue: (v: any) => setPath(state.value, path, v),
    }
    fieldContextLRU.set(path, context)
  }
  return cached
}
```

#### 渲染缓存

```typescript
// 生成包含状态的缓存键
const cacheKey = `${field.path}:${JSON.stringify({
  value: context.value,
  props: control?.props || {},
  hidden: field.meta?.hidden,
})}`

// 尝试从缓存获取
const vnode = renderLRU.get(cacheKey)
if (vnode)
  return vnode

// ... 渲染逻辑 ...

// 缓存结果
renderLRU.set(cacheKey, vnode)
```

### 4. **缓存失效机制**

```typescript
// 监听 schema 变化，清理所有缓存
watch(() => unref(schema), () => {
  clearAllCaches()
}, { deep: false })

function clearAllCaches() {
  fieldContextLRU.clear()
  renderLRU.clear()
  resolveLRU.clear()
  fieldContextCache.value.clear()
  renderCache.clear()
}
```

## 性能对比

### 之前的问题

1. `useMemoize` 缓存了包含过时 state 引用的结果
2. `WeakMap` 无法控制缓存大小
3. 没有 TTL，缓存可能永久存在

### LRU Cache 解决方案

1. **智能缓存键**：包含状态信息，确保缓存正确性
2. **大小限制**：防止内存无限增长
3. **TTL 机制**：自动清理过期缓存
4. **LRU 策略**：优先保留常用缓存

## 使用建议

1. **调整缓存大小**：根据实际表单字段数量调整 `max` 值
2. **调整 TTL**：根据表单更新频率调整缓存时间
3. **监控性能**：使用 LRU Cache 的统计功能监控命中率

```typescript
// 获取缓存统计
console.log({
  contextCache: {
    size: fieldContextLRU.size,
    calculatedSize: fieldContextLRU.calculatedSize,
  },
  renderCache: {
    size: renderLRU.size,
    calculatedSize: renderLRU.calculatedSize,
  }
})
```

## 注意事项

1. **缓存键生成**：确保包含所有影响渲染的因素
2. **TTL 设置**：过短会降低缓存效果，过长可能导致过时数据
3. **内存监控**：定期检查缓存大小，避免内存问题

## 未来优化

1. **分级缓存**：根据字段类型使用不同的缓存策略
2. **预加载**：预先缓存可能用到的字段
3. **缓存预热**：初始化时预填充常用缓存
4. **性能指标**：添加缓存命中率监控
