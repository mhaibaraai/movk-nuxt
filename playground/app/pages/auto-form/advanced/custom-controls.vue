<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

// 自定义星级评分组件示例
const { afz } = useAutoForm()
const toast = useToast()

// TODO: 创建自定义星级评分控件
// 这里展示如何注册和使用自定义控件

const schema = afz.object({
  rating: afz.number()
    .int()
    .min(1)
    .max(5)
    .default(3),
  review: afz.string({ type: 'textarea' }).optional()
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
    <div class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
      <p class="text-sm text-yellow-800 dark:text-yellow-200">
        此示例展示自定义控件的概念。需要先创建自定义组件并注册到 controls。
      </p>
    </div>

    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </UCard>
</template>
