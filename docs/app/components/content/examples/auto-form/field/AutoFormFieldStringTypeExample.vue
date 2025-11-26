<script lang="ts" setup>
import type z from 'zod/v4'

const props = defineProps<{
  type: 'string' | 'textarea' | 'withPasswordToggle' | 'withClear' | 'withCopy' | 'withCharacterLimit'
  size: 'sm' | 'xs' | 'md' | 'lg' | 'xl'
  color: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'
  rows?: number
  maxLength?: number
}>()

const { afz } = useAutoForm()

const schema = computed(() => (afz.object({
  stringWithType: afz.string({
    type: props.type,
    controlProps: {
      leadingIcon: 'i-lucide-type',
      color: props.color,
      rows: props.rows,
      maxLength: props.maxLength
    }
  }).meta({
    size: props.size
  })
})))

type Schema = z.output<typeof schema.value>

const form = ref<Partial<Schema>>({})
</script>

<template>
  <UCard class="w-lg">
    <MAutoForm :schema="schema" :state="form" />
  </UCard>
</template>
