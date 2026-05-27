<script lang="ts" setup>
import type { z } from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入姓名' } }).min(2).meta({ label: '姓名' }),
  email: afz.email().meta({ label: '邮箱' }),
  age: afz.number().min(0).max(150).meta({ label: '年龄' }),
  bio: afz.string({ type: 'textarea', controlProps: { rows: 2 } }).optional().meta({ label: '简介' })
})

const form = ref<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <MAutoForm :schema="schema" :state="form" />
</template>
