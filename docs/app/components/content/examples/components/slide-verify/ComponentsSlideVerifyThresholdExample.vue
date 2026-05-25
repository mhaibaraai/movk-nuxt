<script setup lang="ts">
const props = defineProps<{
  threshold: string
}>()

const isVerified = ref(false)
const thresholdNum = computed(() => Number(props.threshold))
</script>

<template>
  <MSlideVerify
    v-model="isVerified"
    class="w-sm"
    :threshold="thresholdNum"
    text="按 threshold 阈值滑动验证"
  />
</template>
