<script setup lang="ts">
import { UTabs } from '#components'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  userType: afz.enum(['personal', 'company'])
    .default('personal')
    .meta({ label: '用户类型' }),

  $tabs: afz.layout({
    component: UTabs,
    props: ({ state }) => {
      const isCompany = state?.userType === 'company'
      return {
        ui: { content: 'space-y-4' },
        items: isCompany
          ? [
              { label: '公司信息', icon: 'i-lucide-building', slot: 'tab-0' },
              { label: '联系方式', icon: 'i-lucide-phone', slot: 'tab-1' }
            ]
          : [
              { label: '个人信息', icon: 'i-lucide-user', slot: 'tab-0' },
              { label: '联系方式', icon: 'i-lucide-phone', slot: 'tab-1' }
            ]
      }
    },
    fieldSlots: ({ state }) => {
      if (state?.userType === 'company') {
        return {
          companyName: 'tab-0',
          registrationNumber: 'tab-0',
          phone: 'tab-1',
          email: 'tab-1',
          address: 'tab-1'
        }
      }
      return {
        username: 'tab-0',
        age: 'tab-0',
        phone: 'tab-1',
        email: 'tab-1',
        address: 'tab-1'
      }
    },
    fields: {
      username: afz.string().meta({
        label: '姓名',
        if: ({ state }) => state?.userType === 'personal'
      }).optional(),
      age: afz.number().int().min(0).meta({
        label: '年龄',
        if: ({ state }) => state?.userType === 'personal'
      }).optional(),
      companyName: afz.string().meta({
        label: '公司名称',
        if: ({ state }) => state?.userType === 'company'
      }).optional(),
      registrationNumber: afz.string().meta({
        label: '注册号',
        if: ({ state }) => state?.userType === 'company'
      }).optional(),
      phone: afz.string().meta({ label: '联系电话' }),
      email: afz.email().meta({ label: '邮箱地址' }),
      address: afz.string().meta({ label: '地址' })
    }
  })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <UCard>
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </UCard>
</template>
