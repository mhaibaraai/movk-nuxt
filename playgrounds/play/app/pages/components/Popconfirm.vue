<script lang="ts" setup>
import type { SemanticColor } from '#movk/types'

const toast = useToast()

const types: SemanticColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error']

const syncResult = ref('')
const asyncResult = ref('')
const customResult = ref('')
const errorMsg = ref('')
const slotResult = ref('')
const uiResult = ref('')

async function simulateAsync() {
  await new Promise<void>(resolve => setTimeout(resolve, 1500))
}

async function failingAction() {
  await new Promise<void>(resolve => setTimeout(resolve, 800))
  throw new Error('服务器返回错误：操作被拒绝')
}

function handleError(err: unknown) {
  errorMsg.value = err instanceof Error ? err.message : '未知错误'
  toast.add({
    color: 'error',
    title: '操作失败',
    description: errorMsg.value
  })
}
</script>

<template>
  <Navbar />
  <Matrix title="气泡确认框" description="`MPopconfirm` 组件的各种用法场景。">
    <div class="grid gap-8">
      <UFormField label="类型（type）">
        <div class="flex flex-wrap gap-3">
          <MPopconfirm
            v-for="type in types"
            :key="type"
            :type="type"
            :title="`${type} 确认`"
            :description="`这是一条 ${type} 类型的确认气泡。`"
            :on-confirm="() => { syncResult = `${type} 已确认` }"
          >
            <UButton :color="type" variant="soft" :label="type" size="sm" />
          </MPopconfirm>
        </div>
        <span v-if="syncResult" class="mt-2 block text-sm text-muted">{{ syncResult }}</span>
      </UFormField>

      <UFormField label="异步确认（loading 1.5s）">
        <div class="flex items-center gap-4">
          <MPopconfirm
            type="primary"
            title="确认提交?"
            description="提交后将立即生效，请确认操作。"
            :on-confirm="simulateAsync"
            @confirm="asyncResult = '提交成功'"
          >
            <UButton color="primary" label="提交申请" icon="i-lucide-send" />
          </MPopconfirm>
          <span v-if="asyncResult" class="text-sm text-success">{{ asyncResult }}</span>
        </div>
      </UFormField>

      <UFormField label="自定义图标和按钮">
        <div class="flex items-center gap-4">
          <MPopconfirm
            type="error"
            title="永久删除?"
            description="此操作不可撤销，数据将永久丢失。"
            icon="i-lucide-trash-2"
            :confirm-button="{ color: 'error', label: '确认删除' }"
            :cancel-button="{ label: '取消操作', variant: 'ghost' }"
            :on-confirm="() => { customResult = '已删除' }"
          >
            <UButton color="error" variant="soft" label="危险操作" icon="i-lucide-alert-triangle" />
          </MPopconfirm>
          <span v-if="customResult" class="text-sm text-error">{{ customResult }}</span>
        </div>
      </UFormField>

      <UFormField label="禁用取消按钮">
        <MPopconfirm
          type="warning"
          title="强制确认"
          description="此操作必须确认，无法取消。"
          :cancel-button="false"
        >
          <UButton color="warning" variant="soft" label="强制操作" />
        </MPopconfirm>
      </UFormField>

      <UFormField label="错误处理（@error）">
        <div class="flex flex-col gap-2">
          <MPopconfirm
            type="error"
            title="模拟操作失败"
            description="确认后将触发失败的异步操作。"
            :on-confirm="failingAction"
            @error="handleError"
          >
            <UButton color="error" variant="soft" label="触发失败操作" icon="i-lucide-zap-off" />
          </MPopconfirm>
        </div>
      </UFormField>

      <UFormField label="body Slot 自定义内容">
        <div class="flex items-center gap-4">
          <MPopconfirm
            title="删除用户"
            :description="''"
            :on-confirm="() => { slotResult = '用户已删除' }"
          >
            <template #body>
              <div class="flex flex-col gap-2 py-1">
                <p class="text-sm text-muted">
                  即将删除以下用户，操作不可撤销：
                </p>
                <div class="flex items-center gap-2 rounded-md bg-elevated px-3 py-2">
                  <UAvatar size="xs" icon="i-lucide-user" />
                  <div class="flex flex-col">
                    <span class="text-xs font-medium text-highlighted">张三</span>
                    <span class="text-xs text-muted">zhangsan@example.com</span>
                  </div>
                </div>
              </div>
            </template>
            <UButton color="error" variant="soft" label="删除用户" icon="i-lucide-user-x" />
          </MPopconfirm>
          <span v-if="slotResult" class="text-sm text-error">{{ slotResult }}</span>
        </div>
      </UFormField>

      <UFormField label="ui 样式定制">
        <div class="flex items-center gap-4">
          <MPopconfirm
            type="info"
            title="样式定制示例"
            description="通过 ui 属性覆盖内部各区块 class。"
            :ui="{
              content: 'w-72',
              title: 'text-info text-base',
              description: 'text-xs text-info/70',
              footer: 'justify-between pt-2 border-t border-default'
            }"
            :confirm-button="{ label: '好的，执行', color: 'info' }"
            :cancel-button="{ label: '不了，取消', variant: 'ghost' }"
            :on-confirm="() => { uiResult = '已确认' }"
          >
            <UButton color="info" variant="soft" label="打开定制气泡" icon="i-lucide-palette" />
          </MPopconfirm>
          <span v-if="uiResult" class="text-sm text-muted">{{ uiResult }}</span>
        </div>
      </UFormField>
    </div>
  </Matrix>
</template>
