<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'
import { UAccordion } from '#components'

const { afz } = useAutoForm()
const toast = useToast()

const simpleSchema = afz.object({
  $accordion: afz.layout({
    component: UAccordion,
    props: {
      items: [
        { label: '全部字段', icon: 'i-lucide-list' }
      ],
      defaultValue: '0'
    },
    fieldSlot: 'content',
    fields: {
      title: afz.string().meta({ label: '标题' }),
      content: afz.string().meta({ label: '内容', type: 'textarea' }),
      tags: afz.string().meta({ label: '标签' }).optional()
    }
  })
})

type SimpleSchema = z.output<typeof simpleSchema>

const form = ref<Partial<SimpleSchema>>({})

async function onSubmit(event: FormSubmitEvent<SimpleSchema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <Matrix :form="form" title="字段插槽布局" description="使用 `fieldSlot` 将所有字段渲染到布局组件的单个插槽中。">
    <MAutoForm :schema="simpleSchema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
