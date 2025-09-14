<script lang="ts" setup>
import type { z } from 'zod/v4'

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

const { afz, scope } = createAutoFormZ()
// const MockNumber = (_props: { aaa?: number }, _ctx: { slots?: { bbb?: () => void } }) => null

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
  nestedObject: s.path('nestedObject').looseObject({
    firstName: afz.string({
      props: {
        icon: 'i-mdi-account',
        class: 'w-md',
      },
    }).meta({
      label: '姓',
      help: '111',
      hint: '222',
    }).default('张'),
    lastName: afz.string({
      props: {
        icon: 'i-mdi-account',
      },
    }).default('三').meta({
      label: '名',
    }),
    userAge: afz.number().default(25),
    address: s.path('nestedObject', 'address').looseObject({
      province: afz.string().default('北京'),
      city: afz.string().default('北京'),
      district: afz.string().default('朝阳区'),
    }).optional(),
  }).meta({
    label: '用户信息',
  }).optional(),
})
</script>

<template>
  <div class="space-y-4 flex w-full">
    <UCard class="flex-1">
      <MAutoForm v-model="state" :schema="schema" class="space-y-4" />
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
