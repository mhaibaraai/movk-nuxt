import type { Ref, WritableComputedRef } from 'vue'
import { computed, onMounted, watch } from 'vue'
import { areSameKeys } from './keys'

/** 未绑定时回退到默认值的可写模型；`syncBack` 为真时在挂载后把默认值回写给父组件 */
export function useEffectiveModel<V>(
  model: Ref<V | undefined>,
  getDefault: () => V,
  syncBack?: (value: V) => boolean,
  // expanded 模型类型含布尔字面量 true，未绑定时 Vue 会将其降级为 false（而非 undefined），需视作未设置
  isUnset: (value: V | undefined) => boolean = value => value === undefined
): WritableComputedRef<V> {
  const effective = computed<V>({
    get: () => isUnset(model.value) ? getDefault() : model.value as V,
    set: (value) => { model.value = value }
  })

  if (syncBack !== undefined) {
    onMounted(() => {
      if (!isUnset(model.value)) return
      const defaults = getDefault()
      if (syncBack(defaults)) model.value = defaults
    })
  }

  return effective
}

/** 双向同步 key 数组与 TanStack 记录形式的状态，`updating` 防止回环 */
export function useSyncKeys<R>(
  keys: Ref<string[] | undefined>,
  record: Ref<R | undefined>,
  toRecord: (keys: string[]) => R,
  toKeys: (record: R) => string[]
): void {
  let updating = false

  watch(keys, (next) => {
    if (updating) return
    const current = record.value !== undefined ? toKeys(record.value) : []
    if (areSameKeys(current, next ?? [])) return
    updating = true
    record.value = toRecord(next ?? [])
    updating = false
  }, { deep: true })

  // 只回写已绑定的 key 模型，否则未使用 key 形式的表格会凭空多出一份白名单
  watch(record, (next) => {
    if (updating) return
    if (next === undefined || keys.value === undefined) return
    const derived = toKeys(next)
    if (areSameKeys(derived, keys.value ?? [])) return
    updating = true
    keys.value = derived
    updating = false
  }, { deep: true })
}
