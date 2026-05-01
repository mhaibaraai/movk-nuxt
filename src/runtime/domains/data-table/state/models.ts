import type { ColumnDefTemplate } from '@tanstack/vue-table'
import type { Ref, WritableComputedRef } from 'vue'
import type { DataTableDataColumn, DataTableSizePreset } from '../../../types/data-table'
import { computed, onMounted, watch } from 'vue'
import { isFunction, isString } from '@movk/core'
import { SIZE_PRESET_MAP } from '../columns/constants'

export function resolveCallbackValue<V, A>(valueOrFn: V | ((arg: A) => V), arg: A): V {
  return isFunction(valueOrFn) ? valueOrFn(arg) : valueOrFn
}

export function resolveColumnFlag<T>(
  colValue: boolean | undefined,
  globalValue: boolean | ((col: DataTableDataColumn<T>) => boolean) | undefined,
  col: DataTableDataColumn<T>,
  fallback = false
): boolean {
  if (colValue !== undefined) return colValue
  if (typeof globalValue === 'function') return globalValue(col)
  return globalValue ?? fallback
}

export function resolveTemplate<TProps extends object>(
  template: ColumnDefTemplate<TProps>,
  props: TProps
): unknown {
  return isFunction(template) ? template(props) : template
}

export function resolvePresetSize(size: number | DataTableSizePreset): number {
  return isString(size) ? SIZE_PRESET_MAP[size] : size
}

export function resolveTableResetKey(options: {
  columnResizeMode: 'onChange' | 'onEnd'
  resizable: boolean
  sortable: boolean
  pinable: boolean
  hasColumnPinning: boolean
  hasColumnResizing: boolean
  hasColumnSort: boolean
  manualPagination: boolean
}): string {
  const flags = [
    options.resizable,
    options.sortable,
    options.pinable,
    options.hasColumnPinning,
    options.hasColumnResizing,
    options.hasColumnSort,
    options.manualPagination
  ].reduce((mask, enabled, index) => mask | ((enabled ? 1 : 0) << index), 0)

  return `${options.columnResizeMode === 'onEnd' ? 'e' : 'c'}${flags.toString(36)}`
}

function areSameKeys(a: readonly (string | number)[], b: readonly (string | number)[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a.map(String))
  for (const key of b) {
    if (!set.has(String(key))) return false
  }
  return true
}

export function useEffectiveModel<T>(
  model: Ref<T | undefined>,
  getDefault: () => T,
  syncBack?: boolean | ((value: T) => boolean)
): WritableComputedRef<T> {
  const effective = computed<T>({
    get: () => model.value !== undefined ? model.value : getDefault(),
    set: (value) => { model.value = value }
  })

  if (syncBack !== undefined) {
    onMounted(() => {
      if (model.value !== undefined) return
      const defaults = getDefault()
      const shouldSync = typeof syncBack === 'function' ? syncBack(defaults) : syncBack
      if (shouldSync) {
        model.value = defaults
      }
    })
  }

  return effective
}

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

  watch(record, (next) => {
    if (updating) return
    if (next === undefined) return
    const derived = toKeys(next)
    if (areSameKeys(derived, keys.value ?? [])) return
    updating = true
    keys.value = derived
    updating = false
  }, { deep: true })
}
