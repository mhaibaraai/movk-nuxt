import type { ColumnDefTemplate } from '@tanstack/vue-table'
import { isFunction, isString } from '@movk/core'
import type { DataTableSizePreset } from '../types/data-table'
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
