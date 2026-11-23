<script setup lang="ts">
const open = ref(false)
const picker = useTemplateRef('picker')
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <UButton label="Open calendar" @click="picker?.open()" />
    <MDatePicker ref="picker" v-model:open="open" />
    <UButton label="Close calendar" variant="outline" @click="picker?.close()" />
  </div>
</template>
