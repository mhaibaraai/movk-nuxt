import type { FieldMeta } from '../../types'

export interface SelectItem<T = unknown> {
  label: string
  value: T
  [k: string]: any
}

export interface SelectContext {
  signal?: AbortSignal
  [k: string]: any
}

export type ItemsProvider<T = unknown> = (query?: string, ctx?: SelectContext) => Promise<SelectItem<T>[]> | SelectItem<T>[]

export interface SelectResolved<T = unknown> {
  items?: SelectItem<T>[]
  itemsProvider?: ItemsProvider<T>
  itemsRefKey?: string
}

export function resolveSelect(meta: FieldMeta): SelectResolved {
  const items = meta.items as SelectItem[] | undefined
  const itemsProvider = meta.itemsProvider as ItemsProvider | undefined
  const itemsRefKey = meta.itemsRefKey

  return { items, itemsProvider, itemsRefKey }
}

export function assertValueTypeConsistency<T>(multiple: boolean, value: unknown): value is (T[] | T | null | undefined) {
  if (value == null) return true
  if (multiple) return Array.isArray(value)
  return !Array.isArray(value)
}


