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
    .meta({ label: 'listboxObject' })
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
    <Showcase
      title="内置控件类型"
      description="按 type 分发到 Nuxt UI 控件与 DatePicker。"
    >
      <template #toolbar>
        <UButton size="sm" label="重置" @click="autoForm?.reset()" />
      </template>
      <MAutoForm ref="autoForm" :schema="schema" :state="state" />
    </Showcase>
    <StateViewer :state="state" label="state" />
  </div>
</template>
