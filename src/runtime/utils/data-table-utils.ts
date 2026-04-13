import type { ColumnDefTemplate } from '@tanstack/vue-table'
import { isFunction, isString } from '@movk/core'
import type { DataTableDataColumn, DataTableSizePreset } from '../types/data-table'
import { SIZE_PRESET_MAP } from '../constants/data-table'

/**
 * 统一处理「值或回调」模式
 *
 * 用于 rowClass、disabled、hidden、actions 等 8+ 处
 */
export function resolveCallbackValue<V, A>(valueOrFn: V | ((arg: A) => V), arg: A): V {
  return isFunction(valueOrFn) ? valueOrFn(arg) : valueOrFn
}

/**
 * 解析列级布尔配置（pinable / sortable / resizable）
 *
 * 优先级：列级显式值 > 全局函数/值 > fallback
 */
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

/**
 * 解析 TanStack ColumnDefTemplate：string 直接返回，function 则传入 props 调用
 */
export function resolveTemplate<TProps extends object>(
  template: ColumnDefTemplate<TProps>,
  props: TProps
): unknown {
  return isFunction(template) ? template(props) : template
}

/**
 * 将预设字符串或数值解析为 TanStack 的数值 size
 */
export function resolvePresetSize(size: number | DataTableSizePreset): number {
  return isString(size) ? SIZE_PRESET_MAP[size] : size
}

/**
 * 递归收集树形数据所有节点的 key
 */
export function collectTreeKeys<T extends Record<string, unknown>>(
  rows: T[],
  childrenKey: string,
  idKey: string,
  onlyExpandable = false
): (string | number)[] {
  const keys: (string | number)[] = []

  function walk(items: T[]): void {
    for (const item of items) {
      const children = item[childrenKey]
      const hasChildren = Array.isArray(children) && children.length > 0

      const id = item[idKey]
      if (id != null && (!onlyExpandable || hasChildren)) {
        keys.push(id as string | number)
      }

      if (hasChildren) {
        walk(children as T[])
      }
    }
  }

  walk(rows)
  return keys
}
