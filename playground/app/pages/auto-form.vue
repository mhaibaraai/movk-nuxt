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
  }
}

const { afz, objectOf } = createAutoFormZ<State>()
// const MockNumber = (_props: { aaa?: number }, _ctx: { slots?: { bbb?: () => void } }) => null

// 测试所有zod配置功能
const schema = objectOf()({
  // nameValue: afz.string().describe('这是从zod.describe()来的描述'),

  // dynamicLabel: afz.string().meta({
  //   type: 'file',
  //   label: state => `动态标签: ${state.nameValue}`,
  //   description: '测试描述',
  //   controlProps: {

  //   },
  // }).optional(),

  // mixedDescription: z.number().describe('zod describe').meta({
  //   description: 'meta description 优先级更高',
  // }).optional(),

  // requiredField: z.string(),
  // optionalField: z.string().optional(),

  // withDefault: z.boolean().default(true),
  stringWithDefault: afz.string({

  }).default(`默认字符串`).meta({
    help: '111',
  }),

  // enumField: z.enum(['选项1', '选项2', '选项3']).meta({ label: '枚举选择' }),

  // conditionalRequired: z.string().meta({
  //   required: true,
  //   label: '条件必填',
  // }).optional(),

  // nestedObject: z.object({
  //   firstName: z.string().default('张'),
  //   lastName: z.string().default('三'),
  //   userAge: z.number().default(25),
  // }).describe('用户信息'),
})

const state = ref<Partial<z.infer<typeof schema>>>({})
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
