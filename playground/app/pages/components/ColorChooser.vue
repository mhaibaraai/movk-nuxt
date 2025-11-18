<script lang="ts" setup>
const color = ref('#3b82f6')
const formatColor = ref('')
</script>

<template>
  <Navbar />
  <UCard :ui="{ body: 'space-y-6' }" class="w-lg">
    <div class="grid gap-6 md:grid-cols-2">
      <UFormField label="基础">
        <MColorChooser v-model="color" />
      </UFormField>

      <UFormField label="格式化显示" hint="大写十六进制">
        <MColorChooser v-model="formatColor" format="hex" />
      </UFormField>
    </div>
  </UCard>
</template>
