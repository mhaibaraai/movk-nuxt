<script setup lang="ts">
interface ChatChunk {
  node: string
  content: string
  nodeEnd: boolean
  done: boolean
}

const message = ref('介绍一下 movk')
const text = ref('')
const nodes = ref<string[]>([])

const { status, error, stream, abort } = useApiStream<ChatChunk>()

async function start() {
  text.value = ''
  nodes.value = []

  for await (const chunk of stream('/stream/chat', { method: 'POST', body: { message: message.value } })) {
    text.value += chunk.content

    if (chunk.nodeEnd && !nodes.value.includes(chunk.node)) {
      nodes.value = [...nodes.value, chunk.node]
    }
  }
}

const failing = useApiStream<ChatChunk>()

async function startFailing() {
  try {
    for await (const _chunk of failing.stream('/stream/error', { method: 'POST' })) {
      // 走不到这里：业务码校验先抛
    }
  }
  catch {
    // 错误已在 failing.error 与 toast 中体现
  }
}
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="基础用法"
      description="useApiStream 消费 POST /api/stream/chat 的 SSE，逐字追加；重新发起或离开页面自动中止上一条"
      :state="{ status, error: error?.message ?? null, nodes }"
    >
      <div class="flex gap-2">
        <UInput v-model="message" class="w-80" placeholder="随便说点什么" />
        <UButton :loading="status === 'streaming'" icon="i-lucide-play" @click="start">
          开始
        </UButton>
        <UButton
          v-if="status === 'streaming'"
          color="error"
          variant="soft"
          icon="i-lucide-x"
          @click="abort"
        >
          中止
        </UButton>
      </div>

      <pre class="min-h-24 whitespace-pre-wrap rounded-md bg-elevated p-3 text-sm">{{ text || '（等待输出）' }}</pre>
    </Showcase>

    <Showcase
      title="业务错误"
      description="网关把错误响应发成 HTTP 200 + code 500 的 JSON 信封；不预设 responseType 才能让它走完业务码校验"
      :state="{ status: failing.status.value, error: failing.error.value?.message ?? null }"
    >
      <UButton color="warning" icon="i-lucide-triangle-alert" @click="startFailing">
        请求错误端点
      </UButton>
    </Showcase>
  </div>
</template>
