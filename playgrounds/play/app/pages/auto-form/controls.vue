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
  file: afz.file(),
  inputDate: afz.inputDate(),
  inputTime: afz.inputTime(),

  withClear: afz.string({ type: 'withClear' }).meta({ label: 'WithClear' }).default('movk'),
  withCopy: afz.string({ type: 'withCopy' }).default('https://movk.dev').meta({ label: 'WithCopy' }),
  withPassword: afz.string({ type: 'withPasswordToggle' }).default('s3cret').meta({ label: 'WithPasswordToggle' }),
  withChars: afz.string({ type: 'withCharacterLimit', controlProps: { maxlength: 30 } }).meta({ label: 'WithCharacterLimit' }),
  withFloating: afz.string({ type: 'withFloatingLabel', controlProps: { label: 'WithFloatingLabel' } }).meta({ label: '' }),
  asPhone: afz.string({ type: 'asPhoneNumberInput' }).default('13800138000').meta({ label: 'AsPhone' }),

  textarea: afz.string({ type: 'textarea', controlProps: { rows: 3 } }).meta({ label: 'textarea' }),
  switch: afz.boolean({ type: 'switch' }).meta({ label: 'switch' }),
  slider: afz.number({ type: 'slider', controlProps: { min: 0, max: 100, step: 5 } }).default(40).meta({ label: 'slider' }),

  selectMenu: afz.enum(['北京', '上海', '广州', '深圳'], { type: 'selectMenu' }).meta({ label: 'selectMenu' }),
  inputMenu: afz.enum(['Vue', 'React', 'Svelte', 'Solid'], { type: 'inputMenu' }).meta({ label: 'inputMenu' }),
  checkboxGroup: afz.array(afz.string(), { type: 'checkboxGroup', controlProps: { items: ['读书', '运动', '音乐'] } }).meta({ label: 'checkboxGroup' }),
  radioGroup: afz.enum(['男', '女', '其他'], { type: 'radioGroup' }).meta({ label: 'radioGroup' }),
  inputTags: afz.array(afz.string(), { type: 'inputTags' }).default(['nuxt', 'vue']).meta({ label: 'inputTags' }),
  pinInput: afz.array(afz.string(), ({ type: 'pinInput', controlProps: { length: 4 } })).meta({ label: 'pinInput' }),
  listboxString: afz.string({ type: 'listbox', controlProps: { valueKey: 'value', items: [{ label: 'Vue', value: 'vue' }, { label: 'React', value: 'react' }, { label: 'Svelte', value: 'svelte' }, { label: 'Solid', value: 'solid' }] } }).default('svelte').meta({ label: 'listboxString' }),
  listboxStrings: afz.array(afz.string(), ({ type: 'listbox', controlProps: { multiple: true, valueKey: 'value', items: [{ label: 'Vue', value: 'vue' }, { label: 'React', value: 'react' }, { label: 'Svelte', value: 'svelte' }, { label: 'Solid', value: 'solid' }] } }))
    .meta({ label: 'listboxStrings' }),
  listboxObject: afz.object({ name: afz.string(), age: afz.number() }, { type: 'listbox', controlProps: { labelKey: 'name', items: [{ name: 'vue', age: 3 }, { name: 'react', age: 2 }, { name: 'svelte', age: 1 }, { name: 'solid', age: 4 }] } })
    .default({ name: 'svelte', age: 1 })
    .meta({ label: 'listboxObject' }),

  starRating: afz.number({ type: 'starRating', controlProps: { allowHalf: true } }).default(3.5).meta({ label: 'starRating' }),
  colorChooser: afz.string({ type: 'colorChooser', controlProps: { formats: ['hex', 'rgb'] } }).default('#0ea5e9').meta({ label: 'colorChooser' }),
  slideVerify: afz.boolean({ type: 'slideVerify', controlProps: { size: 'sm' } }).meta({ label: 'slideVerify' }),
  pillGroupString: afz.string({ type: 'pillGroup', controlProps: { items: ['vue', 'react', 'svelte', 'solid'] } }).default('react').meta({ label: 'pillGroupString' }),
  pillGroupStrings: afz.array(afz.string(), { type: 'pillGroup', controlProps: { multiple: true, valueKey: 'value', items: [{ label: 'Vue', value: 'vue' }, { label: 'React', value: 'react' }, { label: 'Svelte', value: 'svelte' }, { label: 'Solid', value: 'solid' }] } }).default(['vue', 'react']).meta({ label: 'pillGroupStrings' }),
  pillGroupObject: afz.object({ name: afz.string(), age: afz.number() }, { type: 'pillGroup', controlProps: { labelKey: 'name', items: [{ name: 'vue', age: 3 }, { name: 'react', age: 2 }, { name: 'svelte', age: 1 }, { name: 'solid', age: 4 }] } })
    .default({ name: 'react', age: 2 })
    .meta({ label: 'pillGroupObject' })
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
    <Showcase
      title="内置控件映射"
      description="覆盖 Nuxt UI 控件、输入包装器和自定义组件型控件的 type 映射"
    >
      <template #toolbar>
        <UButton size="sm" label="重置" @click="autoForm?.reset()" />
      </template>
      <MAutoForm ref="autoForm" :schema="schema" :state="state" />
    </Showcase>
    <StateViewer :state="state" label="state" />
  </div>
</template>
