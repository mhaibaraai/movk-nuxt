<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod'

const props = defineProps<{
  type: 'string' | 'textarea' | 'withPasswordToggle' | 'withClear' | 'withCopy' | 'withCharacterLimit' | 'asPhoneNumberInput' | 'withFloatingLabel'
  size: 'sm' | 'xs' | 'md' | 'lg' | 'xl'
  color: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'
  rows?: number
  maxLength?: number
}>()

const { afz } = useAutoForm()
const toast = useToast()

const resolvedControlProps = computed(() => ({
  leadingIcon: props.type === 'withFloatingLabel' ? undefined : 'i-lucide-type',
  color: props.color,
  rows: props.rows,
  maxLength: props.maxLength,
  label: props.type === 'withFloatingLabel' ? '浮动标签' : undefined,
  dialCode: props.type === 'asPhoneNumberInput' ? '+86' : undefined,
  mask: props.type === 'asPhoneNumberInput' ? '### #### ####' : undefined
}))

const schema = computed(() => (afz.object({
  stringWithType: afz.string({
    type: props.type,
    controlProps: resolvedControlProps.value
  }).meta({
    size: props.size,
    label: props.type === 'withFloatingLabel' ? '' : undefined
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
