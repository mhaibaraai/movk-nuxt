<script setup lang="ts">
import type { SearchFormAction } from '@movk/nuxt'

const { afz } = useAutoForm()

interface EventEntry {
  id: number
  name: string
  payload: unknown
  time: string
}

const eventLog = ref<EventEntry[]>([])
let seq = 0
function logEvent(name: string, payload: unknown) {
  eventLog.value = [
    { id: ++seq, name, payload, time: new Date().toLocaleTimeString('zh-CN', { hour12: false }) },
    ...eventLog.value
  ].slice(0, 8)
}
function clearLog() {
  eventLog.value = []
}

// 1. 基础用法
const basicSchema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入姓名' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional(),
  email: afz.string({ controlProps: { placeholder: '请输入邮箱' } }).meta({ label: '邮箱' }).optional(),
  date: afz.calendarDate().meta({ label: '日期' }).optional(),
  department: afz.string({ controlProps: { placeholder: '请输入部门' } }).meta({ label: '部门' }).optional()
})
const basicState = ref<Record<string, unknown>>({})

// 2. v-model 初始值与重置
const modelSchema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['active', 'inactive']).meta({ label: '状态' }).optional(),
  role: afz.enum(['admin', 'viewer']).meta({ label: '角色' }).optional()
})
const modelState = ref<Record<string, unknown>>({ name: '张三', status: 'active' })
const modelFormRef = ref<{ setBaseline: (v?: unknown) => void, reset: () => void } | null>(null)
function setNewBaseline() {
  modelState.value = { name: '李四', status: 'inactive', role: 'viewer' }
  modelFormRef.value?.setBaseline()
}

// 3. 折叠行为
const collapseSchema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用', '待审核']).meta({ label: '状态' }).optional(),
  department: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '部门' }).optional(),
  role: afz.enum(['管理员', '编辑', '查看者']).meta({ label: '角色' }).optional(),
  email: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '邮箱' }).optional(),
  phone: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '手机号' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional()
})
const collapseState = ref<Record<string, unknown>>({})
const collapseExpanded = ref(false)

// 4. 响应式列数
const responsiveSchema = afz.object({
  q1: afz.string({ controlProps: { placeholder: '字段 1' } }).meta({ label: '字段 1' }).optional(),
  q2: afz.string({ controlProps: { placeholder: '字段 2' } }).meta({ label: '字段 2' }).optional(),
  q3: afz.string({ controlProps: { placeholder: '字段 3' } }).meta({ label: '字段 3' }).optional(),
  q4: afz.string({ controlProps: { placeholder: '字段 4' } }).meta({ label: '字段 4' }).optional()
})
const responsiveState = ref<Record<string, unknown>>({})

// 5. 自定义 actions 数组
const customActionsSchema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional()
})
const customActionsState = ref<Record<string, unknown>>({})
const customActions: SearchFormAction[] = [
  { key: 'search', label: '查询', icon: 'i-lucide-search', type: 'submit', color: 'primary' },
  { key: 'reset', label: '清空', icon: 'i-lucide-rotate-ccw', color: 'error', variant: 'outline' },
  {
    key: 'export',
    label: '导出',
    icon: 'i-lucide-download',
    color: 'primary',
    variant: 'soft',
    onClick: (ctx) => {
      logEvent('export', ctx.state)
    }
  }
]

// 6. 隐藏 actions
const hiddenActionsSchema = afz.object({
  name: afz.string({ controlProps: { placeholder: '回车提交搜索' } }).meta({ label: '姓名' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional()
})
const hiddenActionsState = ref<Record<string, unknown>>({})

// 7. actions 插槽自定义
const slotActionsSchema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional()
})
const slotActionsState = ref<Record<string, unknown>>({})

// 8. header / footer / extraActions 插槽
const layoutSlotsSchema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional()
})
const layoutSlotsState = ref<Record<string, unknown>>({})

