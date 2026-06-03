<script setup lang="ts">
import type z from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional()
})

const state = ref<Partial<z.output<typeof schema>>>({})
</script>

<template>
  <MSearchForm v-model="state" :schema="schema" :cols="3">
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
</template>
