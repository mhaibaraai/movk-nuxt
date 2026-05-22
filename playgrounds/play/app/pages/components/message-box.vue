<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

const messageBox = useMessageBox()
const log = ref<string[]>([])

function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 8)
}

async function openByCommand() {
  const ok = await messageBox.confirm({
    type: 'warning',
    title: '确认执行批量操作',
    description: '由 useMessageBox().confirm() 唤起，返回值会在用户确认或取消后解析。'
  })
  record(`命令式 → ${ok}`)
}

const types: SemanticColor[] = ['primary', 'info', 'success', 'warning', 'error', 'neutral']
const openMap = reactive<Record<string, boolean>>({})

const alertOpen = ref(false)
const confirmOpen = ref(false)

const labelOpen = ref(false)
const buttonPropsOpen = ref(false)

const strictOpen = ref(false)
const dismissibleOpen = ref(false)
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
    <div class="flex flex-col gap-4">
      <Showcase
        title="命令式弹窗调用"
        description="useMessageBox() 提供 alert 与 confirm 方法，无需在模板中预置组件即可等待用户决策。"
      >
        <div class="flex gap-2 flex-wrap">
          <UButton @click="openByCommand">
            打开 confirm
          </UButton>
          <UButton variant="soft" @click="messageBox.alert({ type: 'success', title: '操作已完成', description: 'alert 关闭后 Promise 会解析，日志记录关闭时机。' }).then(() => record('alert closed'))">
            打开 alert
          </UButton>
        </div>
      </Showcase>

      <Showcase
        title="按 type 呈现语义反馈"
        description="primary、info、success、warning、error、neutral 会同步影响图标、确认按钮颜色和视觉优先级。"
      >
        <div class="flex flex-wrap gap-2">
          <template v-for="t in types" :key="t">
            <UButton :color="t === 'primary' ? 'primary' : t" variant="soft" size="sm" @click="openMap[t] = true">
              {{ t }}
            </UButton>
            <MMessageBox
              v-model:open="openMap[t]"
              :type="t"
              mode="confirm"
              :title="`${t} 语义确认`"
              description="点击确认或取消后关闭弹窗，并返回对应的布尔结果。"
              @close="(ok: boolean) => record(`${t} → ${ok}`)"
            />
          </template>
        </div>
      </Showcase>

      <Showcase
        title="区分提示与确认模式"
        description="alert 只呈现确认按钮并用于告知结果，confirm 同时提供取消与确认并返回用户选择。"
      >
        <div class="flex gap-2">
          <UButton variant="soft" @click="alertOpen = true">
            打开 alert
          </UButton>
          <UButton @click="confirmOpen = true">
            打开 confirm
          </UButton>

          <MMessageBox
            v-model:open="alertOpen"
            type="info"
            mode="alert"
            title="通知处理结果"
            description="该模式只显示「知道了」按钮，关闭后返回 true。"
            @close="(ok: boolean) => record(`alert → ${ok}`)"
          />
          <MMessageBox
            v-model:open="confirmOpen"
            type="warning"
            mode="confirm"
            title="确认提交变更"
            description="点击确认返回 true，点击取消返回 false，结果会写入日志。"
            @close="(ok: boolean) => record(`confirm → ${ok}`)"
          />
        </div>
      </Showcase>

      <Showcase
        title="定制按钮文案与属性"
        description="confirmLabel、cancelLabel 改写文案，confirmButton、cancelButton 透传 ButtonProps 调整图标和样式。"
      >
        <div class="flex gap-2">
          <UButton variant="outline" @click="labelOpen = true">
            自定义文案
          </UButton>
          <UButton variant="outline" @click="buttonPropsOpen = true">
            透传 ButtonProps
          </UButton>

          <MMessageBox
            v-model:open="labelOpen"
            type="primary"
            mode="confirm"
            title="确认接受服务协议"
            description="按钮文案由 confirmLabel 与 cancelLabel 控制，关闭结果会回传给调用方。"
            confirm-label="我同意"
            cancel-label="再想想"
            @close="(ok: boolean) => record(`label → ${ok}`)"
          />
          <MMessageBox
            v-model:open="buttonPropsOpen"
            type="info"
            mode="confirm"
            title="继续后续流程"
            description="confirmButton 与 cancelButton 接收完整 ButtonProps，可为不同操作配置图标、颜色和 variant。"
            :confirm-button="{ label: '继续', icon: 'i-lucide-arrow-right', color: 'info' }"
            :cancel-button="{ label: '取消', variant: 'ghost' }"
            @close="(ok: boolean) => record(`buttonProps → ${ok}`)"
          />
        </div>
      </Showcase>

      <Showcase
        title="控制非按钮关闭策略"
        description="dismissible 默认为 false；开启后点击遮罩或按 Esc 也会关闭，并通过 close(false) 标记为未确认。"
      >
        <div class="flex gap-2">
          <UButton color="neutral" variant="outline" @click="strictOpen = true">
            严格模式（默认）
          </UButton>
          <UButton color="neutral" variant="outline" @click="dismissibleOpen = true">
            可点遮罩关闭
          </UButton>

          <MMessageBox
            v-model:open="strictOpen"
            type="error"
            mode="confirm"
            title="严格确认高风险操作"
            description="只能通过取消或确认按钮关闭，Esc 与遮罩点击不会改变打开状态。"
            @close="(ok: boolean) => record(`strict → ${ok}`)"
          />
          <MMessageBox
            v-model:open="dismissibleOpen"
            type="neutral"
            mode="confirm"
            title="允许快速放弃操作"
            description="按 Esc 或点击遮罩会关闭弹窗，并以 false 通知父组件。"
            dismissible
            @close="(ok: boolean) => record(`dismissible → ${ok}`)"
          />
        </div>
      </Showcase>
    </div>

    <StateViewer :state="log" label="日志" />
  </div>
</template>
