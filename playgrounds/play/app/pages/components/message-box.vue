<script setup lang="ts">
import type { SemanticColor } from '@movk/nuxt'

const messageBox = useMessageBox()
const log = ref<string[]>([])

function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 12)
}

const types: SemanticColor[] = ['primary', 'info', 'success', 'warning', 'error', 'neutral']

const controlledOpen = ref(false)

async function openByCommand() {
  const ok = await messageBox.confirm({
    type: 'warning',
    title: '确认执行批量操作',
    description: '由 useMessageBox().confirm() 唤起，返回值会在用户确认或取消后解析。'
  })
  record(`命令式 → ${ok}`)
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
    <div class="flex flex-col gap-4">
      <Showcase
        title="基础用法"
        description="default 插槽放置触发元素，无需 v-model:open 即可由 UModal 自动开关。"
      >
        <MMessageBox
          title="提交保存"
          description="点击「知道了」关闭弹窗，关闭事件会写入日志面板。"
          @close="(ok: boolean) => record(`基础 → ${ok}`)"
        >
          <UButton label="打开弹窗" />
        </MMessageBox>
      </Showcase>

      <Showcase
        title="受控状态"
        description="通过 v-model:open 外部控制开关，适合编程式触发与多按钮联动。"
      >
        <div class="flex gap-2">
          <UButton variant="soft" @click="controlledOpen = true">
            外部按钮打开
          </UButton>
          <UButton color="neutral" variant="outline" @click="controlledOpen = false">
            外部按钮关闭
          </UButton>
          <MMessageBox
            v-model:open="controlledOpen"
            mode="confirm"
            type="primary"
            title="确认执行同步"
            :dismissible="false"
            :modal="false"
            description="open 由父组件持有，可被任意按钮、定时器或异步任务触发。"
            @close="(ok: boolean) => record(`受控 → ${ok}`)"
          />
        </div>
      </Showcase>

      <Showcase
        title="提示与确认模式"
        description="alert 仅显示确认按钮，confirm 同时提供取消与确认并返回布尔结果。"
      >
        <div class="flex gap-2">
          <MMessageBox
            mode="alert"
            type="info"
            title="通知处理结果"
            description="该模式只显示「知道了」按钮，关闭后返回 true。"
            @close="(ok: boolean) => record(`alert → ${ok}`)"
          >
            <UButton variant="soft" label="alert" />
          </MMessageBox>
          <MMessageBox
            mode="confirm"
            type="warning"
            title="确认提交变更"
            description="点击确认返回 true，点击取消返回 false。"
            @close="(ok: boolean) => record(`confirm → ${ok}`)"
          >
            <UButton label="confirm" />
          </MMessageBox>
        </div>
      </Showcase>

      <Showcase
        title="语义类型"
        description="type 影响默认图标与确认按钮颜色，包含六种语义化值。"
      >
        <div class="flex flex-wrap gap-2">
          <MMessageBox
            v-for="t in types"
            :key="t"
            :type="t"
            mode="confirm"
            :title="`${t} 语义确认`"
            description="点击确认或取消后关闭弹窗，并返回对应的布尔结果。"
            @close="(ok: boolean) => record(`${t} → ${ok}`)"
          >
            <UButton :color="t === 'primary' ? 'primary' : t" variant="soft" size="sm" :label="t" />
          </MMessageBox>
        </div>
      </Showcase>

      <Showcase
        title="自定义图标"
        description="icon 覆盖 type 默认图标，传入任意 Iconify 图标名称。"
      >
        <MMessageBox
          type="success"
          icon="i-lucide-rocket"
          title="部署完成"
          description="覆盖默认的 i-lucide-circle-check，使用火箭图标突出场景。"
          @close="(ok: boolean) => record(`icon → ${ok}`)"
        >
          <UButton variant="soft" color="success" label="部署完成" />
        </MMessageBox>
      </Showcase>

      <Showcase
        title="自定义文案"
        description="confirmLabel、cancelLabel、alertConfirmLabel 改写按钮文案。"
      >
        <div class="flex gap-2">
          <MMessageBox
            mode="alert"
            type="info"
            title="服务公告"
            description="alertConfirmLabel 控制 alert 模式按钮文案。"
            alert-confirm-label="我已知晓"
            @close="(ok: boolean) => record(`alertLabel → ${ok}`)"
          >
            <UButton variant="outline" label="alert 文案" />
          </MMessageBox>
          <MMessageBox
            mode="confirm"
            type="primary"
            title="确认接受服务协议"
            description="confirmLabel 与 cancelLabel 同时改写。"
            confirm-label="我同意"
            cancel-label="再想想"
            @close="(ok: boolean) => record(`label → ${ok}`)"
          >
            <UButton variant="outline" label="confirm 文案" />
          </MMessageBox>
        </div>
      </Showcase>

      <Showcase
        title="透传按钮属性"
        description="confirmButton、cancelButton 接收完整 ButtonProps，可定制 icon、color、variant。"
      >
        <MMessageBox
          mode="confirm"
          type="info"
          title="继续后续流程"
          description="按钮属性通过 confirmButton / cancelButton 直接透传给底层 UButton。"
          :confirm-button="{ label: '继续', icon: 'i-lucide-arrow-right', color: 'info' }"
          :cancel-button="{ label: '取消', variant: 'ghost' }"
          @close="(ok: boolean) => record(`buttonProps → ${ok}`)"
        >
          <UButton variant="outline" label="按钮属性" />
        </MMessageBox>
      </Showcase>

      <Showcase
        title="关闭策略"
        description="dismissible 默认 false 严格模式；开启后允许点击遮罩或按 Esc 关闭。"
      >
        <div class="flex gap-2">
          <MMessageBox
            mode="confirm"
            type="error"
            title="严格确认高风险操作"
            description="只能通过取消或确认按钮关闭，Esc 与遮罩点击不会改变打开状态。"
            @close="(ok: boolean) => record(`strict → ${ok}`)"
          >
            <UButton color="neutral" variant="outline" label="严格模式" />
          </MMessageBox>
          <MMessageBox
            mode="confirm"
            type="neutral"
            title="允许快速放弃操作"
            description="按 Esc 或点击遮罩会关闭弹窗，并以 false 通知父组件。"
            dismissible
            @close="(ok: boolean) => record(`dismissible → ${ok}`)"
          >
            <UButton color="neutral" variant="outline" label="可遮罩关闭" />
          </MMessageBox>
        </div>
      </Showcase>

      <Showcase
        title="正文插槽"
        description="body 插槽渲染富文本正文，slot 参数 close 可在正文内主动关闭弹窗。"
      >
        <MMessageBox
          mode="confirm"
          type="primary"
          title="服务条款更新"
          @close="(ok: boolean) => record(`body → ${ok}`)"
        >
          <UButton color="primary" variant="soft" icon="i-lucide-file-text" label="阅读条款" />
          <template #body="{ close }">
            <p class="text-sm text-muted">
              我们对服务条款进行了以下更新，请仔细阅读：
            </p>
            <ul class="mt-2 space-y-1 text-sm list-disc list-inside text-muted">
              <li>数据收集范围已缩减</li>
              <li>用户隐私保护条款已加强</li>
              <li>退款政策已更新</li>
            </ul>
            <UButton
              class="mt-3"
              size="xs"
              variant="ghost"
              color="neutral"
              label="先取消，稍后阅读"
              @click="close"
            />
          </template>
        </MMessageBox>
      </Showcase>

      <Showcase
        title="标题插槽"
        description="title 插槽完全接管标题区，覆盖默认的图标加文本组合。"
      >
        <MMessageBox
          mode="confirm"
          type="primary"
          title="原标题文案"
          description="标题区由 #title 插槽决定，原 title prop 不会渲染。"
          @close="(ok: boolean) => record(`title → ${ok}`)"
        >
          <UButton variant="outline" label="自定义标题" />
          <template #title>
            <UIcon name="i-lucide-sparkles" class="size-5 text-primary" />
            <span class="font-bold text-primary">完全自定义的标题样式</span>
            <UBadge color="primary" variant="subtle" label="NEW" />
          </template>
        </MMessageBox>
      </Showcase>

      <Showcase
        title="描述插槽"
        description="description 插槽支持富文本描述，可与 title prop 配合工作。"
      >
        <MMessageBox
          mode="alert"
          type="info"
          title="版本更新说明"
          @close="(ok: boolean) => record(`description → ${ok}`)"
        >
          <UButton variant="outline" label="查看说明" />
          <template #description>
            <span class="text-sm">
              v2.0 已发布，详见
              <a href="#" class="text-primary underline">完整变更日志</a>
              ，或继续使用旧版。
            </span>
          </template>
        </MMessageBox>
      </Showcase>

      <Showcase
        title="头部插槽"
        description="header 插槽完整接管 title 与 description 容器，可自定义布局与排版。"
      >
        <MMessageBox
          mode="confirm"
          type="warning"
          title="原标题"
          description="原描述"
          @close="(ok: boolean) => record(`header → ${ok}`)"
        >
          <UButton variant="outline" label="自定义头部" />
          <template #header>
            <div class="flex items-center gap-3 p-4 bg-warning/10 rounded-t-lg">
              <UIcon name="i-lucide-triangle-alert" class="size-8 text-warning" />
              <div>
                <div class="font-semibold">
                  高风险操作
                </div>
                <div class="text-xs text-muted">
                  头部插槽自定义整块布局
                </div>
              </div>
            </div>
          </template>
        </MMessageBox>
      </Showcase>

      <Showcase
        title="操作插槽"
        description="footer 插槽完全接管按钮区，slot 参数 close 用于关闭弹窗。"
      >
        <MMessageBox
          mode="confirm"
          type="primary"
          title="步进式确认"
          description="footer 插槽接管按钮区，可自由组合多按钮、分组、状态等。"
          @close="(ok: boolean) => record(`footer → ${ok}`)"
        >
          <UButton variant="outline" label="自定义操作" />
          <template #footer="{ close }">
            <UButton color="neutral" variant="ghost" label="稍后处理" @click="close" />
            <UButton color="warning" variant="soft" label="保留并继续" @click="close" />
            <UButton color="primary" label="立即应用" @click="close" />
          </template>
        </MMessageBox>
      </Showcase>

      <Showcase
        title="关闭按钮插槽"
        description="close 插槽自定义右上角关闭按钮，可改 icon、color 与样式。"
      >
        <MMessageBox
          mode="alert"
          type="info"
          title="自定义关闭按钮"
          description="close 插槽完全替换默认关闭按钮。"
          @close="(ok: boolean) => record(`close → ${ok}`)"
        >
          <UButton variant="outline" label="查看" />
          <template #close>
            <UButton size="xs" color="error" variant="ghost" icon="i-lucide-x-circle" />
          </template>
        </MMessageBox>
      </Showcase>

      <Showcase
        title="内容插槽"
        description="content 插槽替代 header / body / footer 的整体布局，适合极致定制场景。"
      >
        <MMessageBox
          title="原标题"
          @close="(ok: boolean) => record(`content → ${ok}`)"
        >
          <UButton variant="soft" color="primary" label="极致定制" />
          <template #content="{ close }">
            <div class="p-6 flex flex-col items-center gap-4 text-center">
              <UIcon name="i-lucide-party-popper" class="size-12 text-primary" />
              <div class="text-lg font-semibold">
                恭喜达成成就
              </div>
              <p class="text-sm text-muted">
                content 插槽替代 header/body/footer 三段式，可完全自定义内部结构。
              </p>
              <UButton label="收下奖励" @click="close" />
            </div>
          </template>
        </MMessageBox>
      </Showcase>

      <Showcase
        title="命令式调用"
        description="useMessageBox() 提供 alert 与 confirm 方法，可在任意逻辑中等待用户决策。"
      >
        <div class="flex gap-2 flex-wrap">
          <UButton @click="openByCommand">
            打开 confirm
          </UButton>
          <UButton
            variant="soft"
            @click="messageBox.alert({ type: 'success', title: '操作已完成', description: 'alert 关闭后 Promise 会解析。' }).then(() => record('命令式 alert closed'))"
          >
            打开 alert
          </UButton>
        </div>
      </Showcase>
    </div>

    <StateViewer :state="log" label="日志" />
  </div>
</template>
