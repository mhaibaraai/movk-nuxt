<script lang="tsx" setup>
import { UBadge } from '#components'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  $basicInfo: afz.layout({
    class: 'space-y-4',
    fields: {
      employmentStatus: afz.enum(['employed', 'unemployed', 'student', 'retired'], {
        type: 'selectMenu',
        controlProps: { placeholder: '请选择就业状态' }
      }).meta({ label: '就业状态' })
    }
  }),

  $employedInfo: afz.layout({
    class: 'space-y-4',
    fields: {
      $employedGrid: afz.layout({
        class: 'grid grid-cols-2 gap-4',
        fields: {
          companyName: afz.string().meta({
            label: '公司名称',
            hidden: ({ state }) => state.employmentStatus !== 'employed'
          }).optional(),
          jobTitle: afz.string().meta({
            label: '职位',
            hidden: ({ state }) => state.employmentStatus !== 'employed'
          }).optional()
        }
      }),
      salary: afz.number({ type: 'number', controlProps: { min: 0, step: 1000 } }).meta({
        label: '月薪(元)',
        hidden: ({ state }) => state.employmentStatus !== 'employed'
      }).optional(),
      needsFinancialAdvice: afz.boolean({ type: 'switch' }).default(false).meta({
        label: '需要理财建议',
        description: '月薪超过10000元时可选',
        hidden: ({ state }) => state.employmentStatus !== 'employed' || !state.salary || state.salary < 10000
      }).optional()
    }
  }),

  $studentInfo: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      school: afz.string().meta({
        label: '学校名称',
        hidden: ({ state }) => state.employmentStatus !== 'student'
      }).optional(),
      major: afz.string().meta({
        label: '专业',
        hidden: ({ state }) => state.employmentStatus !== 'student'
      }).optional()
    }
  }),

  retirementYear: afz.number({ type: 'number', controlProps: { min: 1950, max: 2024 } }).meta({
    label: '退休年份',
    hidden: ({ state }) => state.employmentStatus !== 'retired'
  }).optional(),

  $unemployedInfo: afz.layout({
    class: 'space-y-4',
    fields: {
      seekingJob: afz.boolean({ type: 'switch' }).default(false).meta({
        label: '正在求职',
        hidden: ({ state }) => state.employmentStatus !== 'unemployed'
      }).optional(),
      desiredPosition: afz.string().meta({
        label: '期望职位',
        hidden: ({ state }) => state.employmentStatus !== 'unemployed' || !state.seekingJob
      }).optional()
    }
  }),

  $familyInfo: afz.layout({
    class: 'space-y-4',
    fields: {
      hasFamily: afz.boolean({ type: 'switch' }).default(false).meta({
        label: '是否有家庭成员'
      }),
      familySize: afz.number({ type: 'number', controlProps: { min: 1, max: 10 } }).meta({
        label: '家庭成员数量',
        hidden: ({ state }) => !state.hasFamily
      }).optional(),
      familyMembers: afz.array(afz.string(), {
        type: 'inputTags',
        controlProps: { placeholder: '输入姓名后按回车添加' },
        controlSlots: ({ value }) => ({
          trailing: () => (
            <UBadge icon="i-lucide-users" color="primary" variant="subtle">
              {value?.length || 0}
            </UBadge>
          )
        })
      }).meta({
        label: '家庭成员姓名',
        hidden: ({ state }) => !state.hasFamily || !state.familySize || state.familySize <= 1
      }).optional()
    }
  }),

  $contactInfo: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      contactEmail: afz.email().meta({ label: '联系邮箱' }),
      contactPhone: afz.string().meta({ label: '联系电话(可选)' }).optional()
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
  <Navbar />
  <Matrix :form="form">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
