<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod'

const props = defineProps<{
  type: 'string' | 'textarea'
  size: 'sm' | 'xs' | 'md' | 'lg' | 'xl'
  color: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'
  rows?: number
  maxLength?: number
}>()

const { afz } = useAutoForm()
const toast = useToast()

const resolvedControlProps = computed(() => ({
  leadingIcon: 'i-lucide-type',
  color: props.color,
  rows: props.rows,
  maxlength: props.maxLength
}))

const schema = computed(() => (afz.object({
  stringWithType: afz.string({
    type: props.type,
    controlProps: resolvedControlProps.value
  }).meta({
    size: props.size
  }).optional()
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
