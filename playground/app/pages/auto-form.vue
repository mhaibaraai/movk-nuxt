<script lang="ts" setup>
import type { AutoFormControls, AutoFormFieldContext } from '#movk/types'
import type { z } from 'zod/v4'
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

const schema = afz.looseObject<State>()({
  nameValue: afz.string({
    if: true,
  }).meta({
    size: 'sm',
  }).optional(),
  visibleTest: afz.boolean(),
  dynamicLabel: afz.string({
    // hidden: ({ state }) => !state.visibleTest,
    controlProps: ({ state }) => ({
      icon: 'i-lucide-alarm-clock',
      color: state.nameValue ? 'success' : 'error',
    }),
  }).meta({
    label: ({ state }: AutoFormFieldContext<State>) => `动态字段: ${state.nameValue}`,
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
})

const formState = ref({

} as z.output<typeof schema>)
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        {{ formState }}
      </template>
      <MAutoForm v-model="formState" :schema="schema" class="space-y-4" :controls="customControls">
        <template #hint>
          <div>
            <h3 class="text-lg font-semibold">
              函数式 API
            </h3>
          </div>
        </template>
        <template #hint:nameValue>
          nameValue hint
        </template>
      </MAutoForm>
    </UCard>
  </div>
</template>
