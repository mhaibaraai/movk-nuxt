<script lang="ts" setup>
import { CalendarDate } from '@internationalized/date'
import type { TabsItem } from '@nuxt/ui'
import type z from 'zod'
import type { DateRange } from 'reka-ui'

const items = [{
  label: 'AutoForm',
  icon: 'i-lucide-square-pen',
  slot: 'autoform'
}, {
  label: 'DatePicker',
  icon: 'i-lucide-calendar',
  slot: 'datepicker'
}, {
  label: '输入增强',
  icon: 'i-lucide-sparkles',
  slot: 'enhanced'
}] satisfies TabsItem[]

// AutoForm Demo
const { afz } = useAutoForm()
const formatter = useDateFormatter()
const formSchema = afz.object({
  $personalInfo: afz.layout({
    class: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    fields: {
      username: afz.string('请填写用户名').min(3).max(20).regex(/^\w+$/)
        .meta({ hint: '仅支持字母、数字和下划线' }),
      age: afz.number().min(18, '年龄必须大于 18 岁').max(99)
        .meta({ hint: '年龄范围：18-99' })
    }
  }),
  $contactInfo: afz.layout({
    class: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    fields: {
      email: afz.email({
        controlProps: { leadingIcon: 'i-lucide-mail', placeholder: '请输入您的邮箱' },
        error: '请输入有效的邮箱地址'
      }),
      birthDate: afz.calendarDate()
        .transform(date => formatter.convertToISO(date))
        .default(new CalendarDate(1990, 1, 1))
        .meta({
          hint: '出生日期'
        })
    }
  })
})

type Schema = z.output<typeof formSchema>

const formState = ref<Partial<Schema>>({
  username: 'johndoe',
  email: 'john@example.com',
  age: 25
})

// DatePicker Demo
const selectedDate = shallowRef(new CalendarDate(2025, 12, 25))
const dateRange = shallowRef<DateRange>({
  start: new CalendarDate(2025, 11, 1),
  end: new CalendarDate(2025, 11, 30)
})

// Enhanced Input Demo
const copyText = ref('Hello Movk Nuxt!')
const passwordText = ref('secret123')
</script>

<template>
  <UCard class="w-full max-w-2xl mx-auto shadow-lg ring-1 ring-gray-200 dark:ring-gray-800">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          交互式演示
        </h2>
        <UBadge color="primary" variant="subtle" size="xs">
          Live Demo
        </UBadge>
      </div>
    </template>

    <UTabs :items="items" class="w-full">
      <template #autoform>
        <div class="p-4 sm:p-6 min-h-[300px]">
          <p class="mb-5 text-sm text-gray-600 dark:text-gray-400">
            通过 Zod Schema 自动生成表单，支持丰富的字段类型和验证规则
          </p>
          <MAutoForm :schema="formSchema" :state="formState" :submit-button="false" />
        </div>
      </template>

      <template #datepicker>
        <div class="p-4 sm:p-6 min-h-[300px]">
          <p class="mb-5 text-sm text-gray-600 dark:text-gray-400">
            强大的日期选择器，支持单日期和日期范围选择
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <UFormField>
              <template #label>
                <UIcon name="i-lucide-calendar" class="text-primary-500" />
                单日期选择
              </template>
              <MDatePicker v-model="selectedDate" label-format="iso" />
            </UFormField>

            <UFormField>
              <template #label>
                <UIcon name="i-lucide-calendar-range" class="text-primary-500" />
                日期范围选择
              </template>
              <MDatePicker
                v-model="dateRange"
                label-format="iso"
                range
                :number-of-months="2"
              />
            </UFormField>
          </div>
        </div>
      </template>

      <template #enhanced>
        <div class="p-4 sm:p-6 min-h-[300px]">
          <p class="mb-5 text-sm text-gray-600 dark:text-gray-400">
            输入框增强组件，为常见需求提供开箱即用的解决方案
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <UFormField>
              <template #label>
                <UIcon name="i-lucide-copy" class="text-primary-500" />
                带复制功能
              </template>
              <MWithCopy v-model="copyText" placeholder="点击图标复制内容" />
            </UFormField>

            <UFormField>
              <template #label>
                <UIcon name="i-lucide-lock" class="text-primary-500" />
                密码输入框
              </template>
              <MWithPasswordToggle v-model="passwordText" placeholder="输入密码..." />
            </UFormField>
          </div>
        </div>
      </template>
    </UTabs>
  </UCard>
</template>
