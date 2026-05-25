<script setup lang="ts">
import { camelCase } from 'scule'

defineProps<{
  name: string
  camelName: string
  pascalName: string
  effectiveProps: Record<string, any>
  options?: Array<{ name: string, label: string, [k: string]: any }>
  wrapperContainer: HTMLElement | null
  componentContainer: HTMLElement | null
}>()

const route = useRoute()
const slug = computed(() => camelCase(route.path.split('/').pop() ?? ''))
</script>

<template>
  <LazyComponentThemeVisualizer
    :slug="slug"
    :container="componentContainer"
    :position-container="wrapperContainer"
  />
</template>
