<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  code: afz.string({
    type: 'pinInput',
    controlProps: {
      length: 6,
      mask: false
    }
  })
    .length(6, '请输入 6 位验证码')
    .meta({
      label: '验证码输入',
      hint: '输入 6 位验证码'
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
