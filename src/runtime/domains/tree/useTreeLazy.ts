import type { Ref } from 'vue'
import { ref } from 'vue'
import { Tree } from '@movk/core'
import { isPlaceholder, LAZY_KEY_FIELD, markLazyPlaceholders, restoreLoadedChildren } from './tree-lazy'

type WorkNode = Record<string, any>

interface TreeLazyOptions {
  baseItems: Ref<WorkNode[]>
  getKey: () => (node: WorkNode) => string
  /** 规范化与注入占位节点 */
  buildBase: (items: WorkNode[]) => WorkNode[]
  loadChildren: () => ((node: WorkNode) => Promise<WorkNode[]> | WorkNode[]) | undefined
  onError: (node: WorkNode, error: unknown) => void
}

/** 懒加载子节点：去重并发、记录失败节点供重试，并在 items 重建后回填已加载的子树 */
export function useTreeLazy(options: TreeLazyOptions) {
  const { baseItems } = options
  const loadingKeys = ref(new Set<string>())
  const errorKeys = ref(new Set<string>())
  const loaded = new Map<string, WorkNode[]>()

  const withKey = (set: Set<string>, key: string) => new Set(set).add(key)
  const withoutKey = (set: Set<string>, key: string) => {
    const next = new Set(set)
    next.delete(key)
    return next
  }

  function findNode(key: string): WorkNode | undefined {
    const getKey = options.getKey()
    return Tree.find(baseItems.value, ({ node }) => getKey(node) === key) as WorkNode | undefined
  }

  function replaceNode(key: string, update: (node: WorkNode) => WorkNode) {
    baseItems.value = Tree.updateNode(baseItems.value, key, ({ node }) => update(node), { id: LAZY_KEY_FIELD })
  }

  /** 加载仍为占位的节点；失败过的节点仅在 `retry` 时重新请求，避免自动加载陷入重试循环 */
  async function load(key: string, { retry = false } = {}): Promise<void> {
    const loadChildren = options.loadChildren()
    const node = findNode(key)
    const first = node?.children?.[0]
    if (!loadChildren || !node || !first || !isPlaceholder(first) || loadingKeys.value.has(key)) return
    if (errorKeys.value.has(key) && !retry) return

    loadingKeys.value = withKey(loadingKeys.value, key)
    errorKeys.value = withoutKey(errorKeys.value, key)
    try {
      const children = options.buildBase(await loadChildren(node))
      loaded.set(key, children)
      replaceNode(key, current => ({ ...current, children: children.length ? children : undefined, isLeaf: children.length === 0 }))
    }
    catch (error) {
      errorKeys.value = withKey(errorKeys.value, key)
      options.onError(node, error)
    }
    finally {
      loadingKeys.value = withoutKey(loadingKeys.value, key)
    }
  }

  /** 丢弃已加载结果并重新加载该节点 */
  async function reload(key: string): Promise<void> {
    loaded.delete(key)
    const node = findNode(key)
    if (!node) return
    const [reset] = markLazyPlaceholders([{ ...node, children: undefined, isLeaf: undefined }], options.getKey())
    replaceNode(key, () => reset!)
    await load(key, { retry: true })
  }

  /** 由 items 重建 baseItems，回填已加载的子树 */
  function rebuild(items: WorkNode[]): WorkNode[] {
    return restoreLoadedChildren(options.buildBase(items), loaded, options.getKey())
  }

  function clearLoaded(): void {
    loaded.clear()
    errorKeys.value = new Set()
  }

  return { loadingKeys, errorKeys, load, reload, rebuild, clearLoaded }
}
