<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { upperName } from '../utils'
import { flattenNav } from '../composables/useFlatNav'

defineProps<{
  to?: string
}>()

defineSlots<{
  default: () => unknown
  trailing: () => unknown
}>()

const route = useRoute()
const router = useRouter()

const name = computed(() => route.path.split('/').pop() || 'home')
const title = computed(() => upperName(name.value))

const components = inject<NavigationMenuItem[]>('components', [])
const flatItems = computed(() => flattenNav(components))

const currentIndex = computed(() => flatItems.value.findIndex(item => item.to === route.path))

const prev = computed<NavigationMenuItem | null>(() => {
  const i = currentIndex.value
  return i > 0 ? (flatItems.value[i - 1] ?? null) : null
})

const next = computed<NavigationMenuItem | null>(() => {
  const i = currentIndex.value
  return i >= 0 && i < flatItems.value.length - 1 ? (flatItems.value[i + 1] ?? null) : null
})

function go(target: NavigationMenuItem | null | undefined) {
  if (target?.to) router.push(target.to as string)
}

defineShortcuts({
  j: () => go(next.value),
  k: () => go(prev.value)
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
          :disabled="!prev"
          class="ring-default"
          aria-label="Previous"
          @click="go(prev)"
        />
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="outline"
          :disabled="!next"
          class="ring-default"
          aria-label="Next"
          @click="go(next)"
        />
      </UFieldGroup>
    </template>

    <template #trailing>
      <slot name="trailing">
        <UButton
          v-if="to"
          :to="to"
          target="_blank"
          icon="i-lucide-external-link"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Open docs"
        />
      </slot>
    </template>

    <template #right>
      <slot />
    </template>
  </UDashboardNavbar>
</template>
