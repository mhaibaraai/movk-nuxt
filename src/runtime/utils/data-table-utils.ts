import { isFunction, isString } from '@movk/core'
import type { DataTableSizePreset } from '../types/data-table'
import { SIZE_PRESET_MAP } from '../constants/data-table'

/**
 * 统一处理「值或回调」模式
 *
 * 用于 rowClass、disabled、hidden、actions 等 8+ 处
 */
export function resolveCallbackValue<T, A>(valueOrFn: T | ((arg: A) => T), arg: A): T {
  return isFunction(valueOrFn) ? valueOrFn(arg) : valueOrFn
}

/**
 * 将预设字符串或数值解析为 TanStack 的数值 size
 */
export function resolvePresetSize(size: number | DataTableSizePreset): number {
  return isString(size) ? SIZE_PRESET_MAP[size] : size
}

/**
 * 检测 DOM 元素文本是否溢出（单行）
 */
export function isOverflowing(el: HTMLElement): boolean {
  return el.scrollWidth > el.clientWidth
}

/**
 * 检测 DOM 元素文本是否溢出（多行）
 */
export function isMultilineOverflowing(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight
}

/**
 * 递归收集树形数据所有节点的 key
 */
export function collectTreeKeys<T extends Record<string, unknown>>(
  rows: T[],
  childrenKey: string,
  idKey: string
): (string | number)[] {
  const keys: (string | number)[] = []

  function walk(items: T[]): void {
    for (const item of items) {
      const id = item[idKey]
      if (id != null) {
        keys.push(id as string | number)
      }
      const children = item[childrenKey]
      if (Array.isArray(children)) {
        walk(children as T[])
      }
    }
  }

  walk(rows)
  return keys
}
