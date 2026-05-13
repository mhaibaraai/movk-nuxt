<script setup lang="ts">
import theme from '#build/movk-ui/popconfirm'
import type { SemanticColor } from '@movk/nuxt'

const types = Object.keys(theme.variants.type) as SemanticColor[]

const log = ref<string[]>([])
function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 8)
}

async function asyncConfirm() {
  await new Promise(r => setTimeout(r, 1200))
  record('async confirmed')
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
    <div class="flex flex-col gap-4">
      <Showcase title="按 type 区分语义" description="primary / info / success / warning / error / neutral">
        <div class="flex flex-wrap gap-2">
          <MPopconfirm
            v-for="t in types"
            :key="t"
            :type="t"
            :title="`${t} 类型`"
            description="是否确认此操作？"
            @confirm="record(`${t} confirmed`)"
            @cancel="record(`${t} cancelled`)"
          >
            <UButton :color="t === 'primary' ? 'primary' : t" variant="soft" size="sm">
              {{ t }}
            </UButton>
          </MPopconfirm>
        </div>
      </Showcase>

      <Showcase title="异步 onConfirm" description="返回 Promise 时确认按钮自动 loading，1.2s 后关闭">
        <div class="flex gap-2">
          <MPopconfirm
            type="warning"
            title="删除资源"
            description="该操作不可恢复"
            :on-confirm="asyncConfirm"
            :confirm-button="{ color: 'error', label: '删除' }"
          >
            <UButton color="error" variant="soft" icon="i-lucide-trash-2">
              异步删除
            </UButton>
          </MPopconfirm>

          <MPopconfirm
            type="error"
            title="拒绝执行"
            description="onConfirm 抛出错误时弹层不关闭"
            :on-confirm="() => { throw new Error('被拒绝') }"
            @error="(e: unknown) => record(`error: ${(e as Error).message}`)"
          >
            <UButton color="error" variant="outline">
              抛错保留
            </UButton>
          </MPopconfirm>
        </div>
      </Showcase>

      <Showcase title="自定义按钮 / 隐藏取消" description="cancelButton=false 隐藏取消按钮，confirmButton 透传 ButtonProps">
        <div class="flex gap-2">
          <MPopconfirm
            title="单按钮模式"
            :cancel-button="false"
            :confirm-button="{ label: '我知道了' }"
            class="w-30"
          >
            <UButton variant="soft">
              仅确认
            </UButton>
          </MPopconfirm>

          <MPopconfirm
            type="info"
            title="自定义文案"
            :confirm-button="{ label: '继续', icon: 'i-lucide-arrow-right', color: 'info' }"
            :cancel-button="{ label: '再想想', variant: 'ghost' }"
          >
            <UButton variant="outline">
              文案定制
            </UButton>
          </MPopconfirm>
        </div>
      </Showcase>
    </div>

    <StateViewer :state="log" label="事件日志" />
  </div>
</template>
