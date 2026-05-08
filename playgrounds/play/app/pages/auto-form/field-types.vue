<script setup lang="ts">
import { z } from 'zod'

const { afz } = useFormBuilder()

const schema = z.object({
  string: afz.string({ controlProps: { placeholder: '文本' } }),
  number: afz.number({ controlProps: { placeholder: '数字' } }),
  boolean: afz.boolean(),
  email: afz.email(),
  url: afz.url(),
  enum: afz.enum(['low', 'medium', 'high']),
  calendarDate: afz.calendarDate(),
  inputDate: afz.inputDate(),
  inputTime: afz.inputTime(),
  isoDate: afz.isoDate(),
  array: afz.array(afz.string(), { label: '标签列表' }),
  object: afz.object({
    sub1: afz.string({ controlProps: { placeholder: 'sub1' } }),
    sub2: afz.number()
  }, { label: '嵌套对象' }),
  file: afz.file()
})

const state = reactive<Partial<z.input<typeof schema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
    <Showcase
      title="所有 Zod 类型"
      description="afz.{string,number,boolean,email,url,enum,calendarDate,inputDate,inputTime,isoDate,array,object,file}"
    >
      <MAutoForm :schema="schema" :state="state" />
    </Showcase>

    <StateViewer :state="state" label="state" />
  </div>
</template>
