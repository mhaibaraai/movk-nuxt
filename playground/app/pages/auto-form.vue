<script lang="ts" setup>
import type { AutoFormControls, FieldContext } from '#movk/types'
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

const state = ref({} as z.input<typeof schema>)
const s = scope<State>()

const showAdvanced = ref(false)

// const computedSchema = computed(() => {
//   const base = {
//     basicField: afz.string().meta({
//       label: '基础字段',
//       description: '这是一个基础字段',
//     }).optional(),
//   }

//   if (showAdvanced.value) {
//     return s.looseObject({
//       ...base,
//       advancedField1: afz.string().meta({
//         label: '高级字段1',
//         help: '只在高级模式下显示',
//       }).optional(),
//       advancedField2: afz.number().meta({
//         label: '高级字段2',
//         description: '高级配置项',
//       }).optional(),
//     })
//   }

//   return s.looseObject(base)
// })

// 使用函数式 API
const schema = s.looseObject({
  // nameValue: afz.string({
  //   props: {
  //     icon: 'i-lucide-user',
  //     color: 'warning',
  //     class: 'w-md',
  //   },
  // }).meta({
  //   label: (ctx: FieldContext) => `名称 (当前值: ${ctx.value || '未设置'})`,
  //   description: '测试描述',
  // }).default('默认值'),

  // visibleTest: afz.number({
  //   type: 'test',
  //   hidden: () => !isVisible.value, // 函数式响应式
  // }).meta({
  //   label: '显示的测试字段',
  //   required: () => isVisible.value,
  // }).optional(),

  // hiddenTest: afz.number().meta({
  //   label: (ctx: FieldContext) => ctx.state.nameValue || '默认标签', // 函数式动态标签
  //   hint: () => `当前状态: ${isVisible.value ? '可见' : '隐藏'}`,
  // }).optional(),

  dynamicField: afz.string().meta({
    label: '动态字段',
    // description: (ctx: FieldContext) => `路径: ${ctx.path}`,
    help: (ctx: FieldContext) => `值长度: ${(ctx.value || '').length}`,
    required: (ctx: FieldContext) => ((ctx.value || '').length < 3),
  }),
})

function toggleVisible() {
  isVisible.value = !isVisible.value
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <UButton @click="toggleVisible">
        切换显示 {{ isVisible }}
      </UButton>
      <UButton variant="outline" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? '隐藏' : '显示' }}高级选项
      </UButton>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <!-- 函数式 API 示例 -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            函数式 API
          </h3>
        </template>
        <MAutoForm v-model="state" :schema="schema" class="space-y-4" :controls="customControls" />
      </UCard>

      <!-- Computed Schema 示例 -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            Computed Schema
          </h3>
        </template>
        <!-- <MAutoForm v-model="state" :schema="computedSchema" class="space-y-4" /> -->
      </UCard>
    </div>

    <!-- 状态显示 -->
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
