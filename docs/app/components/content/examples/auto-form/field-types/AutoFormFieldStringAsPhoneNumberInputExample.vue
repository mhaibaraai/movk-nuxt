<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  phone: afz.string({
    type: 'asPhoneNumberInput',
    controlProps: {
      dialCode: '+86',
      mask: '### #### ####'
    }
  })
    .meta({
      label: '手机号',
      placeholder: '请输入手机号',
      hint: '自动按手机号格式输入'
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
