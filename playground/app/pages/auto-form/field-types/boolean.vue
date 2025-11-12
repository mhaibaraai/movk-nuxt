<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  checkbox: afz.boolean(),
  switch: afz.boolean({ type: 'switch' }).default(true),
  withLabel: afz.boolean({
    controlProps: { label: '同意服务条款' }
  }),
  withDescription: afz.boolean({
    controlProps: {
      label: '接收通知',
      description: '我们会通过邮件向您发送重要更新'
    }
  })
})

type Schema = z.output<typeof schema>

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
  <Navbar />
  <UCard>
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
    <template #footer>
      <pre class="text-xs">{{ form }}</pre>
    </template>
  </UCard>
</template>
