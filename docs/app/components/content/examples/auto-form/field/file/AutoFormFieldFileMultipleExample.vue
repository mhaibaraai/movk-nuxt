<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  attachments: afz.array(afz.file(), {
    type: 'file',
    controlProps: {
      multiple: true
    }
  })
    .min(1, '至少上传一个文件')
    .max(5, '最多上传 5 个文件')
    .meta({
      label: '多文件上传',
      hint: '最多上传 5 个文件'
    })
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: `已上传 ${event.data.attachments.length} 个文件`
  })
}
</script>

<template>
  <MAutoForm :schema="schema" @submit="onSubmit" />
</template>
