<script setup lang="ts">
const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional()
})

const state = ref<Record<string, unknown>>({})
</script>

<template>
  <MSearchForm v-model="state" :schema="schema" :cols="3">
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
    <template #footer="{ state: formState }">
      <div class="mt-2 rounded border border-dashed border-success/40 bg-success/5 px-3 py-2 text-xs text-success">
        #footer · 当前关键词: {{ (formState as Record<string, unknown>).keyword ?? '—' }}
      </div>
    </template>
  </MSearchForm>
</template>
