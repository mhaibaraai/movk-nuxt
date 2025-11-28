<script setup lang="ts">
const brandColor = ref('#3b82f6')
</script>

<template>
  <MColorChooser v-model="brandColor">
    <template #default>
      <div
        class="size-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
        :style="{ backgroundColor: brandColor }"
      />
    </template>
  </MColorChooser>
</template>
