<script lang="ts" setup>
import type { DateValue, AutoFormFieldContext, DataTableColumn } from '#movk/types'
import type z from 'zod'

const slides = [{
  key: 'autoform',
  label: 'AutoForm',
  icon: 'i-lucide-square-pen'
}, {
  key: 'datatable',
  label: 'DataTable',
  icon: 'i-lucide-table'
}, {
  key: 'components',
  label: 'UI 组件',
  icon: 'i-lucide-layout-grid'
}, {
  key: 'enhanced',
  label: '输入增强',
  icon: 'i-lucide-sparkles'
}]

const active = ref(0)
const activeSlide = computed(() => slides[active.value]!)

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
        if: ({ state }: AutoFormFieldContext) => state?.role === '管理员'
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

interface Member {
  id: string
  name: string
  role: string
  level: 'P5' | 'P6' | 'P7' | 'P8'
  salary: number
}

const tableData: Member[] = [
  { id: 'P0001', name: '张伟', role: '前端工程师', level: 'P7', salary: 42000 },
  { id: 'P0002', name: '李娜', role: 'UI 设计师', level: 'P6', salary: 36000 },
  { id: 'P0003', name: '王强', role: '产品经理', level: 'P7', salary: 45000 },
  { id: 'P0004', name: '陈静', role: '后端工程师', level: 'P6', salary: 38000 },
  { id: 'P0005', name: '刘洋', role: '数据分析师', level: 'P5', salary: 28000 }
]

const tableColumns: DataTableColumn<Member>[] = [
  { type: 'selection' },
  { accessorKey: 'name', header: '姓名', resizable: true },
  { accessorKey: 'role', header: '岗位', pinable: true },
  { accessorKey: 'level', header: '职级' },
  {
    accessorKey: 'salary',
    header: '薪资',
    align: 'right',
    cell: ({ getValue }) => `¥${getValue<number>().toLocaleString()}`
  }
]

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
        <div class="flex items-center gap-2">
          <UIcon :name="activeSlide.icon" class="size-5 text-primary" />
          <h2 class="text-base font-semibold">
            {{ activeSlide.label }}
          </h2>
        </div>
        <UBadge color="primary" variant="subtle" size="xs">
          Live Demo
        </UBadge>
      </div>
    </template>

    <UCarousel
      v-slot="{ item }"
      :items="slides"
      dots
      loop
      :ui="{ item: 'basis-full min-w-0', dots: 'bottom-0' }"
      @select="active = $event"
    >
      <div v-if="item.key === 'autoform'" class="p-4 sm:p-6">
        <MAutoForm :schema="formSchema" :state="formState" :submit="false" />
      </div>

      <div v-else-if="item.key === 'datatable'" class="p-4 sm:p-6">
        <MDataTable :columns="tableColumns" :data="tableData" sortable />
      </div>

      <div v-else-if="item.key === 'components'" class="p-4 sm:p-6 space-y-3">
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

      <div v-else class="p-4 sm:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
    </UCarousel>
  </UCard>
</template>
