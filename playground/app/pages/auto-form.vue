<script lang="ts" setup>
import type { AutoFormControls, AutoFormFieldContext } from '#movk/types'
import type { InferInput } from '@nuxt/ui'
import { UInputNumber } from '#components'

interface State {
  nameValue: string
  dynamicLabel: string
  mixedDescription: number
  requiredField: string
  optionalField: string
  withDefault: boolean
  stringWithDefault: string
  enumField: string
  conditionalRequired: string
  visibleTest: number
  hiddenTest: number
  nestedObject: {
    firstName: string
    lastName: string
    userAge: number
    address: {
      province: string
      city: string
      district: string
    }
  }
}

const customControls = {
  test: createAutoFormControl({ component: UInputNumber }),
} as const satisfies AutoFormControls

const { afz } = createAutoFormZ(customControls)

const formState = ref({})

const schema = computed(() => afz.looseObject<State>({
  nameValue: afz.string({
    if: true,
  }).meta({
    size: 'sm',
  }),
  visibleTest: afz.boolean(),
  dynamicLabel: afz.string({
    if: !!formState.value.visibleTest,
    // hidden: ({ state }) => !state.visibleTest,
    controlProps: ({ state }) => ({
      icon: 'i-lucide-alarm-clock',
      color: state.nameValue ? 'success' : 'error',
    }),
  }).meta({
    label: ({ state }) => `动态字段: ${state.nameValue}`,
  }).optional(),
  // nestedObject: afz.object<State['nestedObject']>({
  //   firstName: afz.string({
  //     props: ({ state }: AutoFormFieldContext<State['nestedObject']>) => ({
  //       color: state.lastName ? 'primary' : 'error',
  //     }),
  //   }).default('default name').optional(),
  //   lastName: afz.string().meta({
  //     label: ({ state }) => `动态字段: ${state.firstName}`,
  //   }),
  // }),
}))
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">
          函数式 API
        </h3>
      </template>
      <MAutoForm v-model="formState" :schema="schema" class="space-y-4" :controls="customControls" />
    </UCard>
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">
          当前State值
        </h2>
      </template>
      <pre class="text-sm">{{ JSON.stringify(formState, null, 2) }}</pre>
    </UCard>
  </div>
</template>
