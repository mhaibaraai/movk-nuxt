<script setup lang="ts">
import { z } from 'zod'

const { afz } = useFormBuilder()

const schema = z.object({
  withClear: afz.string({ type: 'withClear', label: 'WithClear', controlProps: { placeholder: '可清除' } }),
  withCopy: afz.string({ type: 'withCopy', label: 'WithCopy' }).default('https://movk.dev'),
  withPassword: afz.string({ type: 'withPasswordToggle', label: 'WithPasswordToggle' }).default('s3cret'),
  withChars: afz.string({ type: 'withCharacterLimit', label: 'WithCharacterLimit', controlProps: { maxlength: 30 } }),
  withFloating: afz.string({ type: 'withFloatingLabel', label: 'WithFloatingLabel', controlProps: { placeholder: ' ' } }),
  asPhone: afz.string({ type: 'asPhoneNumberInput', label: 'AsPhoneNumberInput' }).default('13800138000'),

  textarea: afz.string({ type: 'textarea', label: 'textarea', controlProps: { rows: 3 } }),
  switch: afz.boolean({ type: 'switch', label: 'switch' }),
  slider: afz.number({ type: 'slider', label: 'slider', controlProps: { min: 0, max: 100, step: 5 } }).default(40),
  pinInput: afz.string({ type: 'pinInput', label: 'pinInput', controlProps: { length: 4 } }),

  selectMenu: afz.enum(['北京', '上海', '广州', '深圳'], { type: 'selectMenu', label: 'selectMenu' }),
  inputMenu: afz.enum(['Vue', 'React', 'Svelte', 'Solid'], { type: 'inputMenu', label: 'inputMenu' }),
  checkboxGroup: afz.array(afz.string(), { type: 'checkboxGroup', label: 'checkboxGroup', controlProps: { items: ['读书', '运动', '音乐'] } }),
  radioGroup: afz.enum(['男', '女', '其他'], { type: 'radioGroup', label: 'radioGroup' }),
  inputTags: afz.array(afz.string(), { type: 'inputTags', label: 'inputTags' }).default(['nuxt', 'vue']),

  starRating: afz.number({ type: 'starRating', label: 'starRating', controlProps: { allowHalf: true } }).default(3.5),
  colorChooser: afz.string({ type: 'colorChooser', label: 'colorChooser' }).default('#0ea5e9'),
  slideVerify: afz.boolean({ type: 'slideVerify', label: 'slideVerify' })
})

const state = reactive<Partial<z.input<typeof schema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
    <Showcase
      title="所有内置控件"
      description="with* / as* / textarea / switch / slider / pinInput / selectMenu / inputMenu / checkboxGroup / radioGroup / inputTags / starRating / colorChooser / slideVerify"
    >
      <MAutoForm :schema="schema" :state="state" :global-meta="{ cols: 6 }" />
    </Showcase>
    <StateViewer :state="state" label="state" />
  </div>
</template>
