<script setup lang="ts">
const isoDate = ref<string | undefined>('2025-11-06')
const unixRange = ref<{ start: number | undefined, end: number | undefined } | undefined>()
</script>

<template>
  <div class="space-y-4">
    <UFormField label="ISO 字符串" :help="`v-model：${JSON.stringify(isoDate)}`">
      <MDatePicker v-model="isoDate" value-format="iso" clearable />
    </UFormField>

    <UFormField label="Unix 时间戳范围" :help="`v-model：${JSON.stringify(unixRange)}`">
      <MDatePicker v-model="unixRange" range value-format="unix" clearable />
    </UFormField>
  </div>
</template>
