import type { VisibilityState } from '@tanstack/vue-table'

export function keysToVisibility(keys: string[], allColumnIds: string[]): VisibilityState {
  const set = new Set(keys)
  const state: VisibilityState = {}
  for (const id of allColumnIds) {
    state[id] = set.has(id)
  }
  return state
}

export function visibilityToKeys(state: VisibilityState, allColumnIds: string[]): string[] {
  return allColumnIds.filter(id => state[id] !== false)
}

export function keysToVisibilityExclude(excludeKeys: string[], allColumnIds: string[]): VisibilityState {
  const set = new Set(excludeKeys)
  const state: VisibilityState = {}
  for (const id of allColumnIds) {
    state[id] = !set.has(id)
  }
  return state
}

export function visibilityToExcludeKeys(state: VisibilityState, allColumnIds: string[]): string[] {
  return allColumnIds.filter(id => state[id] === false)
}