// 9. loading 与 error
const validateSchema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  email: afz.email({ controlProps: { placeholder: '请输入合法邮箱' } }).meta({ label: '邮箱' })
})
const validateState = ref<Record<string, unknown>>({})
const validateLoading = ref(false)
const validateErrors = ref<unknown[]>([])
function toggleLoading() {
  validateLoading.value = !validateLoading.value
}
function onValidateSearch(payload: unknown) {
  logEvent('search', payload)
  validateLoading.value = true
  setTimeout(() => {
    validateLoading.value = false
  }, 1500)
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 gap-4">
    <Showcase
      title="Schema 驱动搜索表单"
      description="按 AutoForm schema 渲染字段，cols 控制栅格，内置搜索与重置按钮。"
      :state="{ modelValue: basicState, eventLog }"
    >
      <MSearchForm
        v-model="basicState"
        :schema="basicSchema"
        :cols="3"
        @submit="(v) => logEvent('search', v)"
        @reset="logEvent('reset', undefined)"
        @clear="logEvent('clear', undefined)"
      />
      <template #aside-extra>
        <UButton size="xs" variant="ghost" :disabled="!eventLog.length" class="self-start" @click="clearLog">
          清空记录
        </UButton>
      </template>
    </Showcase>

    <Showcase
      title="基线化重置模型"
      description="reset() 回到 baseline，setBaseline() 将当前外部状态设为新的重置基线。"
      :state="{ modelValue: modelState }"
    >
      <template #toolbar>
        <UButton size="xs" variant="outline" icon="i-lucide-refresh-cw" @click="setNewBaseline">
          设置外部基线
        </UButton>
      </template>
      <MSearchForm
        ref="modelFormRef"
        v-model="modelState"
        :schema="modelSchema"
        :cols="3"
      />
    </Showcase>

    <Showcase
      title="多字段折叠"
      description="visibleRows 与 cols 决定首屏字段数，expanded 支持外部双向控制。"
      :state="{ modelValue: collapseState, expanded: collapseExpanded }"
    >
      <template #toolbar>
        <UButton
          size="xs"
          variant="outline"
          :icon="collapseExpanded ? 'i-lucide-chevrons-up' : 'i-lucide-chevrons-down'"
          @click="collapseExpanded = !collapseExpanded"
        >
          {{ collapseExpanded ? '外部收起' : '外部展开' }}
        </UButton>
      </template>
      <MSearchForm
        v-model="collapseState"
        v-model:expanded="collapseExpanded"
        :schema="collapseSchema"
        :cols="3"
        :visible-rows="2"
      />
    </Showcase>

    <Showcase
      title="响应式查询栅格"
      description="cols 接收断点对象，列数随窗口宽度在 sm、md、lg、xl 间切换。"
      :state="{ modelValue: responsiveState }"
    >
      <MSearchForm
        v-model="responsiveState"
        :schema="responsiveSchema"
        :cols="{ sm: 1, md: 2, lg: 3, xl: 4 }"
      />
    </Showcase>

    <Showcase
      title="声明式操作按钮"
      description="actions 数组声明按钮，onClick 可读取当前 state 触发业务动作。"
      :state="{ modelValue: customActionsState }"
    >
      <MSearchForm
        v-model="customActionsState"
        :schema="customActionsSchema"
        :cols="3"
        :actions="customActions"
        @submit="(v) => logEvent('search', v)"
      />
    </Showcase>

    <Showcase
      title="无按钮提交"
      description="传入空 actions 隐藏默认按钮区，表单仍可通过回车触发 submit。"
      :state="{ modelValue: hiddenActionsState }"
    >
      <MSearchForm
        v-model="hiddenActionsState"
        :schema="hiddenActionsSchema"
        :cols="2"
        :actions="[]"
        @submit="(v) => logEvent('search(hidden)', v)"
      />
    </Showcase>

    <Showcase
      title="接管操作区"
      description="#actions 暴露 search、clear、loading，可用自定义按钮替换默认操作区。"
      :state="{ modelValue: slotActionsState }"
    >
      <MSearchForm
        v-model="slotActionsState"
        :schema="slotActionsSchema"
        :cols="3"
      >
        <template #actions="{ search, clear, loading }">
          <div class="flex items-end gap-2">
            <UButton color="primary" variant="solid" icon="i-lucide-filter" :loading="loading" @click="search">
              筛选
            </UButton>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="clear">
              清空
            </UButton>
          </div>
        </template>
      </MSearchForm>
    </Showcase>

    <Showcase
      title="扩展布局区域"
      description="header、footer、extraActions 插入辅助内容，slot props 随展开与表单值更新。"
      :state="{ modelValue: layoutSlotsState }"
    >
      <MSearchForm
        v-model="layoutSlotsState"
        :schema="layoutSlotsSchema"
        :cols="3"
      >
        <template #header="{ expanded }">
          <div class="rounded border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary">
            #header · expanded={{ expanded }}
          </div>
        </template>
        <template #extraActions>
          <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-save">
            保存方案
          </UButton>
        </template>
        <template #footer="{ state }">
          <div class="mt-2 rounded border border-dashed border-success/40 bg-success/5 px-3 py-2 text-xs text-success">
            #footer · 当前关键词: {{ (state as Record<string, unknown>).keyword ?? '—' }}
          </div>
        </template>
      </MSearchForm>
    </Showcase>

    <Showcase
      title="异步提交与校验"
      description="提交时显示 loading，email 字段走 Zod 校验，error 事件返回错误列表。"
      :state="{ modelValue: validateState, loading: validateLoading, errors: validateErrors }"
    >
      <template #toolbar>
        <UButton size="xs" variant="outline" :icon="validateLoading ? 'i-lucide-pause' : 'i-lucide-play'" @click="toggleLoading">
          手动切换加载态
        </UButton>
      </template>
      <MSearchForm
        v-model="validateState"
        :schema="validateSchema"
        :cols="2"
        :loading="validateLoading"
        :validate-on="['blur']"
        @submit="onValidateSearch"
        @error="(event) => { validateErrors = event.errors ?? []; logEvent('error', event.errors) }"
      />
    </Showcase>
  </div>
</template>
