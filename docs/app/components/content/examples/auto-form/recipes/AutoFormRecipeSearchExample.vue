<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  keyword: afz.string({ controlProps: { placeholder: '输入关键字' } }).optional().meta({ label: '关键字' }),
  category: afz.enum(['全部', '前端', '后端', '运维'], { type: 'pillGroup' }).default('全部').meta({ label: '分类' }),
  status: afz.enum(['active', 'archived'], { type: 'radioGroup' }).default('active').meta({ label: '状态' })
})
const state = reactive<Partial<z.input<typeof schema>>>({})
const searchRef = useTemplateRef('searchForm')

async function onSubmit() {
  await new Promise(r => setTimeout(r, 300))
  toast.add({ title: '查询完成', description: JSON.stringify(state), color: 'info' })
}
function onReset() {
  searchRef.value?.reset()
  toast.add({ title: '已重置', color: 'neutral' })
}
</script>

<template>
  <MAutoForm
    ref="searchForm"
    :schema="schema"
    :state="state"
    :global-meta="{ orientation: 'horizontal', size: 'sm' }"
    :submit="false"
    @submit="onSubmit"
  >
    <template #footer="{ loading }">
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="soft" size="sm" label="重置" @click="onReset" />
        <UButton type="submit" size="sm" label="搜索" :loading="loading" />
      </div>
    </template>
  </MAutoForm>
</template>
