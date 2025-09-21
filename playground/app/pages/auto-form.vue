<script lang="ts" setup>
import type { AutoFormControls } from '#movk/types'
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

const schema = afz.object<State>()({
  // dynamicLabel: afz.string({
  //   if: ({ state }) => !state.visibleTest,
  // }),
  // nameValue: afz.string({
  //   // if: ({ state }) => state.visibleTest,
  //   // hidden: ({ state }) => !state.visibleTest,
  // }).meta({
  //   size: 'sm',
  // }).optional(),
  visibleTest: afz.boolean(),
  // dynamicLabel: afz.string({
  //   // hidden: ({ state }) => !state.visibleTest,
  //   controlProps: ({ state }) => ({
  //     icon: 'i-lucide-alarm-clock',
  //     color: state.nameValue ? 'success' : 'error',
  //   }),
  // }).meta({
  //   label: ({ state }: AutoFormFieldContext<State>) => `动态字段: ${state.nameValue}`,
  // }).optional(),
  nestedObject: afz.object<State['nestedObject']>()({
    firstName: afz.string({}).default('default name').optional(),
    lastName: afz.string().meta({
      label: ({ state }) => `动态字段: ${state.firstName}`,
    }),
  }),
})

const formState = ref({

} as z.output<typeof schema>)
</script>

<template>
  <div class="space-y-4 p-10">
    <UCard>
      <MAutoForm v-model="formState" :schema="schema" class="space-y-4" :controls="customControls">
        <template #after-fields="{ state }">
          <pre>{{ state }}</pre>
        </template>
        <template #description:visibleTest>
          visibleTest description
        </template>
        <template #hint:visibleTest="{ value, setValue }">
          nameValue hint: {{ value }}
          <UButton @click="setValue(true)">
            setValue
          </UButton>
        </template>
      </MAutoForm>
    </UCard>
    <!-- <UCard>
      <UAccordion :items="[{ label: 'nestedObject', name: 'nestedObject', slot: 'nestedObject' }]">
        <template #default="{ item }">
          <UFormField
            :label="item.label"
            :name="item.name"
            required
            help="help"
            hint="hint"
          />
        </template>
        <template #nestedObject>
          <UFormField label="province" name="province">
            <UInput v-model="formState.province" />
          </UFormField>
          <UFormField label="district" name="district">
            <UInput v-model="formState.district" />
          </UFormField>
        </template>
      </UAccordion>
    </UCard> -->
  </div>
</template>
