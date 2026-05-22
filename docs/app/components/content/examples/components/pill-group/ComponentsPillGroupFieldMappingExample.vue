<script setup lang="ts">
import type { PillItem } from '@movk/nuxt'

const items = [
  { id: 'u1', name: 'Alice', avatar: { src: 'https://i.pravatar.cc/40?img=1' } },
  { id: 'u2', name: 'Bob', avatar: { src: 'https://i.pravatar.cc/40?img=2' } },
  { id: 'u3', name: 'Carol', avatar: { src: 'https://i.pravatar.cc/40?img=3' } }
] as PillItem[]
const value = ref<string | undefined>('u1')
</script>

<template>
  <MPillGroup v-model="value" :items="items" label-key="name" value-key="id" />
</template>
