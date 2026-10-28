import type { WritableComputedRef } from 'vue'
import { onMounted, watch } from 'vue'

const STORAGE_PREFIX = 'movk-data-table:'

type PersistSources = Record<string, WritableComputedRef<any>>

export function readPersistedState(key: string): Record<string, unknown> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    const parsed = raw ? JSON.parse(raw) : undefined
    return parsed && typeof parsed === 'object' ? parsed : undefined
  }
  catch {
    return undefined
  }
}

export function writePersistedState(key: string, state: Record<string, unknown> | undefined): void {
  try {
    if (state === undefined) localStorage.removeItem(STORAGE_PREFIX + key)
    else localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state))
  }
  catch {
    // 隐私模式或存储被禁用时静默跳过，表格照常工作
  }
}

/**
 * 挂载后从 localStorage 恢复各项状态，之后随变化写回。
 * 仅在客户端挂载后读取，避免与服务端渲染结果不一致
 */
export function useTablePersistence(getKey: () => string | undefined, sources: PersistSources): { clear: () => void } {
  onMounted(() => {
    const key = getKey()
    if (!key) return

    const stored = readPersistedState(key)
    if (stored) {
      for (const [name, source] of Object.entries(sources)) {
        if (stored[name] !== undefined) source.value = stored[name]
      }
    }

    watch(
      () => Object.fromEntries(Object.entries(sources).map(([name, source]) => [name, source.value])),
      state => writePersistedState(key, state),
      { deep: true }
    )
  })

  return {
    clear: () => {
      const key = getKey()
      if (key) writePersistedState(key, undefined)
    }
  }
}
