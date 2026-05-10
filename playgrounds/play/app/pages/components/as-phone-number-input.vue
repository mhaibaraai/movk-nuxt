<script setup lang="ts">
import type { SemanticSize, SemanticColor } from '@movk/nuxt'

const sizes: SemanticSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const colors: SemanticColor[] = ['primary', 'info', 'warning', 'neutral', 'error', 'success']

const attrs = ref({
  size: ['md'] as SemanticSize[],
  color: ['primary'] as SemanticColor[]
})

const phoneCN = ref('13800138000')
const phoneUS = ref('5551234567')
const phoneIntl = ref('')
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes" multiple size="xs" placeholder="size" />
    <USelect v-model="attrs.color" :items="colors" multiple size="xs" placeholder="color" />
  </Navbar>

  <div class="p-4 flex flex-col gap-4">
    <Matrix v-slot="props" :attrs="attrs" container-class="w-72">
      <p class="text-xs text-muted font-medium">
        {{ props.size }} · {{ props.color }}
      </p>

      <UFormField label="中国大陆（默认 +86）">
        <MAsPhoneNumberInput v-model="phoneCN" :size="props.size" :color="props.color" />
      </UFormField>

      <UFormField label="美国（dial-code 显示）">
        <MAsPhoneNumberInput v-model="phoneUS" dial-code="+1" :size="props.size" :color="props.color" />
      </UFormField>

      <UFormField label="错误态">
        <MAsPhoneNumberInput v-model="phoneIntl" :size="props.size" color="error" placeholder="必填" />
      </UFormField>
    </Matrix>
  </div>
</template>
