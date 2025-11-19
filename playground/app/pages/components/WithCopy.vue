<script lang="ts" setup>
const apiKey = ref('sk-1234567890abcdef')
</script>

<template>
  <Navbar />
  <Matrix>
    <UFormField label="apiKey" hint="API 密钥">
      <MWithCopy
        v-model="apiKey"
        placeholder="sk-1234567890abcdef"
        leading-icon="i-lucide-key"
        class="w-full"
      />
    </UFormField>
  </Matrix>
</template>
