<script setup lang="ts" generic="S extends z.ZodObject">
import type { z } from 'zod/v4'
import type { AutoFormProps } from './AutoForm.vue'
import type { AutoFormField, AutoFormFieldNestedContext } from './types/auto-form'
import { UButton, UCollapsible, UIcon } from '#components'
import { useSortable } from '@vueuse/integrations/useSortable'
import defu from 'defu'
import { computed, h, ref } from 'vue'
import AutoFormFieldRenderer from './AutoFormFieldRenderer.vue'
import AutoFormNestedRenderer from './AutoFormNestedRenderer.vue'
import { useAutoFormInjector } from './composables/useAutoFormContext'
import { generateDefaultValue } from './utils/auto-form'

interface AutoFormArrayRendererProps<S extends z.ZodObject> extends Pick<AutoFormProps<S>, 'schema'> {
  field: AutoFormField
}

const props = defineProps<AutoFormArrayRendererProps<S>>()

const { createFieldContext, resolveFieldProp } = useAutoFormInjector()

// 获取数组值和设置函数
const context = createFieldContext(props.field)

// 直接使用 context.value 作为响应式数组源
const arrayValue = computed(() => {
  const val = context.value.value
  return Array.isArray(val) ? val : []
})

// 获取模板字段（children[0]）
const template = computed(() => props.field.children?.[0])

// 判断元素类型
const isObjectElement = computed(() => {
  if (!template.value)
    return false
  const type = template.value.meta.type
  return type === 'object'
})

// 动态生成实际字段
const itemFields = computed(() => {
  if (!template.value)
    return []
  return arrayValue.value.map((_: any, index: number) => {
    // 深拷贝字段配置，避免共享引用
    const field: AutoFormField = {
      ...template.value!,
      path: template.value!.path.replace('[]', `[${index}]`),
      meta: { ...template.value!.meta },
      decorators: { ...template.value!.decorators },
    }
    return field
  })
})

// 调试日志
if (import.meta.client) {
  console.log('[AutoFormArrayRenderer] Debug:', {
    fieldPath: props.field.path,
    arrayValueLength: arrayValue.value.length,
    arrayValue: arrayValue.value,
    template: template.value,
    hasChildren: !!props.field.children?.length,
    itemFieldsCount: itemFields.value.length,
    isObjectElement: isObjectElement.value,
  })
}

// 拖拽容器 ref
const sortableContainer = ref<HTMLElement>()

// 初始化 useSortable，直接修改 context.value
useSortable(sortableContainer, arrayValue, {
  animation: 200,
  handle: '.drag-handle',
  ghostClass: 'sortable-ghost',
  onUpdate: () => {
    // 强制触发更新
    context.setValue([...arrayValue.value])
  },
})

// 添加项
function addItem() {
  if (!template.value)
    return
  const defaultValue = generateDefaultValue(template.value.schema)
  console.log('[AutoFormArrayRenderer] Adding item:', defaultValue)
  context.setValue([...arrayValue.value, defaultValue])
}

// 删除项
function removeItem(index: number) {
  const newArray = arrayValue.value.filter((_: any, i: number) => i !== index)
  context.setValue(newArray)
}

// 折叠配置
const collapsibleConfig = computed(() => resolveFieldProp(props.field, 'collapsible'))
const useCollapsible = computed(() => {
  const config = collapsibleConfig.value
  if (!config)
    return true
  return config.enabled !== false
})

// 创建增强字段（带折叠图标和项数统计）
const enhancedField = computed<AutoFormField>(() => {
  if (!useCollapsible.value || props.field.meta.hint !== undefined) {
    return props.field
  }

  // 创建带图标和项数的 hint slot
  const iconSlotConfig = {
    meta: {
      fieldSlots: {
        hint: ({ open }: AutoFormFieldNestedContext) => h('div', { class: 'flex items-center gap-2' }, [
          h(UIcon, {
            name: open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
            class: 'shrink-0 size-5 transition-transform duration-200',
          }),
          h('span', { class: 'text-xs text-muted' }, `(${arrayValue.value.length} 项)`),
        ]),
      },
    },
  }

  return defu(iconSlotConfig, props.field)
})
</script>

<template>
  <UCollapsible v-if="useCollapsible" v-bind="collapsibleConfig">
    <template #default="{ open }">
      <AutoFormFieldRenderer
        :field="enhancedField"
        :schema="schema"
        :extra-props="{ open }"
      />
    </template>

    <template #content>
      <div class="space-y-4 pt-2">
        <TransitionGroup
          ref="sortableContainer"
          name="array-item"
          tag="div"
          class="space-y-3"
        >
          <div
            v-for="(_item, index) in arrayValue"
            :key="`${field.path}[${index}]`"
            class="flex items-start gap-2 p-3 border border-base rounded-lg"
          >
            <!-- 拖拽手柄 -->
            <UIcon
              name="i-lucide-grip-vertical"
              class="shrink-0 size-5 text-muted cursor-move drag-handle mt-2"
            />

            <!-- 字段内容 -->
            <div class="flex-1 space-y-4">
              <template v-if="isObjectElement">
                <AutoFormNestedRenderer
                  v-for="childField in itemFields[index]?.children || []"
                  :key="childField.path"
                  :field="childField"
                  :schema="schema"
                />
              </template>
              <template v-else>
                <AutoFormFieldRenderer
                  v-if="itemFields[index]"
                  :field="itemFields[index]"
                  :schema="schema"
                />
              </template>
            </div>

            <!-- 删除按钮 -->
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              square
              @click="removeItem(index)"
            />
          </div>
        </TransitionGroup>

        <div v-if="arrayValue.length === 0" class="text-center py-8 text-muted">
          暂无数据
        </div>

        <!-- 添加按钮 -->
        <UButton
          icon="i-lucide-plus"
          color="primary"
          variant="outline"
          block
          @click="addItem"
        >
          添加项
        </UButton>
      </div>
    </template>
  </UCollapsible>

  <div v-else class="space-y-4">
    <TransitionGroup
      ref="sortableContainer"
      name="array-item"
      tag="div"
      class="space-y-3"
    >
      <div
        v-for="(_item, index) in arrayValue"
        :key="`${field.path}[${index}]`"
        class="flex items-start gap-2 p-3 border border-base rounded-lg"
      >
        <!-- 拖拽手柄 -->
        <UIcon
          name="i-lucide-grip-vertical"
          class="shrink-0 size-5 text-muted cursor-move drag-handle mt-2"
        />

        <!-- 字段内容 -->
        <div class="flex-1 space-y-4">
          <template v-if="isObjectElement">
            <AutoFormNestedRenderer
              v-for="childField in itemFields[index]?.children || []"
              :key="childField.path"
              :field="childField"
              :schema="schema"
            />
          </template>
          <template v-else>
            <AutoFormFieldRenderer
              v-if="itemFields[index]"
              :field="itemFields[index]"
              :schema="schema"
            />
          </template>
        </div>

        <!-- 删除按钮 -->
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          square
          @click="removeItem(index)"
        />
      </div>
    </TransitionGroup>

    <div v-if="arrayValue.length === 0" class="text-center py-8 text-muted">
      暂无数据
    </div>

    <!-- 添加按钮 -->
    <UButton
      icon="i-lucide-plus"
      color="primary"
      variant="outline"
      block
      @click="addItem"
    >
      添加项
    </UButton>
  </div>
</template>

<style scoped>
.array-item-enter-active,
.array-item-leave-active {
  transition: all 0.3s ease;
}

.array-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.array-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

:deep(.sortable-ghost) {
  opacity: 0.4;
  background-color: var(--color-primary-100);
}
</style>
