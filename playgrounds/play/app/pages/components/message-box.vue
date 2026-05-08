<script setup lang="ts">
const messageBox = useMessageBox()
const log = ref<string[]>([])

function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 8)
}

const componentRef = ref<{ open: () => Promise<boolean> } | null>(null)

async function openByCommand() {
  const ok = await messageBox.confirm({
    type: 'warning',
    title: '命令式调用',
    description: '通过 useMessageBox().confirm() 唤起，等待用户操作'
  })
  record(`命令式 → ${ok}`)
}

async function openByRef() {
  const ok = await componentRef.value?.open()
  record(`组件 ref → ${ok}`)
}
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
        title="组件式 API"
        description="模板中放置 MMessageBox，通过 ref 控制 open"
      >
        <UButton color="neutral" variant="outline" @click="openByRef">
          通过 ref 打开
        </UButton>
        <MMessageBox
          ref="componentRef"
          type="info"
          title="组件 ref 模式"
          description="放在模板中，通过暴露的 open() 方法触发"
          mode="confirm"
        />
      </Showcase>
    </div>

    <StateViewer :state="log" label="日志" />
  </div>
</template>
