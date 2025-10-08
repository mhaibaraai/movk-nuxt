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
  tags: afz.array(afz.string().meta({ label: ({ count }) => `标签 ${count! + 1}` })).default(['2']).meta({
    // label: '',
    // collapsible: {
    //   defaultOpen: true,
    // },
  }),
  // scores: afz.array(afz.object({
  //   subject: afz.string().meta({ label: '科目' }).default(''),
  //   score: afz.number().meta({ label: '分数' }).default(0),
  //   objects: afz.object({
  //     name: afz.string().meta({ label: '名称' }).default(''),
  //     value: afz.number().meta({ label: '值' }).default(0),
  //   }).meta({ label: '对象' }),
  // })).meta({ label: '成绩' }),
  // visibleTest: afz.boolean(),
  // nameValue: afz.string().meta({
  //   if: ({ state }) => state.visibleTest,
  //   label: '动态标签',
  //   description: '标签根据输入值变化',
  // }).default(''),
  // nestedObject: afz.object({
  //   firstName: afz.string().meta({ label: '名字' }).default(''),
  //   lastName: afz.string().meta({ label: '姓氏' }).default(''),
  // }).meta({
  //   if: ({ state }) => state.visibleTest,
  //   label: '姓名',
  // }).default({ firstName: '', lastName: '' }).optional(),
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
      <MAutoForm
        v-model="formState"
        :schema="schema"
        :controls="customControls"
        @submit="onSubmit"
        @error="onError"
      >
        <template #footer="{ state }">
          <UCard>
            <template #header>
              <h3>表单状态</h3>
            </template>
            <pre>{{ state }}</pre>
          </UCard>
        </template>
      </MAutoForm>
    </UCard>
  </div>
</template>
