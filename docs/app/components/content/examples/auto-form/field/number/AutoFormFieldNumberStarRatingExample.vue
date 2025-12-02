<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  rating: afz.number({
    type: 'starRating',
    controlProps: {
      allowHalf: true,
      max: 10
    }
  })
    .min(0, '评分不能小于 0')
    .max(10, '评分不能大于 10')
    .meta({
      label: '星级评分',
      hint: '支持半星评分'
    })
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <MAutoForm :schema="schema" @submit="onSubmit" />
</template>
