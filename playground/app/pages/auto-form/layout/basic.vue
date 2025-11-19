<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  $layout: afz.layout({
    class: 'space-y-4',
    fields: {
      firstName: afz.string(),
      lastName: afz.string(),
      email: afz.email()
    }
  })
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
  <Matrix :form="form" title="基础布局" description="使用 `afz.layout` 创建基础的垂直布局。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
