<script setup lang="ts">
const log = ref<string[]>([])

function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 8)
}

async function asyncConfirm() {
  await new Promise(resolve => setTimeout(resolve, 1200))
  record('async confirmed')
}

function rejectedConfirm() {
  throw new Error('被拒绝')
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-3">
    <div class="flex flex-wrap gap-2">
      <MPopconfirm
        type="warning"
        title="点击确认或取消"
        description="确认会触发 confirm 事件，取消会触发 cancel 事件。"
        :on-confirm="() => record('confirmed')"
        @cancel="record('cancelled')"
      >
        <UButton color="primary" variant="soft" label="同步事件" />
      </MPopconfirm>

      <MPopconfirm
        type="info"
        title="异步事件"
        description="确认按钮等待 onConfirm 异步完成后才触发 confirm 并关闭。"
        :on-confirm="asyncConfirm"
      >
        <UButton color="info" variant="soft" label="异步确认" />
      </MPopconfirm>

      <MPopconfirm
        type="error"
        title="抛错保留"
        description="onConfirm 抛出错误时弹层保持打开，并通过 error 事件暴露异常。"
        :on-confirm="rejectedConfirm"
        @error="(e: unknown) => record(`error: ${(e as Error).message}`)"
      >
        <UButton color="error" variant="outline" label="抛错保留" />
      </MPopconfirm>
    </div>

    <div class="rounded border border-default p-2 text-xs text-muted space-y-1 max-h-40 overflow-auto">
      <p v-if="!log.length">
        暂无事件记录
      </p>
      <p v-for="(item, idx) in log" :key="idx">
        {{ item }}
      </p>
    </div>
  </div>
</template>
