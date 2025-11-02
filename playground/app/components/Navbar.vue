<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import type { NavigationMenuItem } from '@nuxt/ui'
import { upperName } from '../utils'

const route = useRoute()
const router = useRouter()

defineProps<{
  to?: string
}>()

const name = computed(() => route.path.split('/').pop() as string)
const pName = computed(() => route.path.split('/').slice(-2, -1)[0])
const title = computed(() => upperName(name.value))

const components = inject<NavigationMenuItem[]>('components')

const index = computed(() => components?.find(c => c.label?.toLowerCase() === pName.value)?.children?.findIndex(ch => ch.to === route.path) ?? -1)

function navigate(index: number) {
  router.push(components?.[index]?.to as string)
}

defineShortcuts({
  j: () => navigate(index.value + 1),
  k: () => navigate(index.value - 1)
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
          :disabled="index === 0"
          class="ring-default"
          aria-label="Previous component"
          @click="navigate(index - 1)"
        />
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="outline"
          :disabled="index === (components?.length ?? 0) - 1"
          class="ring-default"
          aria-label="Next component"
          @click="navigate(index + 1)"
        />
      </UFieldGroup>
    </template>

    <template #right>
      <slot />
    </template>
  </UDashboardNavbar>
</template>
