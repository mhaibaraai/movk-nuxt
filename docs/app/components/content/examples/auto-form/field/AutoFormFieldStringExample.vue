<script lang="ts" setup>
import type z from 'zod/v4'

const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string()
    .min(3, '用户名至少 3 个字符')
    .max(20, '用户名最多 20 个字符')
    .meta({
      label: '用户名',
      placeholder: '请输入用户名'
    }),

  bio: afz.string({
    type: 'textarea'
  })
    .optional()
    .meta({
      label: '个人简介',
      placeholder: '介绍一下自己...'
    })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})
</script>

<template>
  <UCard>
    <MAutoForm :schema="schema" :state="form" />
  </UCard>
</template>
