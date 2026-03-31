<script setup lang="ts">
const phone = ref('')
</script>

<template>
  <UFormField label="手机号" hint="请输入 11 位手机号">
    <MAsPhoneNumberInput v-model="phone" class="w-full" />
  </UFormField>
</template>
