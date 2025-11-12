<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  $tabs: afz.layout({
    component: 'UTabs',
    props: {
      items: [
        { label: '基本信息', value: 'basic' },
        { label: '联系方式', value: 'contact' },
        { label: '其他', value: 'other' }
      ]
    },
    fields: {
      name: afz.string(),
      email: afz.email(),
      bio: afz.string({ type: 'textarea' }).optional()
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
  </UCard>
</template>
