<script lang="ts" setup>
import type { ButtonProps, FormFieldProps, FormProps, FormSchema, FormSubmitEvent, PinInputProps, SeparatorProps } from '@nuxt/ui'
import type { ClassValue } from 'tailwind-variants'
import type { PageCardProps } from './PageCard.vue'
import { omit } from '@movk/core'
import { computed, ref, useTemplateRef } from 'vue'
import theme from '../../theme/auth-form'
import { smartT } from '../utils/t'
import { tv } from '../utils/tv'
import PageCard from './PageCard.vue'

interface AuthFormField extends FormFieldProps {
  name: string
  type?: 'checkbox' | 'select' | 'password' | 'text' | 'otp'
  placeholder?: string
  defaultValue?: any
  otp?: PinInputProps
}

type DynamicFieldSlots<T, F, SlotProps = {
  field: F
  state: T
}> = Record<string, (props: SlotProps) => any> & Record<`${keyof T extends string ? keyof T : never}-field`, (props: SlotProps) => any>
type DynamicFormFieldSlots<T> = Record<string, (props?: object) => any> & Record<`${keyof T extends string ? keyof T : never}-${'label' | 'description' | 'hint' | 'help' | 'error'}`, (props?: object) => any>

export interface AuthFormProps<T extends FormSchema = FormSchema<object>, F extends AuthFormField = AuthFormField> {
  as?: PageCardProps['as']
  /**
   * 标题上方显示的图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-user'
   */
  icon?: string
  title?: string
  description?: string
  fields?: F[]
  /**
   * 在描述下方显示按钮列表
   * `{ color: 'neutral', variant: 'subtle', block: true }`{lang="ts-type"}
   */
  providers?: ButtonProps[]
  /**
   * 分隔符中显示的文本
   * @defaultValue 'or'
   */
  separator?: string | SeparatorProps
  /**
   * 在表单底部显示提交按钮
   * `{ label: 'Continue', block: true }`{lang="ts-type"}
   */
  submit?: ButtonProps
  schema?: T
  validate?: FormProps<T>['validate']
  validateOn?: FormProps<T>['validateOn']
  validateOnInputDelay?: FormProps<T>['validateOnInputDelay']
  disabled?: FormProps<T>['disabled']
  loading?: ButtonProps['loading']
  class?: ClassValue
  /**
   * 密码隐藏时显示的图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-eye-off'
   */
  eyeOffIcon?: string
  /**
   * 密码可见时显示的图标
   * @IconifyIcon
   * @defaultValue 'i-lucide-eye'
   */
  eyeOnIcon?: string
  ui?: Partial<typeof theme['slots']>
}

export interface AuthFormEmits<T extends object> {
  submit: [payload: FormSubmitEvent<T>]
}

export type AuthFormSlots<T extends object = object, F extends AuthFormField = AuthFormField> = {
  header: (props?: object) => any
  leading: (props?: object) => any
  title: (props?: object) => any
  description: (props?: object) => any
  validation: (props?: object) => any
  footer: (props?: object) => any
} & DynamicFieldSlots<T, F> & DynamicFormFieldSlots<T>

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AuthFormProps>(), {
  icon: 'i-lucide-user',
  separator: 'or',
  eyeOffIcon: 'i-lucide-eye-off',
  eyeOnIcon: 'i-lucide-eye',
})
const emits = defineEmits<AuthFormEmits<typeof props.schema>>()
const slots = defineSlots<AuthFormSlots>()

const state = ref((props.fields || []).reduce((acc, field) => {
  if (field.name) {
    acc[field.name] = field.defaultValue
  }
  return acc
}, {} as Record<string, any>))
const formRef = useTemplateRef<HTMLFormElement>('formRef')
const passwordVisibilities = ref((props.fields || []).reduce((acc, field) => {
  if (field.type === 'password') {
    acc[field.name] = false
  }
  return acc
}, {} as Record<string, boolean>))

function togglePasswordVisibility(fieldName: string) {
  passwordVisibilities.value[fieldName] = !passwordVisibilities.value[fieldName]
}
const tvUi = computed(() => tv({ extend: tv(theme) })())
defineExpose({
  formRef,
  state,
})
</script>

