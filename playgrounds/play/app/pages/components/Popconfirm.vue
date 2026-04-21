<script lang="ts" setup>
const syncResult = ref<string>('')
const asyncResult = ref<string>('')
const customResult = ref<string>('')
const sideResult = ref<string>('')

async function simulateAsync() {
  await new Promise<void>(resolve => setTimeout(resolve, 1500))
  asyncResult.value = '操作成功'
}
</script>

<template>
  <Navbar />
  <Matrix title="气泡确认框" description="`MPopconfirm` 组件的各种用法场景。">
    <div class="grid gap-8">
      <UFormField label="基础用法（同步）">
        <div class="flex items-center gap-4">
          <MPopconfirm :on-confirm="() => { syncResult = '已确认' }" @cancel="syncResult = '已取消'">
            <UButton color="neutral" variant="outline" label="删除" icon="i-lucide-trash" />
          </MPopconfirm>
          <span v-if="syncResult" class="text-sm text-muted">{{ syncResult }}</span>
        </div>
      </UFormField>

      <UFormField label="异步确认（loading 1.5s）">
        <div class="flex items-center gap-4">
          <MPopconfirm
            title="确认提交?"
            description="提交后无法修改，请确认操作。"
            :on-confirm="simulateAsync"
          >
            <UButton color="primary" label="提交" icon="i-lucide-send" />
          </MPopconfirm>
          <span v-if="asyncResult" class="text-sm text-success">{{ asyncResult }}</span>
        </div>
      </UFormField>

      <UFormField label="自定义图标和按钮文本">
        <MPopconfirm
          title="永久删除?"
          description="此操作不可撤销，数据将永久丢失。"
          icon="i-lucide-trash-2"
          :confirm-button="{ color: 'error', label: '确认删除' }"
          :cancel-button="{ label: '取消操作' }"
          :on-confirm="() => { customResult = '已删除' }"
        >
          <UButton color="error" variant="soft" label="危险操作" icon="i-lucide-alert-triangle" />
        </MPopconfirm>
        <span v-if="customResult" class="ml-3 text-sm text-error">{{ customResult }}</span>
      </UFormField>

      <UFormField label="禁用取消按钮">
        <MPopconfirm
          title="强制确认"
          description="此操作必须确认，无法取消。"
          :cancel-button="false"
          :on-confirm="() => {}"
        >
          <UButton color="warning" variant="soft" label="强制操作" />
        </MPopconfirm>
      </UFormField>

      <UFormField label="自定义弹出方向（top）">
        <div class="flex items-center gap-4">
          <MPopconfirm
            :content="{ side: 'top' }"
            title="从上方弹出"
            :on-confirm="() => { sideResult = '从上方确认' }"
          >
            <UButton color="neutral" variant="outline" label="向上弹出" icon="i-lucide-arrow-up" />
          </MPopconfirm>
          <span v-if="sideResult" class="text-sm text-muted">{{ sideResult }}</span>
        </div>
      </UFormField>
    </div>
  </Matrix>
</template>
