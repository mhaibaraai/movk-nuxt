<script setup lang="ts">
import type { SemanticSize } from '@movk/nuxt'

const sizes: SemanticSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

const attrs = ref({
  size: ['md'] as SemanticSize[]
})

const log = ref<string[]>([])
const reloadKey = ref(0)
const formFieldVerified = ref(false)
const fieldGroupVerified = ref(false)
const fieldGroupKey = ref(0)

function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] ${msg}`, ...log.value].slice(0, 8)
}

function reset() {
  reloadKey.value++
  log.value = []
}

function resetFieldGroup() {
  fieldGroupVerified.value = false
  fieldGroupKey.value++
}
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes" multiple size="xs" placeholder="size" />
    <UButton size="xs" variant="outline" icon="i-lucide-rotate-ccw" @click="reset">
      重置
    </UButton>
  </Navbar>

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="继承字段上下文" description="放入 UFormField 后接收字段尺寸与错误态，滑块按表单状态渲染。" :state="{ value: formFieldVerified }">
      <UFormField label="滑动验证" size="xs" error="示例错误态">
        <MSlideVerify v-model="formFieldVerified" />
      </UFormField>
    </Showcase>

    <Showcase title="融入分组控件" description="与重置按钮组合时共享 UFieldGroup 尺寸，滑块区域和按钮保持统一高度。" :state="{ value: fieldGroupVerified }">
      <UFieldGroup size="xs" class="w-full">
        <MSlideVerify :key="fieldGroupKey" v-model="fieldGroupVerified" class="flex-1" />
        <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="subtle" @click="resetFieldGroup" />
      </UFieldGroup>
    </Showcase>

    <Showcase title="调整通过阈值" description="threshold 决定拖动占比达到多少判定通过，默认 0.9，调低可放宽校验。">
      <div class="flex flex-col gap-3">
        <MSlideVerify :key="`strict-${reloadKey}`" text="严格：拖到 90%" />
        <MSlideVerify :key="`loose-${reloadKey}`" :threshold="0.5" text="宽松：拖到一半即可" />
      </div>
    </Showcase>

    <Showcase title="自定义提示文案" description="text 设定待验证提示，successText 设定通过后的文案。">
      <MSlideVerify :key="`text-${reloadKey}`" text="按住并向右拖动" success-text="人机校验已通过" />
    </Showcase>

    <Showcase title="替换滑块图标" description="icon 设定待验证图标，successIcon 设定通过后的图标。">
      <MSlideVerify :key="`icon-${reloadKey}`" icon="i-lucide-arrow-right" success-icon="i-lucide-shield-check" />
    </Showcase>

    <Showcase title="禁用滑动验证" description="disabled 冻结滑块，光标不可拖动且保持当前未验证态。">
      <MSlideVerify disabled />
    </Showcase>

    <Showcase title="自定义滑块内容" description="slider 插槽接管滑块内部渲染，可读取 verified 与 progress 动态展示进度。">
      <MSlideVerify :key="`slot-${reloadKey}`">
        <template #slider="{ verified, progress }">
          <UIcon v-if="verified" name="i-lucide-check" />
          <span v-else class="text-xs font-medium">{{ Math.round(progress * 100) }}%</span>
        </template>
      </MSlideVerify>
    </Showcase>

    <Showcase
      title="事件回调"
      description="开始拖动触发 dragStart，松手触发 dragEnd 并回传是否成功，达到阈值额外触发 success。"
    >
      <MSlideVerify
        :key="`events-${reloadKey}`"
        @drag-start="record('dragStart')"
        @drag-end="(ok) => record(`dragEnd → ${ok ? '成功' : '失败'}`)"
        @success="record('success')"
      />
      <template #aside>
        <StateViewer :state="log" label="事件日志" />
      </template>
    </Showcase>
  </div>

  <Matrix v-slot="props" :attrs="attrs" cell-class="w-64">
    <MSlideVerify :key="`m-${props.size}-${reloadKey}`" :size="props.size" />
  </Matrix>
</template>
