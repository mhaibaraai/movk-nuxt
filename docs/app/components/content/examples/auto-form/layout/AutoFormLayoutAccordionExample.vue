<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'
import { UAccordion } from '#components'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  $accordion: afz.layout({
    component: UAccordion,
    props: {
      type: 'multiple',
      ui: {
        content: 'space-y-4'
      },
      items: [
        { label: '基本信息', icon: 'i-lucide-user', slot: 'item-0' },
        { label: '详细信息', icon: 'i-lucide-file-text', slot: 'item-1' }
      ]
    },
    fieldSlots: {
      name: 'item-0',
      email: 'item-0',
      bio: 'item-1'
    },
    fields: {
      name: afz.string().meta({ label: '姓名' }),
      email: afz.email().meta({ label: '邮箱' }),
      bio: afz.string({ type: 'textarea' }).meta({ label: '个人简介' }).optional()
    }
  })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <UCard class="w-lg">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </UCard>
</template>
