<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

type Size = NonNullable<InputProps['size']>
type Color = NonNullable<InputProps['color']>

const sizes: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const colors: Color[] = ['primary', 'neutral', 'error', 'success']

const attrs = reactive({
  size: ['md'] as string[],
  color: ['primary'] as string[]
})

const text = ref('Hello Movk')
const password = ref('s3cret-pass')
const limited = ref('')
const labeled = ref('')
const copyable = ref('https://movk.dev')
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes as unknown as string[]" multiple size="xs" placeholder="size" />
    <USelect v-model="attrs.color" :items="colors as unknown as string[]" multiple size="xs" placeholder="color" />
  </Navbar>

  <div class="p-4 flex flex-col gap-6">
    <Matrix v-slot="props" :attrs="attrs" container-class="w-72">
      <p class="text-xs text-muted font-medium">
        {{ props.size }} · {{ props.color }}
      </p>

      <UFormField label="WithClear">
        <MWithClear v-model="text" :size="(props.size as Size)" :color="(props.color as Color)" placeholder="可清除" />
      </UFormField>

      <UFormField label="WithCopy">
        <MWithCopy v-model="copyable" :size="(props.size as Size)" :color="(props.color as Color)" />
      </UFormField>

      <UFormField label="WithPasswordToggle">
        <MWithPasswordToggle v-model="password" :size="(props.size as Size)" :color="(props.color as Color)" />
      </UFormField>

      <UFormField label="WithCharacterLimit">
        <MWithCharacterLimit v-model="limited" :size="(props.size as Size)" :color="(props.color as Color)" :maxlength="20" />
      </UFormField>

      <UFormField label="WithFloatingLabel">
        <MWithFloatingLabel v-model="labeled" :size="(props.size as Size)" :color="(props.color as Color)" placeholder=" " label="电子邮箱" />
      </UFormField>
    </Matrix>
  </div>
</template>
