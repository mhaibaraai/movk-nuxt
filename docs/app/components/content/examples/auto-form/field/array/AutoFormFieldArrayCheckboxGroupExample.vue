<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  notifications: afz.array(afz.string(), {
    type: 'checkboxGroup',
    controlProps: {
      items: [
        { label: '邮件', value: 'email' },
        { label: '短信', value: 'sms' },
        { label: '电话', value: 'phone' }
      ]
    }
  })
    .default(['email'])
    .meta({
      label: '复选框组',
      hint: '多选通知方式'
    })
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <MAutoForm :schema="schema" @submit="onSubmit" />
</template>
