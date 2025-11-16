<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'
import StarRating from '~/components/StarRating.vue'

const toast = useToast()

const { afz } = useAutoForm()

const schema = afz.object({
  rating: afz.number({
    component: StarRating,
    controlProps: {
      class: 'w-full',
      max: 5
    }
  }).int().min(1).max(5).default(4)
    .meta({ label: '满意度评分', description: '请对我们的服务进行评分' }),

  userRating: afz.number({
    component: StarRating,
    controlProps: {
      class: 'w-full',
      max: 10
    }
  }).int().min(1).max(10).default(7)
    .meta({ label: '用户评分', hint: '1-10 分评分' }),

  name: afz.string({ controlProps: { placeholder: '请输入您的姓名' } }).min(2)
    .meta({ label: '姓名' }),

  feedback: afz.string({ type: 'textarea', controlProps: { placeholder: '请分享您的想法...' } }).optional()
    .meta({ label: '反馈意见' })
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
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>
