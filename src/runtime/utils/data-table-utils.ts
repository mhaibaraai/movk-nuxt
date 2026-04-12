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
 *
 * 使用屏幕外探针测量文本自然宽度，避免 overflow:hidden 在 table cell
 * 内导致 scrollWidth 不反映实际内容宽度的浏览器行为。
 */
export function isOverflowing(el: HTMLElement): boolean {
  const cs = window.getComputedStyle(el)
  const probe = document.createElement('span')
  probe.style.cssText = 'position:fixed;top:-9999px;visibility:hidden;white-space:nowrap;pointer-events:none'
  probe.style.font = cs.font
  probe.style.letterSpacing = cs.letterSpacing
  probe.textContent = el.textContent ?? ''
  document.body.appendChild(probe)
  const naturalWidth = probe.getBoundingClientRect().width
  probe.remove()
  return naturalWidth > el.getBoundingClientRect().width
}

/**
 * 检测 DOM 元素文本是否溢出（多行）
 *
 * 使用屏幕外探针测量自然行高，避免 Chrome 中 -webkit-line-clamp 元素
 * scrollHeight 与 clientHeight 相等的已知问题。
 */
export function isMultilineOverflowing(el: HTMLElement): boolean {
  const { width, height } = el.getBoundingClientRect()
  if (width <= 0 || height <= 0) return false
  const cs = window.getComputedStyle(el)
  const probe = document.createElement('div')
  probe.style.cssText = `position:fixed;top:-9999px;visibility:hidden;pointer-events:none;width:${width}px;overflow:visible;white-space:normal`
  probe.style.font = cs.font
  probe.style.letterSpacing = cs.letterSpacing
  probe.style.lineHeight = cs.lineHeight
  probe.style.wordBreak = cs.wordBreak
  probe.style.overflowWrap = cs.overflowWrap
  probe.textContent = el.textContent ?? ''
  document.body.appendChild(probe)
  const naturalHeight = probe.getBoundingClientRect().height
  probe.remove()
  return naturalHeight > height
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
