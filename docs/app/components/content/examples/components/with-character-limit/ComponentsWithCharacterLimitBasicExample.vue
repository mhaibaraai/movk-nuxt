<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

const props = defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
  maxLength: string
}>()

const text = ref('')
const max = computed(() => Number(props.maxLength))
</script>

<template>
  <MWithCharacterLimit
    v-model="text"
    placeholder="最多输入字符..."
    :size
    :leading-icon
    :max-length="max"
  />
</template>
