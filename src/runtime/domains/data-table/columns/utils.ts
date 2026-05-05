import type { ColumnDefTemplate } from '@tanstack/vue-table'
import type { DataTableDataColumn, DataTableSizePreset } from '../../../types/data-table'
import { isFunction, isString } from '@movk/core'
import { SIZE_PRESET_MAP } from './constants'

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
