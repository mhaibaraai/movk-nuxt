<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'
import { UTabs } from '#components'

const { afz } = useAutoForm()
const toast = useToast()

const tabsSchema = afz.object({
  userType: afz.enum(['personal', 'company']).meta({ label: '用户类型' }),
  $tabs: afz.layout({
    component: UTabs,
    props: ({ state }) => {
      const isCompany = state?.userType === 'company'
      return {
        ui: {
          content: 'space-y-4'
        },
        items: isCompany
          ? [
              { label: '公司信息', icon: 'i-lucide-building', slot: 'tab-0' },
              { label: '联系方式', icon: 'i-lucide-phone', slot: 'tab-1' },
              { label: '认证信息', icon: 'i-lucide-shield-check', slot: 'tab-2' }
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
          companyCode: 'tab-0',
          phone: 'tab-1',
          address: 'tab-1',
          license: 'tab-2'
        }
      }
      return {
        username: 'tab-0',
        age: 'tab-0',
        phone: 'tab-1',
        address: 'tab-1'
      }
    },
    fields: {
      username: afz.string().meta({ label: '姓名', if: ({ state }) => state?.userType === 'personal' }).optional(),
      age: afz.number().meta({ label: '年龄', if: ({ state }) => state?.userType === 'personal' }).optional(),
      companyName: afz.string().meta({ label: '公司名称', if: ({ state }) => state?.userType === 'company' }).optional(),
      companyCode: afz.string().meta({ label: '统一社会信用代码', if: ({ state }) => state?.userType === 'company' }).optional(),
      license: afz.file().meta({ label: '营业执照', if: ({ state }) => state?.userType === 'company' }).optional(),
      phone: afz.string().meta({ label: '联系电话' }),
      address: afz.string().meta({ label: '地址', type: 'textarea' }).optional()
    }
  })
})

type TabsSchema = z.output<typeof tabsSchema>

const form = ref<Partial<TabsSchema>>({ userType: 'personal' })

async function onSubmit(event: FormSubmitEvent<TabsSchema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <Matrix :form="form">
    <MAutoForm :schema="tabsSchema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
