<script lang="ts" setup>
import { CalendarDate } from '@internationalized/date'
import type { TabsItem } from '@nuxt/ui'
import type z from 'zod/v4'
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
const formSchema = afz.object({
  username: afz.string('请填写用户名').min(3).max(20).regex(/^\w+$/)
    .meta({ hint: '仅支持字母、数字和下划线' }),
  email: afz.email({
    controlProps: { leadingIcon: 'i-lucide-mail', placeholder: '请输入您的邮箱' },
    error: '请输入有效的邮箱地址'
  }),
  age: afz.number().min(18, '年龄必须大于 18 岁').max(99)
    .meta({ hint: '年龄范围：18-99' })
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
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          交互式演示
        </h3>
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
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-calendar" class="text-primary-500 shrink-0" />
                <div class="min-w-0">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    单日期选择
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">
                    选择单个日期
                  </div>
                </div>
              </div>
              <MDatePicker v-model="selectedDate" label-format="iso" />
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-calendar-range" class="text-primary-500 shrink-0" />
                <div class="min-w-0">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    日期范围选择
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">
                    选择开始和结束日期
                  </div>
                </div>
              </div>
              <MDatePicker
                v-model="dateRange"
                label-format="iso"
                range
                :number-of-months="2"
              />
            </div>
          </div>
        </div>
      </template>

      <template #enhanced>
        <div class="p-4 sm:p-6 min-h-[300px]">
          <p class="mb-5 text-sm text-gray-600 dark:text-gray-400">
            输入框增强组件，为常见需求提供开箱即用的解决方案
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-copy" class="text-primary-500 shrink-0" />
                <div class="min-w-0">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    带复制功能
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">
                    一键复制输入框内容
                  </div>
                </div>
              </div>
              <MWithCopy v-model="copyText" placeholder="点击图标复制内容" />
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-eye" class="text-primary-500 shrink-0" />
                <div class="min-w-0">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    密码显隐切换
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">
                    点击图标切换密码显示
                  </div>
                </div>
              </div>
              <MWithPasswordToggle v-model="passwordText" placeholder="输入密码..." />
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </UCard>
</template>
