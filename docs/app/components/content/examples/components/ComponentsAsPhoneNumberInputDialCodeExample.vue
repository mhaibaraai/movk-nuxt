<script setup lang="ts">
const phone = ref('')
</script>

<template>
  <div class="flex flex-col gap-4">
    <MAsPhoneNumberInput v-model="phone" dial-code="+1" mask="(###) ###-####" />
    <MAsPhoneNumberInput v-model="phone" dial-code="+44" mask="#### ### ####" />
  </div>
</template>
