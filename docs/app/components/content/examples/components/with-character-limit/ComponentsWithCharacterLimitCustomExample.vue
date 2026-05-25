<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

const props = defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
  maxLength: string
}>()

const comment = ref('')
const max = computed(() => Number(props.maxLength))
</script>

<template>
  <MWithCharacterLimit
    v-model="comment"
    placeholder="最多 200 字..."
    :size
    :leading-icon
    :max-length="max"
  />
</template>
