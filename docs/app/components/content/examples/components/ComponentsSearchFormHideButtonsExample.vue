<script setup lang="ts">
const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional(),
  department: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '部门' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional()
})
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <p class="text-sm text-muted">
        仅保留搜索按钮（actions 只传 search）
      </p>
      <MSearchForm
        :schema="schema"
        :actions="[{ key: 'search', label: '搜索', icon: 'i-lucide-search', type: 'submit' }]"
      />
    </div>
    <div class="space-y-2">
      <p class="text-sm text-muted">
        关闭全部内置按钮（actions: []），通过 actions slot 完全自定义
      </p>
      <MSearchForm :schema="schema" :actions="[]">
        <template #actions="{ search, reset }">
          <div class="flex items-end gap-2 justify-end">
            <UButton color="primary" variant="solid" icon="i-lucide-filter" @click="search">
              筛选
            </UButton>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="reset">
              清空
            </UButton>
          </div>
        </template>
      </MSearchForm>
    </div>
  </div>
</template>
