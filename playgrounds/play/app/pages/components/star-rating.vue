<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

type Size = NonNullable<ButtonProps['size']>
type Color = NonNullable<ButtonProps['color']>

const sizes: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const colors: Color[] = ['warning', 'primary', 'error', 'success']

const attrs = reactive({
  size: ['md'] as string[],
  color: ['warning'] as string[]
})

const value = ref(3)
const halfValue = ref(3.5)
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes as unknown as string[]" multiple size="xs" placeholder="size" />
    <USelect v-model="attrs.color" :items="colors as unknown as string[]" multiple size="xs" placeholder="color" />
  </Navbar>

  <Matrix v-slot="props" :attrs="attrs">
    <UFormField :label="`${props.size} · ${props.color}`" size="xs">
      <MStarRating v-model="value" :size="(props.size as Size)" :color="(props.color as Color)" />
    </UFormField>
    <MStarRating v-model="halfValue" allow-half :size="(props.size as Size)" :color="(props.color as Color)" />
    <MStarRating :model-value="4" readonly :size="(props.size as Size)" :color="(props.color as Color)" />
    <MStarRating :model-value="2" disabled :size="(props.size as Size)" :color="(props.color as Color)" />
    <MStarRating :model-value="3" :max="6" clearable :size="(props.size as Size)" :color="(props.color as Color)" />
    <MStarRating
      :model-value="4"
      empty-icon="i-lucide-heart"
      filled-icon="i-lucide-heart"
      half-icon="i-lucide-heart-handshake"
      :size="(props.size as Size)"
      :color="(props.color as Color)"
    />
  </Matrix>
</template>
