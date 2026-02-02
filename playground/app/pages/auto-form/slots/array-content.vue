<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  tasks: afz.array(
    afz.object({
      title: afz.string().min(1),
      priority: afz.enum(['low', 'medium', 'high']).default('medium'),
      completed: afz.boolean()
    })
  ).default([
    { title: '完成项目文档', priority: 'high', completed: false },
    { title: '代码审查', priority: 'medium', completed: false }
  ])
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}

// 获取优先级颜色
function getPriorityColor(priority: string) {
  const priorityStr = String(priority)
  switch (priorityStr) {
    case 'high': return 'error'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'neutral'
  }
}

// 获取优先级文本
function getPriorityText(priority: string) {
  const priorityStr = String(priority)
  switch (priorityStr) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return priorityStr || '未设置'
  }
}
</script>

<template>
  <Navbar />
  <Matrix :form="form" title="自定义数组内容" description="使用 `field-content` 插槽完全自定义数组字段的渲染逻辑。">
    <MAutoForm
      :schema="schema"
      :state="form"
      :global-meta="{ collapsible: { defaultOpen: true } }"
      @submit="onSubmit"
    >
      <template #field-content:tasks="{ path, value, setValue, state }">
        <div class="space-y-4">
          <UAlert
            color="success"
            variant="subtle"
            icon="i-lucide-list-checks"
            title="任务列表"
            description="管理您的任务列表 - 使用 setValue 简化数组操作"
          >
            <template #actions>
              <UBadge :color="!!value?.length ? 'success' : 'neutral'" variant="subtle" size="lg">
                {{ value?.length || 0 }} 项
              </UBadge>
            </template>
          </UAlert>

          <div v-if="value" class="space-y-3">
            <div
              v-for="(task, index) in value"
              :key="index"
              class="relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="setValue(value.filter((_, i) => i !== index))"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <UFormField :label="`任务 ${index + 1}`" :name="`${path}[${index}].title`" required>
                  <UInput
                    :model-value="task?.title"
                    placeholder="请输入任务标题"
                    icon="i-lucide-pencil-line"
                    @update:model-value="setValue(`[${index}].title`, $event)"
                  />
                </UFormField>

                <UFormField label="优先级" :name="`${path}[${index}].priority`">
                  <USelect
                    :model-value="task?.priority"
                    placeholder="选择优先级"
                    :items="[
                      { value: 'low', label: '低优先级' },
                      { value: 'medium', label: '中优先级' },
                      { value: 'high', label: '高优先级' }
                    ]"
                    @update:model-value="setValue(`[${index}].priority`, $event)"
                  >
                    <template #leading="{ modelValue }">
                      <UBadge
                        v-if="modelValue"
                        :color="getPriorityColor(modelValue)"
                        variant="subtle"
                        size="xs"
                      >
                        {{ getPriorityText(modelValue) }}
                      </UBadge>
                    </template>
                  </USelect>
                </UFormField>

                <UFormField label="完成状态" :name="`${path}[${index}].completed`">
                  <USwitch
                    :model-value="task?.completed"
                    unchecked-icon="i-lucide-x"
                    checked-icon="i-lucide-check"
                    :label="task?.completed ? '已完成' : '进行中'"
                    @update:model-value="setValue(`[${index}].completed`, $event)"
                  />
                </UFormField>
              </div>

              <div class="mt-3 flex items-center gap-2">
                <UBadge
                  v-if="task?.priority"
                  :color="getPriorityColor(task.priority)"
                  variant="subtle"
                  size="xs"
                >
                  {{ getPriorityText(task.priority) }}优先级
                </UBadge>
                <UBadge
                  v-if="task?.completed"
                  color="success"
                  variant="subtle"
                  size="xs"
                >
                  已完成
                </UBadge>
                <UBadge
                  v-else
                  color="warning"
                  variant="subtle"
                  size="xs"
                >
                  进行中
                </UBadge>
              </div>
            </div>
          </div>

          <UAlert
            v-if="!state.tasks || state.tasks.length === 0"
            color="neutral"
            variant="subtle"
            icon="i-lucide-inbox"
            title="暂无任务"
            description="点击添加按钮创建第一个任务"
          />
        </div>
      </template>
    </MAutoForm>
  </Matrix>
</template>
