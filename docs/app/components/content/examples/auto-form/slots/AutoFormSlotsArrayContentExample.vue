<script lang="ts" setup>
import type { z } from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  todos: afz.array(
    afz.object({
      title: afz.string().min(1).meta({ label: '标题' }),
      priority: afz.enum(['low', 'medium', 'high']).default('medium').meta({ label: '优先级' }),
      done: afz.boolean().default(false).meta({ label: '完成' })
    })
  ).default([
    { title: '整理 slot 示例', priority: 'high', done: false },
    { title: '梳理 setValue 路径', priority: 'medium', done: false }
  ]).meta({ label: '待办列表', collapsible: { defaultOpen: true } })
})

const state = reactive<Partial<z.output<typeof schema>>>({})

const priorityItems = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' }
]

function createTodo() {
  return { title: '', priority: 'medium' as const, done: false }
}
</script>

<template>
  <MAutoForm :schema="schema" :state="state">
    <template #field-content:todos="{ value, setValue }">
      <div class="space-y-3">
        <div
          v-for="(todo, index) in value || []"
          :key="index"
          class="rounded-md border border-default p-4 space-y-3"
        >
          <div class="flex items-center justify-between gap-3">
            <UBadge color="neutral" variant="subtle">
              #{{ index + 1 }}
            </UBadge>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              @click="setValue((value || []).filter((_, current) => current !== index))"
            />
          </div>

          <UFormField label="标题">
            <UInput
              :model-value="todo?.title"
              placeholder="任务标题"
              @update:model-value="setValue(`[${index}].title`, $event)"
            />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <UFormField label="优先级">
              <USelect
                :model-value="todo?.priority"
                :items="priorityItems"
                @update:model-value="setValue(`[${index}].priority`, $event)"
              />
            </UFormField>

            <UFormField label="完成状态">
              <USwitch
                :model-value="todo?.done"
                :label="todo?.done ? '已完成' : '进行中'"
                @update:model-value="setValue(`[${index}].done`, $event)"
              />
            </UFormField>
          </div>
        </div>

        <UButton
          icon="i-lucide-plus"
          color="info"
          variant="soft"
          size="sm"
          @click="setValue([...(value || []), createTodo()])"
        >
          添加任务
        </UButton>
      </div>
    </template>
  </MAutoForm>
</template>
