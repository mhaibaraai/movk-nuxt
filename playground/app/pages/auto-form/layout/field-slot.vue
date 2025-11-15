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
  <UCard>
    <MAutoForm :schema="simpleSchema" :state="form" @submit="onSubmit" />
    <template #footer>
      <details>
        <summary class="cursor-pointer text-sm font-medium mb-2">
          查看表单数据
        </summary>
        <pre class="text-xs">{{ form }}</pre>
      </details>
    </template>
  </UCard>
</template>
