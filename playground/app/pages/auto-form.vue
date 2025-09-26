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
  visibleTest: afz.boolean().meta({
    size: 'lg',
  }),
  nestedObject: afz.object<State['nestedObject']>()({
    firstName: afz.string().default('default name').optional(),
    lastName: afz.string().meta({
      label: ({ state }) => `动态字段: ${state.nestedObject?.firstName}`,
      required: ({ state }) => state.visibleTest,
    }),
    // userAge: afz.number(),
    // address: afz.object<State['nestedObject']['address']>()({
    //   province: afz.string(),
    //   city: afz.string(),
    //   district: afz.string(),
    // }).meta({
    //   label: '地址',
    //   icon: 'i-lucide-map-pin',
    // }),
    portify: afz.object<State['nestedObject']['portify']>()({
      name: afz.string(),
      age: afz.number(),
    }),
  }).optional().meta({
    label: '用户信息',
    hidden: ({ state }) => state.visibleTest,
    hint: '测试图标',
    collapsible: {
      defaultOpen: true,
      ui: {
        content: 'space-y-4',
      },
    },
  }),
  // nameValue: afz.string(),
})

const formState = ref({

} as z.output<typeof schema>)
</script>

<template>
  <div class="space-y-4 p-10">
    <UCard>
      <MAutoForm
        v-model="formState"
        :global-meta="{
          size: 'xs',
        }"
        :schema="schema"
        class="space-y-4"
        :controls="customControls"
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
        <template #[`label:nestedObject.portify`]="{ open }">
          {{ open }} 1
        </template>
      </MAutoForm>
    </UCard>
  </div>
</template>
