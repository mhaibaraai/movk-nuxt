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
    title: '命令式调用',
    description: '通过 useMessageBox().confirm() 唤起，等待用户操作'
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
        title="命令式 API"
        description="useMessageBox() 返回 alert/confirm，无需在模板中放占位组件"
      >
        <div class="flex gap-2 flex-wrap">
          <UButton @click="openByCommand">
            打开 confirm
          </UButton>
          <UButton variant="soft" @click="messageBox.alert({ type: 'success', title: '成功', description: '操作已完成' }).then(() => record('alert closed'))">
            打开 alert
          </UButton>
        </div>
      </Showcase>

      <Showcase
        title="按 type 区分语义"
        description="primary / info / success / warning / error / neutral，图标与确认按钮颜色随 type 变化"
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
              :title="`${t} 类型`"
              description="是否确认此操作？"
              @close="(ok: boolean) => record(`${t} → ${ok}`)"
            />
          </template>
        </div>
      </Showcase>

      <Showcase
        title="alert / confirm 模式对比"
        description="alert 仅显示确认按钮；confirm 同时显示取消与确认"
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
            title="alert 模式"
            description="只有「知道了」一个按钮"
            @close="(ok: boolean) => record(`alert → ${ok}`)"
          />
          <MMessageBox
            v-model:open="confirmOpen"
            type="warning"
            mode="confirm"
            title="confirm 模式"
            description="点击确认或取消，结果会写入日志"
            @close="(ok: boolean) => record(`confirm → ${ok}`)"
          />
        </div>
      </Showcase>

      <Showcase
        title="自定义按钮"
        description="confirmLabel/cancelLabel 改文案，confirmButton/cancelButton 透传 ButtonProps"
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
            title="协议确认"
            description="使用 confirmLabel / cancelLabel 改写按钮文案"
            confirm-label="我同意"
            cancel-label="再想想"
            @close="(ok: boolean) => record(`label → ${ok}`)"
          />
          <MMessageBox
            v-model:open="buttonPropsOpen"
            type="info"
            mode="confirm"
            title="ButtonProps 透传"
            description="confirmButton/cancelButton 接收完整 ButtonProps"
            :confirm-button="{ label: '继续', icon: 'i-lucide-arrow-right', color: 'info' }"
            :cancel-button="{ label: '取消', variant: 'ghost' }"
            @close="(ok: boolean) => record(`buttonProps → ${ok}`)"
          />
        </div>
      </Showcase>

      <Showcase
        title="dismissible 行为"
        description="默认 false，遮罩与 Esc 不可关；设为 true 时点遮罩或 Esc 也会关闭并 emit close(false)"
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
            title="严格模式"
            description="只能通过按钮关闭，Esc 与遮罩点击无效"
            @close="(ok: boolean) => record(`strict → ${ok}`)"
          />
          <MMessageBox
            v-model:open="dismissibleOpen"
            type="neutral"
            mode="confirm"
            title="可关闭"
            description="按 Esc 或点击遮罩关闭，会以 false 通知父组件"
            dismissible
            @close="(ok: boolean) => record(`dismissible → ${ok}`)"
          />
        </div>
      </Showcase>
    </div>

    <StateViewer :state="log" label="日志" />
  </div>
</template>
