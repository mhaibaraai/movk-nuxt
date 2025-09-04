<script setup lang="ts" generic="T extends z.ZodObject<any>">
import type { FormSubmitEvent, InferInput } from '@nuxt/ui'
import type { z, ZodType } from 'zod/v4'
import type { AutoFormOptions, FieldMeta } from '../../types'
import { h, reactive, toRefs, watch } from 'vue'
import { useFieldTree } from './useFieldTree'
import { aggregateZodErrors, parsePath } from './utils'

type AutoFormStateType = InferInput<T>
interface AutoFormEmits<T extends object> {
  submit: [payload: FormSubmitEvent<T>]
}

const { schema, options } = defineProps<{
  schema: T
  options?: AutoFormOptions
}>()
const emit = defineEmits<AutoFormEmits<AutoFormStateType>>()

const state = defineModel<AutoFormStateType>()

const { fields } = useFieldTree(schema, options)

function getByPath(obj: any, path: string) {
  const segs = parsePath(path)
  let cur = obj
  for (const s of segs) {
    if (cur == null)
      return undefined
    cur = cur[s as any]
  }
  return cur
}

function setByPath(obj: any, path: string, value: any) {
  const segs = parsePath(path)
  let cur = obj
  for (let i = 0; i < segs.length - 1; i++) {
    const s = segs[i]
    if (cur[s as any] == null)
      cur[s as any] = typeof segs[i + 1] === 'number' ? [] : {}
    cur = cur[s as any]
  }
  cur[segs[segs.length - 1] as any] = value
}

function resolveComponentForField(meta?: FieldMeta) {
  // 默认退化到 UInput，如无可用组件
  // 依赖宿主应用已注册 Nuxt UI 组件
  return meta?.component ?? (globalThis as any).UInput ?? 'input'
}

function renderControl(fieldPath: string, meta?: FieldMeta) {
  const component = resolveComponentForField(meta)
  return h(component as any, {
    'modelValue': getByPath(state, fieldPath),
    'onUpdate:modelValue': (v: any) => setByPath(state, fieldPath, v),
    ...(meta?.controlProps || {}),
  })
}

async function validate(_state: any) {
  const result = await schema.value.safeParseAsync(_state)
  if (!result.success) {
    const { fieldErrors, formErrors } = aggregateZodErrors(result.error)
    return [
      ...fieldErrors,
      ...formErrors.map(msg => ({ path: '__root__', message: msg })),
    ]
  }
  return []
}

function onSubmit() {
  emit('submit', { ...state })
}
</script>

<template>
  <UForm :state="state" :validate="validate" @submit.prevent="onSubmit">
    <div>
      <template v-for="(field, index) in fields" :key="field.path">
        <UFormField
          :name="field.path"
          :label="field.meta?.label"
          :description="field.meta?.description"
          :hint="field.meta?.hint"
          :help="field.meta?.help"
          :required="field.meta?.required"
          :size="field.meta?.size"
          :eager-validation="field.meta?.eagerValidation"
          :validate-on-input-delay="field.meta?.validateOnInputDelay"
          :ui="field.meta?.ui"
        >
          <template #default>
            <slot name="field" :path="field.path" :index="index" :render="() => renderControl(field.path, field.meta)">
              <ClientOnly>
                <component
                  :is="field.control.component || 'UInput'"
                  :model-value="getByPath(state, field.path)"
                  v-bind="field.control.props"
                  :ui="field.control.ui"
                  @update:model-value="(v: any) => setByPath(state, field.path, v)"
                />
              </ClientOnly>
            </slot>
          </template>
        </UFormField>
      </template>
    </div>
  </UForm>
</template>
