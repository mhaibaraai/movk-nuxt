import { toValue } from 'vue'

/**
 * 递归解包嵌套 ref，产出纯值结构
 *
 * @description Vue 的 toValue 仅解包顶层 ref，不会解包普通对象 / 数组内部的嵌套 ref。
 * useApiFetch 的 query / body 常写成 `{ key: ref }`（Nuxt useFetch 允许字段为 ref），
 * 若仅浅解包，buildApiFetchKey 序列化时会把 Ref 对象本身计入，导致不同值派生出相同 key 而缓存碰撞。
 * 仅对纯对象 / 数组递归；Date / File / FormData 等非纯对象原样返回，避免破坏与栈溢出。
 */
export function deepToValue(value: unknown): unknown {
  const resolved = toValue(value)
  if (Array.isArray(resolved)) return resolved.map(deepToValue)
  if (resolved !== null && typeof resolved === 'object'
    && Object.getPrototypeOf(resolved) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(resolved).map(([k, v]) => [k, deepToValue(v)])
    )
  }
  return resolved
}