<template>
  <PageCard
    :as="as"
    :class="tvUi.root({ class: [ui?.root, props.class] })"
  >
    <div
      v-if="icon || !!slots.icon || (title || !!slots.title) || (description || !!slots.description) || !!slots.header"
      :class="tvUi.header({ class: ui?.header })"
    >
      <slot name="header">
        <div
          v-if="icon || !!slots.leading"
          :class="tvUi.leading({ class: ui?.leading })"
        >
          <slot name="leading">
            <UIcon
              v-if="icon"
              :name="icon"
              :class="tvUi.leadingIcon({ class: ui?.leadingIcon })"
            />
          </slot>
        </div>

        <div
          v-if="title || !!slots.title"
          :class="tvUi.title({ class: ui?.title })"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </div>

        <div
          v-if="description || !!slots.description"
          :class="tvUi.description({ class: ui?.description })"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </div>
      </slot>
    </div>

    <div :class="tvUi.body({ class: ui?.body })">
      <div
        v-if="providers?.length"
        :class="tvUi.providers({ class: ui?.providers })"
      >
        <UButton
          v-for="(provider, index) in providers"
          :key="index"
          block
          color="neutral"
          variant="subtle"
          v-bind="provider"
        />
      </div>

      <USeparator
        v-if="providers?.length && fields?.length"
        v-bind="typeof separator === 'object' ? separator : { label: separator }"
        :class="tvUi.separator({ class: ui?.separator })"
      />

      <UForm
        v-if="fields?.length"
        ref="formRef"
        :state="state"
        :schema="schema"
        :validate="validate"
        :validate-on="validateOn"
        :class="tvUi.form({ class: ui?.form })"
        :disabled="disabled"
        @submit="emits('submit', $event)"
      >
        <UFormField
          v-for="field in fields"
          :key="field.name"
          :label="field.type === 'checkbox' ? '' : field.label ?? ''"
          :description="field.description"
          :help="field.help"
          :hint="field.hint"
          :name="field.name"
          :size="field.size"
          :required="field.required"
        >
          <slot
            :name="`${field.name}-field`"
            v-bind="{ state, field }"
          >
            <UCheckbox
              v-if="field.type === 'checkbox'"
              v-model="state[field.name]"
              :class="tvUi.checkbox({ class: ui?.checkbox })"
              v-bind="omit(field, ['description', 'help', 'hint', 'size'])"
            />
            <USelectMenu
              v-else-if="field.type === 'select'"
              v-model="state[field.name]"
              :class="tvUi.select({ class: ui?.select })"
              v-bind="omit(field, ['description', 'help', 'hint', 'size'])"
            />
            <UInput
              v-else-if="field.type === 'password'"
              v-model="state[field.name]"
              :class="tvUi.password({ class: ui?.password })"
              :type="passwordVisibilities[field.name] ? 'text' : 'password'"
              v-bind="omit(field, ['label', 'description', 'help', 'hint', 'size', 'type', 'required', 'defaultValue'])"
              :ui="{ root: 'w-full' }"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="passwordVisibilities[field.name] ? eyeOffIcon : eyeOnIcon"
                  :aria-label="passwordVisibilities[field.name] ? smartT('authForm.hidePassword') : smartT('authForm.showPassword')"
                  :aria-pressed="passwordVisibilities[field.name]"
                  :aria-controls="field.name"
                  @click="togglePasswordVisibility(field.name)"
                />
              </template>
            </UInput>
            <UPinInput
              v-else-if="field.type === 'otp'"
              :id="field.name"
              v-model="state[field.name]"
              :class="tvUi.otp({ class: ui?.otp })"
              otp
              v-bind="field.otp"
            />
            <UInput
              v-else
              v-model="state[field.name]"
              :class="tvUi.input({ class: ui?.input })"
              v-bind="omit(field, ['label', 'description', 'help', 'hint', 'size', 'required', 'defaultValue'])"
            />
          </slot>

          <template
            v-if="!!slots[`${field.name}-label`]"
            #label
          >
            <slot :name="`${field.name}-label`" />
          </template>
          <template
            v-if="!!slots[`${field.name}-description`]"
            #description
          >
            <slot :name="`${field.name}-description`" />
          </template>
          <template
            v-if="!!slots[`${field.name}-hint`]"
            #hint
          >
            <slot :name="`${field.name}-hint`" />
          </template>
          <template
            v-if="!!slots[`${field.name}-help`]"
            #help
          >
            <slot :name="`${field.name}-help`" />
          </template>
          <template
            v-if="!!slots[`${field.name}-error`]"
            #error
          >
            <slot :name="`${field.name}-error`" />
          </template>
        </UFormField>

        <slot
          v-if="!!slots.validation"
          name="validation"
        />

        <UButton
          type="submit"
          :label="submit?.label ?? smartT('common.continue')"
          block
          :loading="loading"
          v-bind="submit"
        />
      </UForm>
    </div>

    <div
      v-if="!!slots.footer"
      :class="tvUi.footer({ class: ui?.footer })"
    >
      <slot name="footer" />
    </div>
  </PageCard>
</template>
