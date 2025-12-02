<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'
import { UAccordion } from '#components'

const { afz } = useAutoForm()
const toast = useToast()

const accordionSchema = afz.object({
  $accordion: afz.layout({
    component: UAccordion,
    props: {
      trailingIcon: 'i-lucide-arrow-down',
      type: 'multiple',
      ui: {
        content: 'space-y-4'
      },
      items: [
        { label: '基本信息', icon: 'i-lucide-user', slot: 'item-0' },
        { label: '详细信息', icon: 'i-lucide-square-pen', slot: 'item-1' }
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

type AccordionSchema = z.output<typeof accordionSchema>

const form = ref<Partial<AccordionSchema>>({})

async function onSubmit(event: FormSubmitEvent<AccordionSchema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <Matrix :form="form" title="手风琴布局" description="使用 `UAccordion` 组件将表单字段组织在手风琴布局中。">
    <MAutoForm :schema="accordionSchema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
