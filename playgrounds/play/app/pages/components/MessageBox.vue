<script lang="ts" setup>
import type { SemanticColor } from '#movk/types'

// ── 声明式状态 ──────────────────────────────────────
const declarativeAlertOpen = ref(false)
const declarativeAlertResult = ref('')

const declarativeConfirmOpen = ref(false)
const declarativeConfirmResult = ref('')

const advancedOpen = ref(false)
const advancedResult = ref('')

// ── 编程式状态 ──────────────────────────────────────
const { alert, confirm } = useMessageBox()

const programAlertResult = ref('')
const programConfirmResult = ref('')
const programAdvancedResult = ref('')

async function showProgramAlert(type: SemanticColor) {
  await alert({
    type,
    title: `${type} 提示`,
    description: `这是一条 ${type} 类型的通知消息，关闭后继续执行后续逻辑。`
  })
  programAlertResult.value = `${type} 弹窗已关闭`
}

async function showProgramConfirm() {
  const ok = await confirm({
    type: 'warning',
    title: '确认删除',
    icon: 'i-lucide-trash-2',
    description: '此操作将永久删除该记录，无法恢复，是否继续？'
  })
  programConfirmResult.value = ok ? '用户点击了确认' : '用户点击了取消'
}

async function showProgramAdvanced() {
  const ok = await confirm({
    type: 'error',
    title: '清空数据',
    description: '即将清空所有本地缓存，此操作不可撤销。',
    icon: 'i-lucide-database-zap',
    confirmButton: { color: 'error', label: '确认清空' },
    cancelButton: { label: '我再想想' }
  })
  programAdvancedResult.value = ok ? '数据已清空' : '操作已取消'
}
</script>

<template>
  <Navbar />
  <Matrix title="消息框" description="`MMessageBox` 组件的声明式用法与 `useMessageBox()` 编程式用法。">
    <div class="grid gap-10">
      <!-- 声明式用法 -->
      <div class="grid gap-6">
        <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
          声明式 &lt;MMessageBox /&gt;
        </h3>

        <UFormField label="Alert 模式 — v-model:open + @close">
          <div class="flex items-center gap-4">
            <UButton color="primary" variant="soft" label="打开 Alert" icon="i-lucide-bell" @click="declarativeAlertOpen = true" />
            <span v-if="declarativeAlertResult" class="text-sm text-muted">{{ declarativeAlertResult }}</span>
          </div>
          <MMessageBox
            v-model:open="declarativeAlertOpen"
            type="primary"
            title="操作提示"
            description="这是一条声明式声明的 Alert 弹窗，关闭时会触发 @close 事件。"
            @close="declarativeAlertResult = '已关闭（@close 触发）'"
          />
        </UFormField>

        <UFormField label="Confirm 模式 — @close 接收 confirmed: boolean">
          <div class="flex items-center gap-4">
            <UButton color="warning" variant="outline" label="删除记录" icon="i-lucide-trash" @click="declarativeConfirmOpen = true" />
            <span v-if="declarativeConfirmResult" class="text-sm text-muted">{{ declarativeConfirmResult }}</span>
          </div>
          <MMessageBox
            v-model:open="declarativeConfirmOpen"
            mode="confirm"
            type="warning"
            title="确认删除"
            icon="i-lucide-trash-2"
            description="此操作将永久删除该记录，无法恢复，是否继续？"
            @close="(ok) => declarativeConfirmResult = ok ? '用户点击了确认' : '用户点击了取消'"
          />
        </UFormField>

        <UFormField label="高级 prop 定制 — ui / closeIcon / confirmButton / cancelButton">
          <div class="flex items-center gap-4">
            <UButton color="error" variant="soft" label="高级示例" icon="i-lucide-settings-2" @click="advancedOpen = true" />
            <span v-if="advancedResult" class="text-sm text-muted">{{ advancedResult }}</span>
          </div>
          <MMessageBox
            v-model:open="advancedOpen"
            mode="confirm"
            type="error"
            title="危险操作"
            description="此示例展示了 closeIcon、ui.footer、confirmButton 和 cancelButton 的自定义。"
            close-icon="i-lucide-x-circle"
            :ui="{ footer: 'justify-start' }"
            :confirm-button="{ color: 'error', label: '我已了解风险，继续' }"
            :cancel-button="{ label: '算了，取消' }"
            @close="(ok) => advancedResult = ok ? '用户已确认风险' : '用户已取消'"
          />
        </UFormField>
      </div>

      <USeparator />

      <!-- 编程式用法 -->
      <div class="grid gap-6">
        <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
          编程式 useMessageBox()
        </h3>

        <UFormField label="alert() — 六种语义类型">
          <div class="flex flex-wrap gap-2">
            <UButton color="primary" variant="soft" label="Primary" @click="showProgramAlert('primary')" />
            <UButton color="info" variant="soft" label="Info" @click="showProgramAlert('info')" />
            <UButton color="success" variant="soft" label="Success" @click="showProgramAlert('success')" />
            <UButton color="warning" variant="soft" label="Warning" @click="showProgramAlert('warning')" />
            <UButton color="error" variant="soft" label="Error" @click="showProgramAlert('error')" />
            <UButton color="neutral" variant="soft" label="Neutral" @click="showProgramAlert('neutral')" />
          </div>
          <p v-if="programAlertResult" class="mt-2 text-sm text-muted">
            {{ programAlertResult }}
          </p>
        </UFormField>

        <UFormField label="confirm() — Promise&lt;boolean&gt;">
          <div class="flex items-center gap-4">
            <UButton color="warning" variant="outline" label="删除记录" icon="i-lucide-trash-2" @click="showProgramConfirm" />
            <span v-if="programConfirmResult" class="text-sm text-muted">{{ programConfirmResult }}</span>
          </div>
        </UFormField>

        <UFormField label="高级：自定义图标 / 按钮文本 / 颜色">
          <div class="flex items-center gap-4">
            <UButton color="error" variant="outline" label="清空缓存" icon="i-lucide-database-zap" @click="showProgramAdvanced" />
            <span v-if="programAdvancedResult" class="text-sm text-muted">{{ programAdvancedResult }}</span>
          </div>
        </UFormField>
      </div>
    </div>
  </Matrix>
</template>
