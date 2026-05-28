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
        { label: '日期', icon: 'i-lucide-calendar', slot: 'date' },
        { label: '自定义', icon: 'i-lucide-palette', slot: 'custom' }
      ]
    },
    fieldSlots: {
      string: 'text',
      textarea: 'text',
      withClear: 'text',
      withCopy: 'text',
      withPasswordToggle: 'text',
      withCharacterLimit: 'text',
      asPhoneNumberInput: 'text',
      withFloatingLabel: 'text',
      inputMenu: 'text',
      pinInput: 'text',

      number: 'number',
      slider: 'number',
      starRating: 'number',

      boolean: 'boolean',
      switch: 'boolean',
      slideVerify: 'boolean',

      enum: 'select',
      selectMenu: 'select',
      radioGroup: 'select',
      listbox: 'select',
      checkboxGroup: 'select',
      inputTags: 'select',
      pillGroup: 'select',

      calendarDate: 'date',
      inputDate: 'date',
      inputTime: 'date',

      colorChooser: 'custom'
    },
    fields: {
      string: afz.string({ controlProps: { placeholder: '默认文本' } }).meta({ label: 'Input' }),
      textarea: afz.string({ type: 'textarea', controlProps: { rows: 2 } }).meta({ label: 'Textarea' }),
      withClear: afz.string({ type: 'withClear' }).default('movk').meta({ label: 'WithClear' }),
      withCopy: afz.string({ type: 'withCopy' }).default('https://movk.dev').meta({ label: 'WithCopy' }),
      withPasswordToggle: afz.string({ type: 'withPasswordToggle' }).default('s3cret').meta({ label: 'WithPasswordToggle' }),
      withCharacterLimit: afz.string({ type: 'withCharacterLimit', controlProps: { maxlength: 30 } }).meta({ label: 'WithCharacterLimit' }),
      asPhoneNumberInput: afz.string({ type: 'asPhoneNumberInput' }).default('13800138000').meta({ label: 'AsPhoneNumberInput' }),
      withFloatingLabel: afz.string({ type: 'withFloatingLabel' }).meta({ label: 'WithFloatingLabel' }),
      inputMenu: afz.string({ type: 'inputMenu', controlProps: { items: ['Vue', 'Nuxt', 'Nitro'] } }).meta({ label: 'InputMenu' }),
      pinInput: afz.array(afz.string(), { type: 'pinInput', controlProps: { length: 4 } }).meta({ label: 'PinInput' }),

      number: afz.number({ controlProps: { placeholder: '默认数字' } }).meta({ label: 'InputNumber' }),
      slider: afz.number({ type: 'slider', controlProps: { min: 0, max: 100, step: 5 } }).default(40).meta({ label: 'Slider' }),
      starRating: afz.number({ type: 'starRating', controlProps: { allowHalf: true } }).default(3.5).meta({ label: 'StarRating' }),

      boolean: afz.boolean().meta({ label: 'Checkbox' }),
      switch: afz.boolean({ type: 'switch' }).meta({ label: 'Switch' }),
      slideVerify: afz.boolean({ type: 'slideVerify' }).meta({ label: 'SlideVerify' }),

      enum: afz.enum(['low', 'medium', 'high']).default('medium').meta({ label: 'Select' }),
      selectMenu: afz.enum(['北京', '上海', '广州', '深圳'], { type: 'selectMenu' }).meta({ label: 'SelectMenu' }),
      radioGroup: afz.enum(['男', '女', '其他'], { type: 'radioGroup' }).meta({ label: 'RadioGroup' }),
      listbox: afz.enum(['草稿', '已发布', '已归档'], { type: 'listbox' }).default('草稿').meta({ label: 'Listbox' }),
      checkboxGroup: afz.array(afz.string(), { type: 'checkboxGroup', controlProps: { items: ['阅读', '游戏', '运动'] } }).meta({ label: 'CheckboxGroup' }),
      inputTags: afz.array(afz.string(), { type: 'inputTags' }).default(['nuxt', 'vue']).meta({ label: 'InputTags' }),
      pillGroup: afz.enum(['全部', '前端', '后端'], { type: 'pillGroup' }).default('全部').meta({ label: 'PillGroup' }),

      calendarDate: afz.calendarDate({ controlProps: { valueFormat: 'iso' } }).meta({ label: 'DatePicker' }),
      inputDate: afz.inputDate().meta({ label: 'InputDate' }),
      inputTime: afz.inputTime().meta({ label: 'InputTime' }),

      colorChooser: afz.string({ type: 'colorChooser', controlProps: { formats: ['hex', 'rgb'] } }).default('#0ea5e9').meta({ label: 'ColorChooser' })
    }
  })
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <MAutoForm :schema="schema" :state="state" />
</template>
