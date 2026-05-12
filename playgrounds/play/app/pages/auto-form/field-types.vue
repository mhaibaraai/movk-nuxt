<script setup lang="ts">
import { z } from 'zod'

const autoForm = useTemplateRef('autoForm')
const { afz } = useAutoForm()

const schema = z.object({
  string: afz.string({ controlProps: { placeholder: '文本' } }),
  number: afz.number({ controlProps: { placeholder: '数字' } }),
  boolean: afz.boolean(),
  email: afz.email(),
  url: afz.url(),
  uuid: afz.uuid(),
  enum: afz.enum(['low', 'medium', 'high']),
  calendarDate: afz.calendarDate({ controlProps: { range: true, valueFormat: 'iso', presets: 'default' } }),
  inputDate: afz.inputDate(),
  inputTime: afz.inputTime(),
  isoDatetime: afz.isoDatetime(),
  isoDate: afz.isoDate(),
  isoTime: afz.isoTime(),
  array: afz.array(afz.string().meta({ label: '标签' })).meta({ label: '标签列表' }),
  object: afz.object({
    sub1: afz.string({ controlProps: { placeholder: 'sub1' } }),
    sub2: afz.number()
  }).meta({ label: '嵌套对象' }),
  looseObject: afz.looseObject({
    sub1: afz.string({ controlProps: { placeholder: 'sub1' } }),
    sub2: afz.number()
  }).meta({ label: '宽松嵌套对象' }),
  strictObject: afz.strictObject({
    sub1: afz.string({ controlProps: { placeholder: 'sub1' } }),
    sub2: afz.number()
  }).meta({ label: '严格嵌套对象' }),
  tuple: afz.tuple([afz.string(), afz.number()], { type: 'textarea' }).meta({ label: '元组' }),
  file: afz.file()
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
    <Showcase title="所有 Zod 类型">
      <template #toolbar>
        <UButton size="sm" label="重置" @click="autoForm?.reset()" />
      </template>
      <MAutoForm ref="autoForm" :schema="schema" :state="state" />
    </Showcase>

    <StateViewer :state="state" label="state" />
  </div>
</template>
