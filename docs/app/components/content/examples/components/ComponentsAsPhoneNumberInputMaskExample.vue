<script setup lang="ts">
const phone = ref('')
</script>

<template>
  <div class="flex flex-col gap-4">
    <MAsPhoneNumberInput v-model="phone" />
    <MAsPhoneNumberInput v-model="phone" mask="(###) ###-####" dial-code="+1" />
  </div>
</template>
