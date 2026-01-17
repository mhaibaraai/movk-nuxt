<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  starRating: afz.number({
    type: 'starRating',
    controlProps: {
      allowHalf: true,
      filledIcon: 'i-mdi-circle',
      emptyIcon: 'i-mdi-circle-outline',
      halfIcon: 'i-mdi-circle-half',
      max: 7
    }
  }).default(3.5).meta({ hint: '星级评分控件' })
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
  <Matrix :form="form" title="星级评分" description="使用 `starRating` 类型来渲染一个星级评分控件。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
