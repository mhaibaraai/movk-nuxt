<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'
import type { AsPhoneNumberInputProps } from '@movk/nuxt'

defineProps<{
  size: InputProps['size']
  mask: AsPhoneNumberInputProps['mask']
  dialCode: AsPhoneNumberInputProps['dialCode']
}>()

const phone = ref('')
</script>

<template>
  <MAsPhoneNumberInput
    v-model="phone"
    :size
    :mask
    :dial-code
  />
</template>
