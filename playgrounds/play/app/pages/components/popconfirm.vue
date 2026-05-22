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
      <Showcase title="按 type 呈现确认语义" description="primary、info、success、warning、error、neutral 会影响图标、按钮颜色和弹层语气。">
        <div class="flex flex-wrap gap-2">
          <MPopconfirm
            v-for="t in types"
            :key="t"
            :type="t"
            :title="`${t} 语义确认`"
            description="确认或取消都会关闭弹层并触发对应事件。"
            @confirm="record(`${t} confirmed`)"
            @cancel="record(`${t} cancelled`)"
          >
            <UButton :color="t === 'primary' ? 'primary' : t" variant="soft" size="sm">
              {{ t }}
            </UButton>
          </MPopconfirm>
        </div>
      </Showcase>

      <Showcase title="异步确认流程" description="onConfirm 返回 Promise 时确认按钮自动进入 loading，成功解析后关闭弹层。">
        <div class="flex gap-2">
          <MPopconfirm
            type="warning"
            title="确认删除资源"
            description="确认按钮会等待异步删除完成，完成后关闭弹层并记录事件。"
            :on-confirm="asyncConfirm"
            :confirm-button="{ color: 'error', label: '删除' }"
          >
            <UButton color="error" variant="soft" icon="i-lucide-trash-2">
              异步删除
            </UButton>
          </MPopconfirm>

          <MPopconfirm
            type="error"
            title="阻止危险操作"
            description="onConfirm 抛出错误时弹层保持打开，并通过 error 事件暴露异常。"
            :on-confirm="() => { throw new Error('被拒绝') }"
            @error="(e: unknown) => record(`error: ${(e as Error).message}`)"
          >
            <UButton color="error" variant="outline">
              抛错保留
            </UButton>
          </MPopconfirm>
        </div>
      </Showcase>

      <Showcase title="定制确认按钮区域" description="cancelButton 设为 false 可隐藏取消按钮，confirmButton 与 cancelButton 可透传 ButtonProps。">
        <div class="flex gap-2">
          <MPopconfirm
            title="只展示确认入口"
            description="隐藏取消按钮后，弹层只保留一个确认动作，适合不可逆提示前的知情确认。"
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
            title="继续当前流程"
            description="通过 confirmButton 与 cancelButton 分别配置按钮文案、图标、颜色和 variant。"
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
