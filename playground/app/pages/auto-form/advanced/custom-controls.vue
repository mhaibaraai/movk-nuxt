<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'
import StarRating from '~/components/StarRating.vue'

const toast = useToast()

const { afz, controls } = useAutoForm({
  rating: { component: StarRating, controlProps: { class: 'w-full' } }
})

const schema = afz.object({
  rating: afz.number({ type: 'rating' }).int().min(1).max(5).default(3)
    .meta({ label: '评分', description: '请为您的体验打分' }),
  tags: afz.array(afz.string(), { type: 'inputTags' })
    .meta({ label: '标签', description: '添加一些标签来描述您的体验' })
    .default(['优秀', '易用']),
  review: afz.string({ type: 'textarea' }).optional()
    .meta({ label: '评价内容', placeholder: '分享您的使用体验...' }),
  wouldRecommend: afz.boolean().default(true)
    .meta({ label: '是否推荐', hint: '您会推荐给朋友吗?' })
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
  <Matrix :form="form" title="自定义控件" description="演示如何使用自定义 Vue 组件作为表单字段的渲染控件。">
    <MAutoForm
      :schema="schema"
      :controls="controls"
      :state="form"
      @submit="onSubmit"
    />
  </Matrix>
</template>
