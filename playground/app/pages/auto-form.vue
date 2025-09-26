<script lang="ts" setup>
import type { AutoFormControls } from '#movk/types'
import type { FormError, FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
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
    portify: {
      name: string
      age: number
    }
  }
}

const customControls = {
  test: createAutoFormControl({ component: UInputNumber }),
} as const satisfies AutoFormControls

const { afz } = createAutoFormZ(customControls)

const schema = afz.object<State>()({
  // visibleTest: afz.boolean(),
  mixedDescription: afz.string({
    // error: 'error',
    controlProps: ({ state }) => ({
      color: state.mixedDescription === '1' ? 'error' : 'success',
    }),
  }).readonly().meta({
    // label(ctx) {
    //   return `meta: ${ctx.state.mixedDescription}`
    // },
  }),
  // nestedObject: afz.object<State['nestedObject']>()({
  //   firstName: afz.string().default('default name').optional(),
  //   lastName: afz.string().meta({
  //     label: ({ state }) => `动态字段: ${state.nestedObject?.firstName}`,
  //     required: ({ state }) => state.visibleTest,
  //   }),
  //   // userAge: afz.number(),
  //   portify: afz.object<State['nestedObject']['portify']>()({
  //     name: afz.string(),
  //     age: afz.number(),
  //   }),
  // }).optional().meta({
  //   label: '用户信息',
  // }),
  // nameValue: z.string('Password is required').min(8, 'Must be at least 8 characters'),
})

type Schema = z.output<typeof schema>

const formState = ref({

} as Schema)

// function validate(state: Partial<Schema>): FormError[] {
//   const errors = []
//   if (!state.mixedDescription)
//     errors.push({ name: 'mixedDescription', message: '2222' })
//   return errors
// }

function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event)
}

function onError(event: FormErrorEvent) {
  console.log(event)
}
</script>

<template>
  <div class="space-y-4 p-10">
    <UCard>
      <MAutoForm
        v-model="formState"
        :global-meta="{
          size: 'xs',
          required(ctx) {
            return ctx.state.mixedDescription === '1'
          },
          label({ path }) {
            return `动态字段: ${path}`
          },
        }"
        :schema="schema"
        :controls="customControls"
        @submit="onSubmit"
        @error="onError"
      >
        <template #after-fields="{ state }">
          <UCard>
            <template #header>
              <h3>表单状态</h3>
            </template>
            <pre>{{ state }}</pre>
          </UCard>
        </template>
        <!-- <template #hint:nestedObject>
          测试图标
        </template> -->
        <!-- <template #[`label:nestedObject.portify`]="{ open }">
          {{ open }} 1
        </template> -->
      </MAutoForm>
    </UCard>
  </div>
</template>
