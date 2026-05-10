<script setup lang="ts">
import type { SemanticSize, SemanticColor } from '@movk/nuxt'

const sizes: SemanticSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const colors: SemanticColor[] = ['primary', 'info', 'warning', 'neutral', 'error', 'success']

const attrs = ref({
  size: ['md'] as SemanticSize[],
  color: ['primary'] as SemanticColor[]
})

const text = ref('Hello Movk')
const password = ref('s3cret-pass')
const limited = ref('')
const labeled = ref('')
const copyable = ref('https://movk.dev')
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes" multiple size="xs" placeholder="size" />
    <USelect v-model="attrs.color" :items="colors" multiple size="xs" placeholder="color" />
  </Navbar>

  <div class="p-4 flex flex-col gap-6">
    <Matrix v-slot="props" :attrs="attrs" container-class="w-72">
      <p class="text-xs text-muted font-medium">
        {{ props.size }} · {{ props.color }}
      </p>

      <UFormField label="WithClear">
        <MWithClear v-model="text" :size="props.size" :color="props.color" placeholder="可清除" />
      </UFormField>

      <UFormField label="WithCopy">
        <MWithCopy v-model="copyable" :size="props.size" :color="props.color" />
      </UFormField>

      <UFormField label="WithPasswordToggle">
        <MWithPasswordToggle v-model="password" :size="props.size" :color="props.color" />
      </UFormField>

      <UFormField label="WithCharacterLimit">
        <MWithCharacterLimit v-model="limited" :size="props.size" :color="props.color" :maxlength="20" />
      </UFormField>

      <UFormField label="WithFloatingLabel">
        <MWithFloatingLabel v-model="labeled" :size="props.size" :color="props.color" placeholder=" " label="电子邮箱" />
      </UFormField>
    </Matrix>
  </div>
</template>
