<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const autoForm = useTemplateRef('autoForm')

const schema = afz.object({
  string: afz.string({ controlProps: { placeholder: '默认文本' } }),
  number: afz.number({ controlProps: { placeholder: '默认数字' } }),
  boolean: afz.boolean(),
  enum: afz.enum(['low', 'medium', 'high']).default('medium'),
  calendarDate: afz.calendarDate({ controlProps: { range: true, valueFormat: 'iso', presets: 'default' } }),
  inputDate: afz.inputDate(),
  inputTime: afz.inputTime(),

  withClear: afz.string({ type: 'withClear' }).meta({ label: 'WithClear' }).default('movk'),
  withCopy: afz.string({ type: 'withCopy' }).default('https://movk.dev').meta({ label: 'WithCopy' }),
  withPassword: afz.string({ type: 'withPasswordToggle' }).default('s3cret').meta({ label: 'WithPasswordToggle' }),
  withChars: afz.string({ type: 'withCharacterLimit', controlProps: { maxlength: 30 } }).meta({ label: 'WithCharacterLimit' }),
  asPhone: afz.string({ type: 'asPhoneNumberInput' }).default('13800138000').meta({ label: 'AsPhone' }),

  textarea: afz.string({ type: 'textarea', controlProps: { rows: 3 } }).meta({ label: 'textarea' }),
  switch: afz.boolean({ type: 'switch' }).meta({ label: 'switch' }),
  slider: afz.number({ type: 'slider', controlProps: { min: 0, max: 100, step: 5 } }).default(40).meta({ label: 'slider' }),

  selectMenu: afz.enum(['北京', '上海', '广州', '深圳'], { type: 'selectMenu' }).meta({ label: 'selectMenu' }),
  radioGroup: afz.enum(['男', '女', '其他'], { type: 'radioGroup' }).meta({ label: 'radioGroup' }),
  inputTags: afz.array(afz.string(), { type: 'inputTags' }).default(['nuxt', 'vue']).meta({ label: 'inputTags' }),
  pinInput: afz.array(afz.string(), { type: 'pinInput', controlProps: { length: 4 } }).meta({ label: 'pinInput' }),

  starRating: afz.number({ type: 'starRating', controlProps: { allowHalf: true } }).default(3.5).meta({ label: 'starRating' }),
  colorChooser: afz.string({ type: 'colorChooser', controlProps: { formats: ['hex', 'rgb'] } }).default('#0ea5e9').meta({ label: 'colorChooser' }),
  pillGroupString: afz.string({ type: 'pillGroup', controlProps: { items: ['vue', 'react', 'svelte', 'solid'] } }).default('react').meta({ label: 'pillGroup' })
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UButton size="sm" label="重置" class="self-start" @click="autoForm?.reset()" />
    <MAutoForm ref="autoForm" :schema="schema" :state="state" />
  </div>
</template>
