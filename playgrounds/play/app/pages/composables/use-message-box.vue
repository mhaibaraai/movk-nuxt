<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

const { alert, confirm } = useMessageBox()
const log = ref<string[]>([])

function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 8)
}

const types: SemanticColor[] = ['primary', 'info', 'success', 'warning', 'error', 'neutral']

async function showAlert(type: SemanticColor) {
  await alert({ type, title: `${type} alert`, description: '弹窗只暴露确认动作，关闭后 Promise 才会 resolve' })
  record(`alert(${type}) closed`)
}

async function showConfirm(type: SemanticColor) {
  const ok = await confirm({
    type,
    title: `${type} confirm`,
    description: '弹窗返回确认结果，日志会记录 true/false'
  })
  record(`confirm(${type}) → ${ok}`)
}

async function showAsync() {
  const ok = await confirm({
    type: 'warning',
    title: '异步操作',
    description: '确认后再执行模拟耗时任务，日志在流程完成时更新',
    confirmButton: { loading: false, label: '提交' }
  })
  if (ok) {
    await new Promise(r => setTimeout(r, 1500))
    record('async confirm 完成')
  }
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
    <div class="flex flex-col gap-4">
      <Showcase
        title="阻塞式提示"
        description="alert() 返回 Promise，用户关闭弹窗后才继续后续流程"
      >
        <div class="flex gap-2 flex-wrap">
          <UButton
            v-for="t in types"
            :key="`a-${t}`"
            :color="t === 'primary' ? 'primary' : (t as 'info' | 'success' | 'warning' | 'error' | 'neutral')"
            variant="soft"
            size="sm"
            @click="showAlert(t)"
          >
            alert · {{ t }}
          </UButton>
        </div>
      </Showcase>

      <Showcase
        title="确认返回布尔"
        description="confirm() 将确认或取消映射为 boolean 返回给调用方"
      >
        <div class="flex gap-2 flex-wrap">
          <UButton
            v-for="t in types"
            :key="`c-${t}`"
            :color="t === 'primary' ? 'primary' : (t as 'info' | 'success' | 'warning' | 'error' | 'neutral')"
            variant="outline"
            size="sm"
            @click="showConfirm(t)"
          >
            confirm · {{ t }}
          </UButton>
        </div>
      </Showcase>

      <Showcase
        title="异步确认流程"
        description="等待 confirm() 结果后再串行执行后续请求"
      >
        <UButton color="warning" icon="i-lucide-zap" @click="showAsync">
          运行异步流程
        </UButton>
      </Showcase>
    </div>

    <StateViewer :state="log" label="返回值日志" />
  </div>
</template>
