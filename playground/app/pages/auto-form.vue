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

const state = ref({} as z.input<typeof schema>)
const s = scope<State>()

const schema = computed(() => s.looseObject({
  test: afz.number().optional(),
  test2: afz.number().meta({
    required: false,
  }),
  visibleTest: afz.number({
    component: UInputNumber,
  }),
  // nameValue: afz.string({
  //   component: Login,
  // }),
  dynamicField: afz.string({
    type: 'test',
    if: ({ state }) => state.visibleTest > 3,
  }).meta({
    label: '动态字段',
    // description: ctx => `路径: ${ctx.path}`,
    help: ({ value }) => `值长度: ${(value || '').length}`,
    required: ({ value }) => ((value || '').length < 3),
  }),
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
      <MAutoForm v-model="state" :schema="schema" class="space-y-4" :controls="customControls" />
    </UCard>
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">
          当前State值
        </h2>
      </template>
      <pre class="text-sm">{{ JSON.stringify(state, null, 2) }}</pre>
    </UCard>
  </div>
</template>
