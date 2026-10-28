<script setup lang="ts">
import { UTabs } from '#components'
import type { z } from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  $tabs: afz.layout({
    component: UTabs,
    props: {
      ui: { content: 'pt-4 space-y-4' },
      items: [
        { label: '文本', icon: 'i-lucide-type', slot: 'text' },
        { label: '数字', icon: 'i-lucide-hash', slot: 'number' },
        { label: '布尔', icon: 'i-lucide-toggle-left', slot: 'boolean' },
        { label: '选择', icon: 'i-lucide-list', slot: 'select' },
        { label: '日期', icon: 'i-lucide-calendar', slot: 'date' }
      ]
    },
    fieldSlots: {
      string: 'text',
      textarea: 'text',
      inputMenu: 'text',
      pinInput: 'text',

      number: 'number',
      slider: 'number',

      boolean: 'boolean',
      switch: 'boolean',

      enum: 'select',
      selectMenu: 'select',
      radioGroup: 'select',
      listbox: 'select',
      checkboxGroup: 'select',
      inputTags: 'select',

      calendarDate: 'date',
      inputDate: 'date',
      inputTime: 'date'
    },
    fields: {
      string: afz.string({ controlProps: { placeholder: '默认文本' } }).meta({ label: 'Input' }),
      textarea: afz.string({ type: 'textarea', controlProps: { rows: 2 } }).meta({ label: 'Textarea' }),
      inputMenu: afz.string({ type: 'inputMenu', controlProps: { items: ['Vue', 'Nuxt', 'Nitro'] } }).meta({ label: 'InputMenu' }),
      pinInput: afz.array(afz.string(), { type: 'pinInput', controlProps: { length: 4 } }).meta({ label: 'PinInput' }),

      number: afz.number({ controlProps: { placeholder: '默认数字' } }).meta({ label: 'InputNumber' }),
      slider: afz.number({ type: 'slider', controlProps: { min: 0, max: 100, step: 5 } }).default(40).meta({ label: 'Slider' }),

      boolean: afz.boolean().meta({ label: 'Checkbox' }),
      switch: afz.boolean({ type: 'switch' }).meta({ label: 'Switch' }),

      enum: afz.enum(['low', 'medium', 'high']).default('medium').meta({ label: 'Select' }),
      selectMenu: afz.enum(['北京', '上海', '广州', '深圳'], { type: 'selectMenu' }).meta({ label: 'SelectMenu' }),
      radioGroup: afz.enum(['男', '女', '其他'], { type: 'radioGroup' }).meta({ label: 'RadioGroup' }),
      listbox: afz.enum(['草稿', '已发布', '已归档'], { type: 'listbox' }).default('草稿').meta({ label: 'Listbox' }),
      checkboxGroup: afz.array(afz.string(), { type: 'checkboxGroup', controlProps: { items: ['阅读', '游戏', '运动'] } }).meta({ label: 'CheckboxGroup' }),
      inputTags: afz.array(afz.string(), { type: 'inputTags' }).default(['nuxt', 'vue']).meta({ label: 'InputTags' }),

      calendarDate: afz.calendarDate({ controlProps: { valueFormat: 'iso' } }).meta({ label: 'DatePicker' }),
      inputDate: afz.inputDate().meta({ label: 'InputDate' }),
      inputTime: afz.inputTime().meta({ label: 'InputTime' })
    }
  })
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <MAutoForm :schema="schema" :state="state" />
</template>
