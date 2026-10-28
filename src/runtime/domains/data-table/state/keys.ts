import type { ExpandedState, RowSelectionState, VisibilityState } from '@tanstack/vue-table'

export function hasEntries(v: unknown): boolean {
  return typeof v === 'object' && v !== null && Object.keys(v).length > 0
}

export function keysToVisibility(keys: string[], allColumnIds: string[]): VisibilityState {
  const set = new Set(keys)
  const state: VisibilityState = {}
  for (const id of allColumnIds) state[id] = set.has(id)
  return state
}

export function visibilityToKeys(state: VisibilityState, allColumnIds: string[]): string[] {
  return allColumnIds.filter(id => state[id] !== false)
}

export function keysToVisibilityExclude(excludeKeys: string[], allColumnIds: string[]): VisibilityState {
  const set = new Set(excludeKeys)
  const state: VisibilityState = {}
  for (const id of allColumnIds) state[id] = !set.has(id)
  return state
}

export function visibilityToExcludeKeys(state: VisibilityState, allColumnIds: string[]): string[] {
  return allColumnIds.filter(id => state[id] === false)
}

export function keysToRowSelection(keys: string[]): RowSelectionState {
  const state: RowSelectionState = {}
  for (const key of keys) state[key] = true
  return state
}

export function rowSelectionToKeys(state: RowSelectionState): string[] {
  return Object.entries(state).filter(([, s]) => s).map(([k]) => k)
}

export function keysToExpanded(keys: string[]): Record<string, boolean> {
  const state: Record<string, boolean> = {}
  for (const key of keys) state[key] = true
  return state
}

export function expandedToKeys(state: ExpandedState): string[] {
  if (state === true) return []
  return Object.entries(state).filter(([, e]) => e).map(([k]) => k)
}

export function areSameKeys(a: readonly (string | number)[], b: readonly (string | number)[]): boolean {
  if (a.length !== b.length) return false
  const set = new Set(a.map(String))
  for (const key of b) if (!set.has(String(key))) return false
  return true
}
