<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod/v4'

const props = defineProps<{
  type: 'string' | 'textarea' | 'withPasswordToggle' | 'withClear' | 'withCopy' | 'withCharacterLimit'
  size: 'sm' | 'xs' | 'md' | 'lg' | 'xl'
  color: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'
  rows?: number
  maxLength?: number
}>()

const { afz } = useAutoForm()
const toast = useToast()

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

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <UCard class="w-lg">
    <MAutoForm
      :schema="schema"
      :state="form"
      :submit-button-props="{
        color
      }"
      @submit="onSubmit"
    />
  </UCard>
</template>
