<script setup lang="ts">
import { formatBytes } from '../../utils'

const log = ref<string[]>([])
function push(line: string) {
  log.value.unshift(`${new Date().toLocaleTimeString()} ${line}`)
}

// 共享选择文件
const selected = ref<File[]>([])
function onChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  selected.value = files ? Array.from(files) : []
}

// 基础：多文件 + fieldName
const basic = useUploadWithProgress<{ files: Array<{ name: string, size: number }> }>()

// 单文件 + 额外字段
const single = useUploadWithProgress()

// 业务错误
const fail = useUploadWithProgress()

// HTTP 错误
const httpErr = useUploadWithProgress()

// 超时演示
const timeout = useUploadWithProgress()

// toast 关闭
const silent = useUploadWithProgress()

const tip = (s: string, e: { message: string } | null) => {
  if (s === 'pending') return '上传中'
  if (s === 'aborted') return '已取消'
  if (s === 'error') return e?.message || '失败'
  if (s === 'success') return '完成'
  return '空闲'
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
    <div class="flex flex-col gap-4">
      <Showcase
        title="选择文件"
        :description="`选择器缓存 ${selected.length} 个文件，下方 Showcase 共享此列表`"
      >
        <input type="file" multiple class="text-sm" @change="onChange">
        <ul class="text-sm flex flex-col gap-1">
          <li v-for="f in selected" :key="f.name" class="flex justify-between gap-3">
            <span class="truncate">{{ f.name }}</span>
            <span class="text-muted shrink-0">{{ formatBytes(f.size) }}</span>
          </li>
        </ul>
      </Showcase>

      <Showcase
        title="基础多文件上传"
        description="POST /api/upload，fieldName=files；data 是解包后的业务数据（files 列表）"
      >
        <div class="flex gap-2">
          <UButton
            :loading="basic.status.value === 'pending'"
            :disabled="!selected.length"
            icon="i-lucide-upload"
            @click="async () => {
              const r = await basic.upload('/upload', selected, {
                fieldName: 'files',
                onSuccess: d => push(`基础: ${d.files.length} 个文件`)
              })
              push(`基础: aborted=${r.aborted}`)
            }"
          >
            开始上传
          </UButton>
          <UButton
            v-if="basic.status.value === 'pending'"
            color="error"
            variant="soft"
            icon="i-lucide-x"
            @click="basic.abort"
          >
            中止
          </UButton>
        </div>
        <UProgress :model-value="basic.progress.value ?? undefined" :max="100" />
        <p class="text-sm text-muted">
          {{ basic.progress.value ?? 0 }}% · {{ tip(basic.status.value, basic.error.value) }}
        </p>
        <pre v-if="basic.data.value" class="text-xs bg-muted/40 rounded p-2 overflow-auto">{{ basic.data.value }}</pre>
      </Showcase>

      <Showcase
        title="单文件 + 额外字段"
        description="files 传 File（非数组），fields 注入业务字段一并提交"
      >
        <UButton
          :disabled="!selected.length"
          icon="i-lucide-upload-cloud"
          @click="single.upload('/upload', selected[0]!, {
            fields: { folder: 'avatars', visibility: 'private' },
            onSuccess: () => push('单文件: 完成')
          })"
        >
          上传第一项
        </UButton>
        <p class="text-sm text-muted">
          {{ single.progress.value ?? 0 }}% · {{ tip(single.status.value, single.error.value) }}
        </p>
      </Showcase>

      <Showcase
        title="业务错误（?fail=1）"
        description="后端返回 code 40001，走业务校验失败链路：error 为 ApiError、派发 movk:api:error"
      >
        <UButton
          color="warning"
          :disabled="!selected.length"
          icon="i-lucide-shield-alert"
          @click="fail.upload('/upload?fail=1', selected, { onError: e => push(`业务错误: ${e.message}`) })"
        >
          触发业务错误
        </UButton>
        <p class="text-sm text-muted">
          {{ tip(fail.status.value, fail.error.value) }}
        </p>
      </Showcase>

      <Showcase
        title="HTTP 错误（?http=500）"
        description="后端 setResponseStatus(500)，error.message 包含 HTTP 500"
      >
        <UButton
          color="error"
          :disabled="!selected.length"
          icon="i-lucide-bug"
          @click="httpErr.upload('/upload?http=500', selected, { onError: e => push(`HTTP: ${e.message}`) })"
        >
          触发 500
        </UButton>
        <p class="text-sm text-muted">
          {{ tip(httpErr.status.value, httpErr.error.value) }}
        </p>
      </Showcase>

      <Showcase
        title="超时（timeoutMs + ?slow=2000）"
        description="timeoutMs=500，服务端延迟 2s，触发 xhr.ontimeout，error.message 提示超时毫秒"
      >
        <UButton
          color="neutral"
          :disabled="!selected.length"
          icon="i-lucide-timer"
          @click="timeout.upload('/upload?slow=2000', selected, {
            timeoutMs: 500,
            onError: e => push(`超时: ${e.message}`)
          })"
        >
          模拟超时
        </UButton>
        <p class="text-sm text-muted">
          {{ tip(timeout.status.value, timeout.error.value) }}
        </p>
      </Showcase>

      <Showcase
        title="静默模式（toast=false）"
        description="单次请求关闭成功/错误 toast，仍可通过 onSuccess / onError 自行处理"
      >
        <UButton
          variant="soft"
          :disabled="!selected.length"
          icon="i-lucide-volume-x"
          @click="silent.upload('/upload', selected, {
            toast: false,
            onSuccess: () => push('静默: 完成（无 toast）')
          })"
        >
          静默上传
        </UButton>
        <p class="text-sm text-muted">
          {{ tip(silent.status.value, silent.error.value) }}
        </p>
      </Showcase>
    </div>

    <StateViewer :state="log" label="日志" />
  </div>
</template>
