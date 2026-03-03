<script setup lang="ts">
const { afz } = useAutoForm()

const schema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '姓名' }).optional(),
  status: afz.enum(['启用', '禁用']).meta({ label: '状态' }).optional(),
  department: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '部门' }).optional(),
  keyword: afz.string({ controlProps: { placeholder: '请输入' } }).meta({ label: '关键词' }).optional()
})

const params = ref({})
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <p class="text-sm text-muted">
        隐藏重置按钮
      </p>
      <MSearchForm
        v-model="params"
        :schema="schema"
        :show-reset-button="false"
      />
    </div>
    <div class="space-y-2">
      <p class="text-sm text-muted">
        隐藏全部按钮，通过 actions slot 自定义
      </p>
      <MSearchForm
        v-model="params"
        :schema="schema"
        :show-search-button="false"
        :show-reset-button="false"
      >
        <template #actions="{ search, reset }">
          <div class="flex items-end gap-2 justify-end">
            <UButton
              color="primary"
              variant="solid"
              icon="i-lucide-filter"
              @click="search"
            >
              筛选
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              @click="reset"
            >
              清空
            </UButton>
          </div>
        </template>
      </MSearchForm>
    </div>
  </div>
</template>
