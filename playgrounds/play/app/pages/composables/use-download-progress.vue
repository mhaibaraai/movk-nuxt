<script setup lang="ts">
const log = ref<string[]>([])
function push(line: string) {
  log.value.unshift(`${new Date().toLocaleTimeString()} ${line}`)
}

// 基础用法
const basic = useDownloadWithProgress()

// 不确定进度
const chunked = useDownloadWithProgress()

// JSON 业务错误
const businessErr = useDownloadWithProgress()

// HTTP 错误
const httpErr = useDownloadWithProgress()

// 自定义 filename / headers / toast
const custom = useDownloadWithProgress()

// POST 导出
const postExport = useDownloadWithProgress()

const tip = computed(() => (s: string, e: { message: string } | null) => {
  if (s === 'pending') return '传输中'
  if (s === 'aborted') return '已取消'
  if (s === 'error') return e?.message || '失败'
  if (s === 'success') return '完成'
  return '空闲'
})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
    <div class="flex flex-col gap-4">
      <Showcase
        title="基础用法"
        description="useDownloadWithProgress 调 GET /api/download/large，content-length 已知时进度按比例更新"
      >
        <div class="flex gap-2">
          <UButton
            :loading="basic.status.value === 'pending'"
            icon="i-lucide-download"
            @click="async () => {
              const r = await basic.download('/download/large', {
                onSuccess: name => push(`基础: 下载完成 ${name}`)
              })
              push(`基础: aborted=${r.aborted} error=${r.error?.message ?? 'null'}`)
            }"
          >
            开始
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
      </Showcase>

      <Showcase
        title="不确定进度（chunked）"
        description="GET /api/download/chunked 未返回 content-length，progress 为 -1，UProgress 不绑定 model-value 进入 indeterminate"
      >
        <UButton
          :loading="chunked.status.value === 'pending'"
          icon="i-lucide-download"
          @click="chunked.download('/download/chunked', { onSuccess: n => push(`chunked: ${n}`) })"
        >
          开始
        </UButton>
        <UProgress
          :model-value="chunked.progress.value ?? undefined"
          :max="100"
        />
        <p class="text-sm text-muted">
          {{ chunked.progress.value === null ? '不确定' : `${chunked.progress.value}%` }}
          · {{ tip(chunked.status.value, chunked.error.value) }}
        </p>
      </Showcase>

      <Showcase
        title="JSON 业务错误不触发下载"
        description="GET /api/download/error 返回 application/json + code 40301，走业务校验链路，不会把错误写成文件"
      >
        <UButton
          color="warning"
          icon="i-lucide-shield-alert"
          @click="businessErr.download('/download/error', { onError: e => push(`业务错误: ${e.message}`) })"
        >
          触发业务错误
        </UButton>
        <p class="text-sm text-muted">
          状态：{{ tip(businessErr.status.value, businessErr.error.value) }}
        </p>
      </Showcase>

      <Showcase
        title="HTTP 错误"
        description="访问不存在的路径，返回 404；error.message 带状态码，error 类型非 ApiError"
      >
        <UButton
          color="error"
          icon="i-lucide-bug"
          @click="httpErr.download('/download/not-exist', { toast: false, onError: e => push(`http: ${e.message}`) })"
        >
          触发 404
        </UButton>
        <p class="text-sm text-muted">
          {{ tip(httpErr.status.value, httpErr.error.value) }}
        </p>
      </Showcase>

      <Showcase
        title="自定义 filename / headers / toast"
        description="filename 覆盖响应头；headers 透传到请求；toast 传 { successMessage } 覆盖默认成功文案"
      >
        <UButton
          icon="i-lucide-file-down"
          @click="custom.download('/download/large', {
            filename: 'custom-name.bin',
            headers: { 'X-Demo': 'movk' },
            toast: { successMessage: '导出已开始' },
            onSuccess: n => push(`自定义: ${n}`)
          })"
        >
          自定义下载
        </UButton>
        <p class="text-sm text-muted">
          {{ tip(custom.status.value, custom.error.value) }}
        </p>
      </Showcase>

      <Showcase
        title="POST 导出（body 透传）"
        description="method=POST + body，Content-Type 自动补 application/json；后端可按 body 过滤导出范围"
      >
        <UButton
          icon="i-lucide-package"
          @click="postExport.download('/download/large', {
            method: 'POST',
            body: { ids: [1, 2, 3] },
            onSuccess: n => push(`POST 导出: ${n}`)
          })"
        >
          POST 导出
        </UButton>
        <p class="text-sm text-muted">
          {{ tip(postExport.status.value, postExport.error.value) }}
        </p>
      </Showcase>
    </div>

    <StateViewer :state="log" label="日志" />
  </div>
</template>
