import type { InferInput } from '@nuxt/ui'
import { deepClone, isDeepEqual } from '@movk/core'
import { onMounted, toRaw, watch } from 'vue'
import type { z } from 'zod'
import { useRouter } from '#imports'
import { supportsSearchQuery } from '#build/movk-router'
import type { SearchFormQuerySync } from '../../types/auto-form/search-form'
import { cleanSearchPayload, parseSearchQuery, serializeSearchQuery } from './search-query'
import type { SearchQuery } from './search-query'

interface SearchQueryOptions<S extends z.ZodObject> {
  sync: () => boolean | SearchFormQuerySync<S>
  schema: () => z.ZodObject | undefined
  state: () => Partial<InferInput<S>>
  onRestore: (state: Partial<InferInput<S>>) => void
}

function pickQuery(query: SearchQuery, keys: Set<string>): SearchQuery {
  return Object.fromEntries(Object.entries(query).filter(([key, value]) => keys.has(key) && value !== undefined))
}

export function useSearchQuerySync<S extends z.ZodObject>(options: SearchQueryOptions<S>) {
  const router = supportsSearchQuery ? useRouter() : undefined
  const pending = new Set<SearchQuery>()
  const getSync = () => options.sync() || undefined

  onMounted(() => {
    if (!router) {
      if (import.meta.dev) {
        watch(getSync, (enabled) => {
          if (enabled) console.warn('[SearchForm] syncQuery requires Nuxt routing or Vue Router.')
        }, { immediate: true })
      }
      return
    }

    const baseline = deepClone(toRaw(options.state()))
    let previous: SearchQuery | undefined
    watch([getSync, options.schema, () => router.currentRoute.value.query], ([sync, schema, query]) => {
      if (!sync || !schema) {
        previous = undefined
        return
      }
      const keys = new Set(Object.keys(schema.shape))
      const owned = pickQuery(query, keys)
      if (isDeepEqual(previous, owned)) return
      const initial = previous === undefined
      previous = owned
      if ([...pending].some(expected => isDeepEqual(expected, owned))) return

      const parsed = sync !== true && sync.parse ? sync.parse(owned) : parseSearchQuery(owned, schema)
      if (initial && !Object.keys(parsed).length) return
      const state: Record<string, unknown> = options.state()
      for (const key of keys) {
        if (Object.hasOwn(parsed, key)) state[key] = parsed[key]
        else if (Object.hasOwn(baseline, key)) state[key] = deepClone(baseline[key])
        else Reflect.deleteProperty(state, key)
      }
      options.onRestore(Object.fromEntries([...keys].map(key => [key, state[key]])) as Partial<InferInput<S>>)
    }, { immediate: true, flush: 'sync' })
  })

  return async (state: Partial<InferInput<S>>) => {
    const sync = getSync()
    const schema = options.schema()
    if (!router || !sync || !schema) return
    const keys = new Set(Object.keys(schema.shape))
    const current = router.currentRoute.value
    const others = Object.fromEntries(Object.entries(current.query).filter(([key]) => !keys.has(key)))
    const serialize = sync !== true && sync.serialize ? sync.serialize : serializeSearchQuery
    const owned = pickQuery(serialize(cleanSearchPayload(state)), keys)
    const expected = pickQuery(router.resolve({ query: owned }).query, keys)
    pending.add(expected)
    try {
      const method = sync !== true && sync.replace === false ? 'push' : 'replace'
      await router[method]({ query: { ...others, ...owned }, hash: current.hash })
    }
    finally {
      pending.delete(expected)
    }
  }
}
