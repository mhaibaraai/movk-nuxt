import type { Ref } from 'vue'
import { computed, ref, shallowRef, watch } from 'vue'
import { Tree } from '@movk/core'
import { isPlaceholder } from './tree-lazy'
import { matchNode } from './tree-search'

type WorkNode = Record<string, any>

interface TreeSearchOptions {
  search: Ref<string>
  enabled: () => boolean
  baseItems: Ref<WorkNode[]>
  expanded: Ref<string[]>
  getKey: () => (node: WorkNode) => string
  labelKey: () => string
  filter: () => ((node: WorkNode, term: string) => boolean) | undefined
  searchMethod: () => ((term: string) => Promise<WorkNode[]>) | undefined
  searchDebounce: () => number
  buildBase: (items: WorkNode[]) => WorkNode[]
  onError: (term: string, error: unknown) => void
}

/** 本地过滤或远程搜索；搜索期间自动展开命中路径，结束后恢复搜索前的展开状态 */
export function useTreeSearch(options: TreeSearchOptions) {
  const term = computed(() => options.search.value.trim())
  const searching = computed(() => options.enabled() && !!term.value)

  const remoteItems = shallowRef<WorkNode[]>([])
  const remoteLoading = ref(false)
  const remoteError = ref(false)
  const retryCount = ref(0)
  const remote = computed(() => searching.value && !!options.searchMethod())

  watch([term, options.searchMethod, searching, options.searchDebounce, retryCount], ([value, searchMethod, active, delay], _previous, onCleanup) => {
    remoteItems.value = []
    remoteError.value = false
    remoteLoading.value = !!searchMethod && active
    if (!searchMethod || !active || import.meta.server) return

    let current = true
    const timer = setTimeout(async () => {
      try {
        const items = await searchMethod(value)
        if (current) remoteItems.value = options.buildBase(items)
      }
      catch (error) {
        if (!current) return
        remoteError.value = true
        options.onError(value, error)
      }
      finally {
        if (current) remoteLoading.value = false
      }
    }, delay)
    onCleanup(() => {
      current = false
      clearTimeout(timer)
    })
  }, { immediate: true })

  const matchedItems = computed<WorkNode[]>(() => {
    if (!searching.value) return options.baseItems.value
    if (options.searchMethod()) return remoteItems.value
    const filter = options.filter()
    const labelKey = options.labelKey()
    return Tree.filter(options.baseItems.value, ({ node }) =>
      !isPlaceholder(node) && (filter ? filter(node, term.value) : matchNode(node, labelKey, term.value)))
  })

  const isEmpty = computed(() => searching.value && !remoteLoading.value && !remoteError.value && matchedItems.value.length === 0)

  let snapshot: string[] | undefined
  watch(searching, (active) => {
    if (active) {
      snapshot = options.expanded.value
    }
    else if (snapshot) {
      options.expanded.value = snapshot
      snapshot = undefined
    }
  }, { immediate: true })

  watch(matchedItems, (items) => {
    if (!searching.value) return
    const getKey = options.getKey()
    options.expanded.value = Tree.findAll(items, ({ node }) => !!node.children?.length).map(node => getKey(node))
  })

  return { term, searching, matchedItems, isEmpty, remote, remoteLoading, remoteError, retry: () => retryCount.value++ }
}
