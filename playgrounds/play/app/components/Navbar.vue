<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { upperName } from '../utils'

const route = useRoute()
const router = useRouter()

defineProps<{
  to?: string
}>()

const name = computed(() => route.path.split('/').pop() as string)
const title = computed(() => upperName(name.value))

const components = inject<NavigationMenuItem[]>('components')

function flattenNavigationItems(items: NavigationMenuItem[]): NavigationMenuItem[] {
  if (!items) return []

  const result: NavigationMenuItem[] = []

  for (const item of items) {
    if (item.children) {
      result.push(...item.children)

      for (const child of item.children) {
        if (child.children) {
          result.push(...child.children)
        }
      }
    }
  }

  return result
}

const flattenedNavItems = computed(() => flattenNavigationItems(components || []))

const currentIndex = computed(() => {
  return flattenedNavItems.value.findIndex(item => item.to === route.path) ?? -1
})

const navigationCache = computed(() => {
  const current = currentIndex.value
  const items = flattenedNavItems.value

  return {
    prev: current > 0 ? items[current - 1] : null,
    next: current < items.length - 1 ? items[current + 1] : null
  }
})

function navigate(direction: 'prev' | 'next' | number): void {
  let targetRoute: NavigationMenuItem | null = null

  if (typeof direction === 'number') {
    targetRoute = flattenedNavItems.value[direction] ?? null
  } else {
    targetRoute = navigationCache.value[direction] ?? null
  }

  if (targetRoute?.to) {
    router.push(targetRoute.to)
  }
}

defineShortcuts({
  j: () => navigate('next'),
  k: () => navigate('prev')
})
</script>

<template>
  <UDashboardNavbar :title="title" class="absolute top-0 inset-x-0 z-5 bg-default">
    <template #toggle>
      <UDashboardSidebarToggle size="sm" variant="outline" class="ring-default" />
      <UDashboardSidebarCollapse size="sm" variant="outline" class="ring-default" />
    </template>

    <template #leading>
      <UFieldGroup size="sm">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="outline"
          :disabled="!navigationCache.prev"
          class="ring-default"
          aria-label="Previous component"
          @click="navigate('prev')"
        />
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="outline"
          :disabled="!navigationCache.next"
          class="ring-default"
          aria-label="Next component"
          @click="navigate('next')"
        />
      </UFieldGroup>
    </template>

    <template #right>
      <slot />
    </template>
  </UDashboardNavbar>
</template>
