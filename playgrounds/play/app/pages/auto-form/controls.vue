<script setup lang="ts">
import { z } from 'zod'

const { afz } = useAutoForm()
const autoForm = useTemplateRef('autoForm')

const schema = z.object({
  withClear: afz.string({ type: 'withClear' }).meta({ label: 'WithClear', size: 'xs' }).default('movk'),
  withCopy: afz.string({ type: 'withCopy' }).default('https://movk.dev').meta({ label: 'WithCopy' }),
  withPassword: afz.string({ type: 'withPasswordToggle' }).default('s3cret').meta({ label: 'WithPasswordToggle' }),
  withChars: afz.string({ type: 'withCharacterLimit', controlProps: { maxlength: 30 } }).meta({ label: 'WithCharacterLimit' }),
  withFloating: afz.string({ type: 'withFloatingLabel' }).meta({ label: 'WithFloatingLabel' }),
  asPhone: afz.string({ type: 'asPhoneNumberInput' }).default('13800138000').meta({ label: 'AsPhone' }),

  textarea: afz.string({ type: 'textarea', controlProps: { rows: 3 } }).meta({ label: 'textarea' }),
  switch: afz.boolean({ type: 'switch' }).meta({ label: 'switch' }),
  slider: afz.number({ type: 'slider', controlProps: { min: 0, max: 100, step: 5 } }).default(40).meta({ label: 'slider' }),
  pinInput: afz.string({ type: 'pinInput', controlProps: { length: 4 } }).meta({ label: 'pinInput' }),

  selectMenu: afz.enum(['北京', '上海', '广州', '深圳'], { type: 'selectMenu' }).meta({ label: 'selectMenu' }),
  inputMenu: afz.enum(['Vue', 'React', 'Svelte', 'Solid'], { type: 'inputMenu' }).meta({ label: 'inputMenu' }),
  checkboxGroup: afz.array(afz.string(), { type: 'checkboxGroup', controlProps: { items: ['读书', '运动', '音乐'] } }).meta({ label: 'checkboxGroup' }),
  radioGroup: afz.enum(['男', '女', '其他'], { type: 'radioGroup' }).meta({ label: 'radioGroup' }),
  inputTags: afz.array(afz.string(), { type: 'inputTags' }).default(['nuxt', 'vue']).meta({ label: 'inputTags' }),

  starRating: afz.number({ type: 'starRating', controlProps: { allowHalf: true } }).default(3.5).meta({ label: 'starRating', size: 'xs' }),
  colorChooser: afz.string({ type: 'colorChooser' }).default('#0ea5e9').meta({ label: 'colorChooser', size: 'xs' }),
  slideVerify: afz.boolean({ type: 'slideVerify' }).meta({ label: 'slideVerify', size: 'xs' })
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
    <Showcase title="所有内置控件">
      <template #toolbar>
        <UButton size="sm" label="重置" @click="autoForm?.reset()" />
      </template>
      <UFormField label="WithClear" size="xs">
        <UFieldGroup size="xs" class="w-full">
          <MWithClear v-model="state.withClear" placeholder="可清除" />
          <UButton icon="i-lucide-search" color="neutral" variant="subtle" />
        </UFieldGroup>
      </UFormField>
      <MAutoForm ref="autoForm" :schema="schema" :state="state" :global-meta="{ cols: 6 }" />
    </Showcase>
    <StateViewer :state="state" label="state" />
  </div>
</template>
