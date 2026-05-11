<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

const { alert, confirm } = useMessageBox()
const log = ref<string[]>([])

function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 8)
}

const types: SemanticColor[] = ['primary', 'info', 'success', 'warning', 'error', 'neutral']

async function showAlert(type: SemanticColor) {
  await alert({ type, title: `${type} alert`, description: '这是一个 alert 模式弹窗' })
  record(`alert(${type}) closed`)
}

async function showConfirm(type: SemanticColor) {
  const ok = await confirm({
    type,
    title: `${type} confirm`,
    description: '请确认是否执行此操作'
  })
  record(`confirm(${type}) → ${ok}`)
}

async function showAsync() {
  const ok = await confirm({
    type: 'warning',
    title: '异步操作',
    description: '点击确认后将等待 1.5s 模拟网络请求',
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
      <Showcase title="alert 模式" description="只有确认按钮，await 直到关闭">
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

      <Showcase title="confirm 模式" description="返回 boolean，确认/取消语义清晰">
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

      <Showcase title="异步流程" description="await 拿到结果后再继续后续逻辑">
        <UButton color="warning" icon="i-lucide-zap" @click="showAsync">
          运行异步流程
        </UButton>
      </Showcase>
    </div>

    <StateViewer :state="log" label="返回值日志" />
  </div>
</template>
