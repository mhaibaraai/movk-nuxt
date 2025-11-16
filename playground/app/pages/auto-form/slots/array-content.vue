<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const toast = useToast()
const { afz } = useAutoForm()

const schema = afz.object({
  tasks: afz.array(
    afz.object({
      title: afz.string().min(1),
      priority: afz.enum(['low', 'medium', 'high']),
      completed: afz.boolean()
    })
  )
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({
  tasks: [
    { title: '完成项目文档', priority: 'high', completed: false },
    { title: '代码审查', priority: 'medium', completed: false }
  ]
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <UCard class="mt-6">
    <template #header>
      <h2 class="text-xl font-bold">
        数组字段内容插槽
      </h2>
      <p class="text-sm text-gray-500 mt-1">
        使用 field-content 插槽自定义数组元素的包装和渲染
      </p>
    </template>

    <MAutoForm :schema="schema" :state="form" @submit="onSubmit">
      <!-- Tasks 数组内容自定义 -->
      <template #field-content:tasks="{ count }">
        <div class="space-y-4">
          <UAlert
            color="success"
            variant="subtle"
            icon="i-lucide-list-checks"
            :title="`任务列表 (${count || 0})`"
            :description="`共 ${count || 0} 个任务`"
          >
            <template #actions>
              <UBadge
                :color="count && count > 0 ? 'success' : 'neutral'"
                variant="subtle"
                size="lg"
              >
                {{ count || 0 }}
              </UBadge>
            </template>
          </UAlert>

          <!-- 使用默认插槽渲染数组元素 -->
          <div class="space-y-3">
            <slot />
          </div>

          <UAlert
            v-if="!count || count === 0"
            color="neutral"
            variant="subtle"
            icon="i-lucide-inbox"
            title="暂无任务"
            description="点击添加按钮创建第一个任务"
          />
        </div>
      </template>
    </MAutoForm>

    <template #footer>
      <FormDataViewer :data="form" />
    </template>
  </UCard>
</template>
