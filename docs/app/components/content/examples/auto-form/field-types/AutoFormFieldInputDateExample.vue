<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()
const formatter = useDateFormatter()

const schema = afz.object({
  birthDate: afz.inputDate()
    .transform(date => formatter.convertToISO(date))
    .meta({
      label: '出生日期',
      description: '使用日期输入框选择您的出生日期'
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
