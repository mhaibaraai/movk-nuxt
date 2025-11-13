<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz, _ } = useAutoForm()
const toast = useToast()

// 基础对象示例 - 不使用类型约束
const schema = afz.object({
  name: afz.string().min(1, '请输入姓名'),
  age: afz.number().min(1).max(150),
  email: afz.email('请输入有效的邮箱地址'),
  user: afz.object(_, {
    type: 'enum',
    controlProps: {
      items: [
        {
          label: 'benjamincanac',
          value: 'benjamincanac',
          avatar: {
            src: 'https://github.com/benjamincanac.png',
            alt: 'benjamincanac'
          }
        },
        {
          label: 'romhml',
          value: 'romhml',
          avatar: {
            src: 'https://github.com/romhml.png',
            alt: 'romhml'
          }
        }
      ]
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
  <Navbar />
  <UCard>
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
    <template #footer>
      <pre class="text-xs">{{ form }}</pre>
    </template>
  </UCard>
</template>
