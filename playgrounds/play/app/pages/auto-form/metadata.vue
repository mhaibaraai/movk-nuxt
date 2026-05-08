<script setup lang="ts">
import { z } from 'zod'

const { afz } = useFormBuilder()

const baseSchema = z.object({
  name: afz.string(),
  age: afz.number(),
  bio: afz.string()
})

const richSchema = z.object({
  name: afz.string({
    label: '姓名',
    description: '请填写真实姓名',
    controlProps: { placeholder: '张三', icon: 'i-lucide-user' }
  }),
  age: afz.number({
    label: '年龄',
    description: '0-150',
    controlProps: { min: 0, max: 150 }
  }),
  bio: afz.string({
    type: 'textarea',
    label: '个人简介',
    controlProps: { rows: 4, placeholder: '介绍一下你自己…' }
  }),
  hidden: afz.string({ hidden: true }).default('不会显示但会提交')
})

const baseState = reactive<Partial<z.input<typeof baseSchema>>>({})
const richState = reactive<Partial<z.input<typeof richSchema>>>({ hidden: 'secret' })
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="无元数据（默认）" :state="baseState">
      <MAutoForm :schema="baseSchema" :state="baseState" />
    </Showcase>
    <Showcase
      title="加上元数据"
      description="label / description / placeholder / icon / hidden / type=textarea"
      :state="richState"
    >
      <MAutoForm :schema="richSchema" :state="richState" />
    </Showcase>
  </div>
</template>
