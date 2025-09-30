<script lang="ts" setup>
import type { AutoFormControls } from '#movk/types'
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
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
  nameValue: afz.string({
    controlProps: ({ value }) => ({
      placeholder: `请输入姓名${value}`,
      class: 'w-100px',
      icon: 'i-lucide-user',
    }),
  }).min(2).meta({
    hidden: ({ state }) => state.visibleTest,
    label: ({ value }) => `${value} 姓名`,
  }).nonempty().default('张三').optional(),
})

onMounted(async () => {
  // await sleep(5000)
  // schema.value = afz.object({
  //   test: afz.number().meta({ label: '测试自定义控件' }).default(123),
  // })
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
      <MAutoForm v-model="formState" :schema="schema" :controls="customControls" @submit="onSubmit" @error="onError">
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
