<script lang="ts" setup>
import type { DateValue } from '@internationalized/date'
import type { TabsItem } from '@nuxt/ui'
import type z from 'zod'

const items = [{
  label: 'AutoForm',
  icon: 'i-lucide-square-pen',
  slot: 'autoform'
}, {
  label: 'UI 组件',
  icon: 'i-lucide-layout-grid',
  slot: 'components'
}, {
  label: '输入增强',
  icon: 'i-lucide-sparkles',
  slot: 'enhanced'
}] satisfies TabsItem[]

const { afz } = useAutoForm()

const formSchema = afz.object({
  $personalInfo: afz.layout({
    class: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    fields: {
      username: afz.string('请填写用户名').min(3).max(20).regex(/^\w+$/)
        .meta({ hint: '仅支持字母、数字和下划线' }),
      age: afz.number().min(18, '年龄必须大于 18 岁').max(99)
        .meta({ hint: '年龄范围：18-99' }),
      role: afz.enum(['管理员', '编辑', '访客'] as const)
        .meta({ label: '角色', placeholder: '选择角色' }),
      email: afz.email({
        controlProps: { leadingIcon: 'i-lucide-mail', placeholder: '请输入您的邮箱' },
        error: '请输入有效的邮箱地址'
      })
    }
  }),
  $preferences: afz.layout({
    class: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    fields: {
      adminScope: afz.enum(['全局', '部门', '项目'] as const).meta({
        label: '管理范围',
        if: ({ state }) => state?.role === '管理员'
      }).optional(),
      notifications: afz.boolean({ type: 'switch' }).default(true)
        .meta({ label: '接收通知', hint: '开启后接收系统消息' }),
      rating: afz.number({ type: 'starRating', controlProps: { allowHalf: true } })
        .min(0).max(5).default(4)
        .meta({ label: '满意度评分' }),
      interests: afz.array(afz.string(), { type: 'inputTags' })
        .default(['Vue', 'Nuxt'])
        .meta({ label: '兴趣标签', hint: '按 Enter 添加', class: 'sm:col-span-2' })
    }
  })
})

type Schema = z.output<typeof formSchema>

const formState = ref<Partial<Schema>>({
  username: 'johndoe',
  email: 'john@example.com',
  age: 25,
  role: '编辑',
  notifications: true,
  rating: 4,
  interests: ['Vue', 'Nuxt']
})

const pickedDate = ref<DateValue | undefined>()
const color = ref('#3B82F6')
const verified = ref(false)

const copyText = ref('Hello Movk Nuxt!')
const passwordText = ref('secret123')
const clearText = ref('可清除的内容')
const limitText = ref('')
const floatingText = ref('')
const phoneText = ref('')
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
        <div class="p-4 sm:p-6 h-90 overflow-y-auto">
          <MAutoForm :schema="formSchema" :state="formState" :submit-button="false" />
        </div>
      </template>

      <template #components>
        <div class="p-4 sm:p-6 h-90 overflow-y-auto space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium">
                  日期选择器
                </p>
                <UBadge variant="outline" size="xs" class="font-mono text-[10px]">
                  MDatePicker
                </UBadge>
              </div>
              <p class="text-xs text-muted mb-3">
                日期 / 范围 / 多选 · 多种格式输出
              </p>
              <MDatePicker v-model="pickedDate" />
            </div>

            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium">
                  颜色选择器
                </p>
                <UBadge variant="outline" size="xs" class="font-mono text-[10px]">
                  MColorChooser
                </UBadge>
              </div>
              <p class="text-xs text-muted mb-3">
                RGB · HEX · HSL · Popover 触发
              </p>
              <div class="flex items-center gap-3">
                <MColorChooser v-model="color" />
                <code class="text-xs text-muted">{{ color }}</code>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-default bg-elevated p-4">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium">
                滑动验证
              </p>
              <UBadge variant="outline" size="xs" class="font-mono text-[10px]">
                MSlideVerify
              </UBadge>
            </div>
            <p class="text-xs text-muted mb-3">
              Motion.js 流畅动画 · 可配置验证阈值
            </p>
            <MSlideVerify v-model="verified" @success="verified = true" />
          </div>
        </div>
      </template>

      <template #enhanced>
        <div class="p-4 sm:p-6 h-90 overflow-y-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
            <div class="rounded-xl border border-default bg-elevated p-3 space-y-2.5">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium">
                  带复制功能
                </p>
                <UBadge variant="soft" size="xs" class="font-mono text-[10px]">
                  WithCopy
                </UBadge>
              </div>
              <MWithCopy v-model="copyText" />
            </div>

            <div class="rounded-xl border border-default bg-elevated p-3 space-y-2.5">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium">
                  密码切换
                </p>
                <UBadge variant="soft" size="xs" class="font-mono text-[10px]">
                  WithPasswordToggle
                </UBadge>
              </div>
              <MWithPasswordToggle v-model="passwordText" />
            </div>

            <div class="rounded-xl border border-default bg-elevated p-3 space-y-2.5">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium">
                  带清除功能
                </p>
                <UBadge variant="soft" size="xs" class="font-mono text-[10px]">
                  WithClear
                </UBadge>
              </div>
              <MWithClear v-model="clearText" />
            </div>

            <div class="rounded-xl border border-default bg-elevated p-3 space-y-2.5">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium">
                  字符计数
                </p>
                <UBadge variant="soft" size="xs" class="font-mono text-[10px]">
                  WithCharacterLimit
                </UBadge>
              </div>
              <MWithCharacterLimit v-model="limitText" :max-length="30" placeholder="最多 30 个字符" />
            </div>

            <div class="rounded-xl border border-default bg-elevated p-3 space-y-2.5">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium">
                  浮动标签
                </p>
                <UBadge variant="soft" size="xs" class="font-mono text-[10px]">
                  WithFloatingLabel
                </UBadge>
              </div>
              <MWithFloatingLabel v-model="floatingText" label="用户名" placeholder="输入内容后标签上浮" />
            </div>

            <div class="rounded-xl border border-default bg-elevated p-3 space-y-2.5">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium">
                  电话格式
                </p>
                <UBadge variant="soft" size="xs" class="font-mono text-[10px]">
                  AsPhoneNumberInput
                </UBadge>
              </div>
              <MAsPhoneNumberInput v-model="phoneText" dial-code="+86" mask="### #### ####" />
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </UCard>
</template>
