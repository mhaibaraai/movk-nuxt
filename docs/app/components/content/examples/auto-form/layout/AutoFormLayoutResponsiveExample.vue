<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  $responsive: afz.layout({
    // 移动端 1 列，平板 2 列，桌面端 3 列
    class: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    fields: {
      title: afz.string().meta({
        class: 'col-span-full', // 所有屏幕尺寸都占满整行
        label: '标题'
      }),
      firstName: afz.string().meta({ label: '名字' }),
      lastName: afz.string().meta({ label: '姓氏' }),
      email: afz.email().meta({ label: '邮箱' }),
      phone: afz.string().meta({ label: '电话' }),
      age: afz.number().int().min(0).meta({ label: '年龄' }),
      description: afz.string({ type: 'textarea' }).meta({
        class: 'col-span-full',
        label: '描述'
      })
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
  <UCard>
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </UCard>
</template>
