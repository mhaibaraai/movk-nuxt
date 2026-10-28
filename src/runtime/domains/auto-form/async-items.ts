import type { Ref, ShallowRef } from 'vue'
import { onScopeDispose, ref, shallowRef, watch } from 'vue'
import type { AutoFormAsyncItems } from '../../types/auto-form/fields'

type FormState = Record<string, any>

export interface AsyncItemsState {
  items: ShallowRef<unknown[] | undefined>
  loading: Ref<boolean>
  error: ShallowRef<unknown>
}

export function useAsyncItems(
  getConfig: () => AutoFormAsyncItems,
  getState: () => FormState
): AsyncItemsState {
  const items = shallowRef<unknown[]>()
  const loading = ref(false)
  const error = shallowRef<unknown>()

  let controller: AbortController | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  async function run() {
    controller?.abort()
    const current = new AbortController()
    controller = current
    loading.value = true

    try {
      const result = await getConfig().load({ state: getState(), signal: current.signal })
      if (current.signal.aborted) return
      items.value = result
      error.value = undefined
    }
    catch (cause) {
      if (current.signal.aborted) return
      error.value = cause
      if (import.meta.dev) console.error('[AutoForm] asyncItems.load failed:', cause)
    }
    finally {
      if (controller === current) loading.value = false
    }
  }

  function schedule() {
    clearTimeout(timer)
    const delay = getConfig().debounce ?? 0
    if (delay > 0) {
      loading.value = true
      timer = setTimeout(run, delay)
    }
    else {
      run()
    }
  }

  watch(() => getConfig().deps?.(getState()), schedule, { immediate: true })

  onScopeDispose(() => {
    clearTimeout(timer)
    controller?.abort()
  })

  return { items, loading, error }
}
