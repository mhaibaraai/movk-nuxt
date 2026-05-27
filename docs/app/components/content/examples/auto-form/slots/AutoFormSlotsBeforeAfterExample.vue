<script lang="ts" setup>
import type { z } from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  settings: afz.object({
    notifications: afz.boolean({ type: 'switch', controlProps: { label: '接收通知' } }).default(true).meta({ label: '通知' }),
    digest: afz.enum(['daily', 'weekly', 'monthly']).default('weekly').meta({ label: '摘要频率' }),
    notes: afz.string({ type: 'textarea' }).default('保留默认字段渲染，只在前后插入 slot 内容。').meta({ label: '备注' })
  }).default({
    notifications: true,
    digest: 'weekly',
    notes: '保留默认字段渲染，只在前后插入 slot 内容。'
  }).meta({ label: '通知设置', collapsible: { defaultOpen: true } })
})

const state = reactive<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <MAutoForm :schema="schema" :state="state">
    <template #field-before:settings="{ path }">
      <UAlert
        color="neutral"
        variant="subtle"
        icon="i-lucide-settings"
        title="field-before 插入点"
        :description="`field-before:${path} 不接管子字段，只在默认内容前追加说明。`"
        class="mb-4"
      />
    </template>

    <template #field-after:settings="{ value }">
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <UBadge :color="value?.notifications ? 'success' : 'neutral'" variant="subtle">
          {{ value?.notifications ? '通知开启' : '通知关闭' }}
        </UBadge>
        <UBadge color="info" variant="subtle">
          {{ value?.digest || '未选择摘要频率' }}
        </UBadge>
        <span class="text-xs text-muted">
          field-after 保留默认字段交互，只追加汇总状态。
        </span>
      </div>
    </template>
  </MAutoForm>
</template>
