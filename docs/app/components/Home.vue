<script lang="ts" setup>
import { CalendarDate } from '@internationalized/date'
import type { TabsItem } from '@nuxt/ui'
import type z from 'zod'

const items = [{
  label: 'AutoForm',
  icon: 'i-lucide-square-pen',
  slot: 'autoform'
}, {
  label: '组件',
  icon: 'i-lucide-layout-grid',
  slot: 'components'
}, {
  label: '输入增强',
  icon: 'i-lucide-sparkles',
  slot: 'enhanced'
}] satisfies TabsItem[]

const { afz } = useAutoForm()
const formatter = useDateFormatter()
const formSchema = afz.object({
  $personalInfo: afz.layout({
    class: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    fields: {
      username: afz.string('请填写用户名').min(3).max(20).regex(/^\w+$/)
        .meta({ hint: '仅支持字母、数字和下划线' }),
      age: afz.number().min(18, '年龄必须大于 18 岁').max(99)
        .meta({ hint: '年龄范围：18-99' }),
      role: afz.enum(['管理员', '编辑', '访客'] as const)
        .meta({ label: '角色', placeholder: '选择角色' })
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
        .meta({ hint: '出生日期' })
    }
  })
})

type Schema = z.output<typeof formSchema>

const formState = ref<Partial<Schema>>({
  username: 'johndoe',
  email: 'john@example.com',
  age: 25,
  role: '编辑'
})

const rating = ref(3.5)
const verified = ref(false)

const copyText = ref('Hello Movk Nuxt!')
const passwordText = ref('secret123')
const clearText = ref('可清除的内容')
const limitText = ref('')
</script>

<template>
  <UCard class="w-full max-w-2xl mx-auto shadow-lg">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold">
          交互式演示
        </h2>
        <UBadge color="primary" variant="subtle" size="xs">
          Live Demo
        </UBadge>
      </div>
    </template>

    <UTabs :items="items" class="w-full">
      <template #autoform>
        <div class="p-4 sm:p-6 min-h-75">
          <p class="mb-5 text-sm text-muted">
            通过 Zod Schema 自动生成表单，支持丰富的字段类型和验证规则
          </p>
          <MAutoForm :schema="formSchema" :state="formState" :submit-button="false" />
        </div>
      </template>

      <template #components>
        <div class="p-4 sm:p-6 min-h-75 space-y-2">
          <div class="rounded-xl border border-default bg-elevated p-4">
            <div class="flex items-start justify-between mb-4">
              <div>
                <p class="text-sm font-medium">
                  评分组件
                </p>
                <p class="text-xs text-muted mt-0.5">
                  半星支持 · 键盘导航 · 可清除
                </p>
              </div>
              <UBadge variant="outline" size="xs" class="font-mono">
                MStarRating
              </UBadge>
            </div>
            <MStarRating v-model="rating" :allow-half="true" :show-badge="true" size="lg" />
          </div>

          <div class="rounded-xl border border-default bg-elevated p-4">
            <div class="flex items-start justify-between mb-4">
              <div>
                <p class="text-sm font-medium">
                  滑动验证
                </p>
                <p class="text-xs text-muted mt-0.5">
                  Motion.js 动画 · 可配置阈值
                </p>
              </div>
              <UBadge variant="outline" size="xs" class="font-mono">
                MSlideVerify
              </UBadge>
            </div>
            <MSlideVerify v-model="verified" @success="verified = true" />
          </div>
        </div>
      </template>

      <template #enhanced>
        <div class="p-4 sm:p-6 min-h-75">
          <p class="mb-4 text-sm text-muted">
            输入框增强组件，为常见需求提供开箱即用的解决方案
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-default bg-elevated p-3 space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium flex items-center gap-1.5">
                  <UIcon name="i-lucide-copy" class="text-primary-500 size-3.5" />
                  带复制功能
                </p>
                <UBadge variant="outline" size="xs" class="font-mono text-[10px]">
                  WithCopy
                </UBadge>
              </div>
              <MWithCopy v-model="copyText" placeholder="点击图标复制" />
            </div>

            <div class="rounded-xl border border-default bg-elevated p-3 space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium flex items-center gap-1.5">
                  <UIcon name="i-lucide-lock" class="text-primary-500 size-3.5" />
                  密码输入框
                </p>
                <UBadge variant="outline" size="xs" class="font-mono text-[10px]">
                  WithPasswordToggle
                </UBadge>
              </div>
              <MWithPasswordToggle v-model="passwordText" placeholder="输入密码..." />
            </div>

            <div class="rounded-xl border border-default bg-elevated p-3 space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium flex items-center gap-1.5">
                  <UIcon name="i-lucide-x-circle" class="text-primary-500 size-3.5" />
                  带清除功能
                </p>
                <UBadge variant="outline" size="xs" class="font-mono text-[10px]">
                  WithClear
                </UBadge>
              </div>
              <MWithClear v-model="clearText" placeholder="点击图标清除" />
            </div>

            <div class="rounded-xl border border-default bg-elevated p-3 space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium flex items-center gap-1.5">
                  <UIcon name="i-lucide-type" class="text-primary-500 size-3.5" />
                  字符计数
                </p>
                <UBadge variant="outline" size="xs" class="font-mono text-[10px]">
                  WithCharacterLimit
                </UBadge>
              </div>
              <MWithCharacterLimit v-model="limitText" :max-length="30" placeholder="最多 30 个字符" />
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </UCard>
</template>
