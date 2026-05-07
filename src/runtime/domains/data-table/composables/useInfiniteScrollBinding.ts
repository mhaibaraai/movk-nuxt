import type { MaybeRefOrGetter } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { toValue } from 'vue'

interface UseInfiniteScrollBindingOptions {
  distance: MaybeRefOrGetter<number>
  canLoadMore: MaybeRefOrGetter<boolean>
  onLoadMore: () => void | Promise<void>
}

export function useInfiniteScrollBinding(
  getEl: () => HTMLElement | null | undefined,
  options: UseInfiniteScrollBindingOptions
): void {
  useInfiniteScroll(
    getEl,
    () => options.onLoadMore(),
    {
      distance: toValue(options.distance),
      canLoadMore: () => toValue(options.canLoadMore)
    }
  )
}
