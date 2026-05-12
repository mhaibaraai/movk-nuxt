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
const formFieldPhone = ref('13800138000')
const fieldGroupPhone = ref('5551234567')
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes" multiple size="xs" placeholder="size" />
    <USelect v-model="attrs.color" :items="colors" multiple size="xs" placeholder="color" />
  </Navbar>

  <div class="p-4 flex flex-col gap-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Showcase
        title="UFormField 兼容"
        description="外层字段尺寸和错误态传递到内部 UInput"
        :state="{ value: formFieldPhone }"
      >
        <UFormField label="手机号" size="xs" error="示例错误态">
          <MAsPhoneNumberInput v-model="formFieldPhone" />
        </UFormField>
      </Showcase>

      <Showcase
        title="UFieldGroup 兼容"
        description="输入封装和按钮共同继承分组尺寸"
        :state="{ value: fieldGroupPhone }"
      >
        <UFieldGroup size="xs" class="w-full">
          <MAsPhoneNumberInput v-model="fieldGroupPhone" dial-code="+1" />
          <UButton icon="i-lucide-phone-call" color="neutral" variant="subtle" />
        </UFieldGroup>
      </Showcase>
    </div>

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
