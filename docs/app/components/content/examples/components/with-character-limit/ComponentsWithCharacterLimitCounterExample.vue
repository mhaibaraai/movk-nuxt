<script setup lang="ts">
const content = ref('')
</script>

<template>
  <MWithCharacterLimit
    v-model="content"
    :max-length="100"
    counter-class="text-primary font-semibold"
    placeholder="自定义计数器颜色"
  />
</template>
