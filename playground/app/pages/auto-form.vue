<script lang="ts" setup>
import type { AutoFormControls } from '#movk/types'
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

const state = ref<Partial<State>>({})
const s = scope<State>()

// 使用computed包装schema以支持响应式
const schema = computed(() => s.looseObject({
  nameValue: afz.string({
    props: {
      icon: 'i-mdi-account',
      color: 'warning',
      class: 'w-md',
    },
  }).meta({
    label: '这是从zod.describe()来的描述',
    description: '测试描述',
  }).default('默认值'),

  visibleTest: afz.number({
    type: 'test',
    show: isVisible.value, // 现在这个会响应式更新
  }).meta({
    label: '显示的测试字段',
  }).optional(),

  hiddenTest: afz.number().meta({
    label: state.value.nameValue || '默认标签', // 现在这个会响应式更新
  }).optional(),
}))

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
