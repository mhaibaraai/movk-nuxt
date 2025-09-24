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
  visibleTest: afz.boolean(),
  nestedObject: afz.object<State['nestedObject']>()({
    firstName: afz.string().default('default name').optional(),
    lastName: afz.string().meta({
      label: ({ state }) => `动态字段: ${state.nestedObject?.firstName}`,
      required: ({ state }) => state.visibleTest,
      hidden: ({ state }) => state.visibleTest,
    }),
    userAge: afz.number(),
    address: afz.object<State['nestedObject']['address']>()({
      province: afz.string(),
      city: afz.string(),
      district: afz.string(),
    }),
  }).optional().meta({
    hidden: ({ state }) => state.visibleTest, // 不生效
    label: '用户信息',
  }),
  nameValue: afz.string().meta({
    // if: ({ state }) => state.visibleTest,
  }),
})

const formState = ref({

} as z.output<typeof schema>)
</script>

<template>
  <div class="space-y-4 p-10">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">
          UAccordion 包装功能测试
        </h2>
        <p class="text-sm text-gray-600">
          启用 accordion 配置后，对象字段会自动包装在折叠面板中
        </p>
      </template>
      <MAutoForm
        v-model="formState"
        :schema="schema"
        class="space-y-4"
        :controls="customControls"
        :accordion="{
          enabled: true,
        }"
      >
        <template #after-fields="{ state }">
          <UCard>
            <template #header>
              <h3>表单状态</h3>
            </template>
            <pre>{{ state }}</pre>
          </UCard>
        </template>
        <template>
          22
        </template>
        <!-- <template #description:visibleTest>
          visibleTest description
        </template>
        <template #hint:visibleTest="{ value, setValue }">
          nameValue hint: {{ value }}
          <UButton @click="setValue(true)">
            setValue
          </UButton>
        </template> -->
      </MAutoForm>
    </UCard>

    <!-- 对比：不使用 UAccordion 的普通表单 -->
    <!-- <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">
          普通表单（无 UAccordion）
        </h2>
        <p class="text-sm text-gray-600">
          相同的 schema 但未启用 accordion 配置
        </p>
      </template>
      <MAutoForm v-model="formState" :schema="schema" class="space-y-4" :controls="customControls">
        <template #after-fields="{ state }">
          <UCard>
            <template #header>
              <h3>表单状态</h3>
            </template>
            <pre>{{ state }}</pre>
          </UCard>
        </template>
      </MAutoForm>
    </UCard> -->
  </div>
</template>
