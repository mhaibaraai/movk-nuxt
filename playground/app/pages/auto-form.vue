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

const { afz, scope } = createAutoFormZ(customControls)
const isVisible = ref(true)

const state = ref<z.input<typeof schema>>({})
const s = scope<State>()
const schema = s.looseObject({
  // nameValue: afz.string({
  //   props: {
  //     icon: 'i-mdi-account',
  //     color: 'warning',
  //     class: 'w-md',
  //   },
  // }).meta({
  //   label: '这是从zod.describe()来的描述',
  //   description: '测试描述',
  // }).optional(),
  // nestedObject: s.path('nestedObject').looseObject({
  //   firstName: afz.string({
  //     props: {
  //       icon: 'i-mdi-account',
  //       class: 'w-md',
  //     },
  //   }).meta({
  //     label: '姓',
  //     help: '111',
  //     hint: '222',
  //   }).default('张'),
  //   lastName: afz.string({
  //     props: {
  //       icon: 'i-mdi-account',
  //     },
  //   }).default('三').meta({
  //     label: '名',
  //   }),
  //   userAge: afz.number().default(25),
  //   address: s.path('nestedObject', 'address').looseObject({
  //     province: afz.string().default('北京'),
  //     city: afz.string().default('北京'),
  //     district: afz.string().default('朝阳区'),
  //   }).optional(),
  // }).meta({
  //   label: '用户信息',
  // }).optional(),
  visibleTest: afz.number({
    type: 'test',
    show: isVisible.value,
  }).meta({
    label: '显示的测试字段',
  }),
  hiddenTest: afz.number({
    type: 'test',
    if: false,
  }).meta({
    label: '隐藏的测试字段',
  }),
})

function toggleVisible() {
  isVisible.value = !isVisible.value
}
</script>

<template>
  <UButton @click="toggleVisible">
    切换显示 {{ isVisible }}
  </UButton>
  <div class="space-y-4 flex w-full">
    <UCard class="flex-1">
      <MAutoForm v-model="state" :schema="schema" class="space-y-4" :controls="customControls" />
    </UCard>

    <UCard class="flex-1">
      <template #header>
        <h2 class="text-lg font-semibold">
          当前State值
        </h2>
      </template>
      <pre class="text-sm">{{ JSON.stringify(state, null, 2) }}</pre>
    </UCard>
  </div>
</template>
