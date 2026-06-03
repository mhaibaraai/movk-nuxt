<script setup lang="ts">
import type { SemanticSize, SemanticColor } from '@movk/nuxt'

const sizes: SemanticSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const colors: SemanticColor[] = ['primary', 'info', 'warning', 'neutral', 'error', 'success']

const attrs = ref({
  size: ['md'] as SemanticSize[],
  color: ['primary'] as SemanticColor[]
})

const text = ref('Hello Movk')
const password = ref('s3cret-pass')
const limited = ref('')
const labeled = ref('')
const copyable = ref('https://movk.dev')
const formFieldValue = ref('Field value')
const fieldGroupValue = ref('Group value')

const clearValue = ref('点击尾部按钮清空')
const copyValue = ref('https://movk.dev')
const passwordValue = ref('s3cret-pass')
const limitValue = ref('计数会随输入更新')
const floatingValue = ref('')

const log = ref<string[]>([])
function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] ${msg}`, ...log.value].slice(0, 8)
}
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.size" :items="sizes" multiple size="xs" placeholder="size" />
    <USelect v-model="attrs.color" :items="colors" multiple size="xs" placeholder="color" />
  </Navbar>

  <div class="p-4 flex flex-col gap-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Showcase
        title="继承字段上下文"
        description="包装输入组件会把 UFormField 的 size、错误态和可访问性信息传递给内部 UInput。"
        :state="{ value: formFieldValue }"
      >
        <UFormField label="WithClear" size="xs" error="示例错误态">
          <MWithClear v-model="formFieldValue" placeholder="可清除" />
        </UFormField>
      </Showcase>

      <Showcase
        title="融入`UFieldGroup`"
        description="与按钮放入 UFieldGroup 后共享尺寸和圆角，输入框与操作按钮保持一体化边界。"
        :state="{ value: fieldGroupValue }"
      >
        <UFieldGroup size="xs" class="w-full">
          <MWithClear v-model="fieldGroupValue" placeholder="搜索关键字" />
          <UButton icon="i-lucide-search" color="neutral" variant="subtle" />
        </UFieldGroup>
      </Showcase>

      <Showcase
        title="一键清除输入"
        description="WithClear 有值时显示清除按钮，点击清空并触发 clear 事件，buttonProps 可定制该按钮。"
        :state="{ value: clearValue }"
      >
        <MWithClear
          v-model="clearValue"
          placeholder="输入后出现清除按钮"
          :button-props="{ icon: 'i-lucide-eraser', color: 'error', variant: 'ghost' }"
          @clear="record('WithClear → clear')"
        />
      </Showcase>

      <Showcase
        title="复制输入内容"
        description="WithCopy 在尾部提供复制按钮，复制成功触发 copy 事件，tooltipProps 调整提示气泡。"
        :state="{ value: copyValue }"
      >
        <MWithCopy
          v-model="copyValue"
          :tooltip-props="{ text: '复制链接' }"
          @copy="(v: string) => record(`WithCopy → copy: ${v}`)"
        />
      </Showcase>

      <Showcase
        title="切换密码可见"
        description="WithPasswordToggle 固定为密码输入，尾部按钮在明文与密文之间切换显示。"
        :state="{ value: passwordValue }"
      >
        <MWithPasswordToggle v-model="passwordValue" placeholder="请输入密码" />
      </Showcase>

      <Showcase
        title="限制输入字数"
        description="WithCharacterLimit 通过 maxLength 设定上限，并实时展示已输入与剩余字数。"
        :state="{ value: limitValue, length: limitValue.length }"
      >
        <MWithCharacterLimit v-model="limitValue" :maxlength="20" placeholder="最多 20 字" />
      </Showcase>

      <Showcase
        title="浮动标签输入"
        description="WithFloatingLabel 的 label 在聚焦或有值时上浮，clearButtonProps 定制内置清除按钮。"
        :state="{ value: floatingValue }"
      >
        <MWithFloatingLabel
          v-model="floatingValue"
          label="电子邮箱"
          placeholder=" "
          :clear-button-props="{ color: 'neutral' }"
          @clear="record('WithFloatingLabel → clear')"
        />
      </Showcase>

      <Showcase title="交互事件日志" description="清除与复制操作都会写入日志，便于核对 clear 与 copy 事件的触发时机。">
        <StateViewer :state="log" label="事件日志" />
      </Showcase>
    </div>

    <Matrix v-slot="props" :attrs="attrs" cell-class="w-72">
      <UFormField label="WithClear">
        <MWithClear v-model="text" :size="props.size" :color="props.color" placeholder="可清除" />
      </UFormField>

      <UFormField label="WithCopy">
        <MWithCopy v-model="copyable" :size="props.size" :color="props.color" />
      </UFormField>

      <UFormField label="WithPasswordToggle">
        <MWithPasswordToggle v-model="password" :size="props.size" :color="props.color" />
      </UFormField>

      <UFormField label="WithCharacterLimit">
        <MWithCharacterLimit v-model="limited" :size="props.size" :color="props.color" :maxlength="20" />
      </UFormField>

      <UFormField label="WithFloatingLabel">
        <MWithFloatingLabel v-model="labeled" :size="props.size" :color="props.color" placeholder=" " label="电子邮箱" />
      </UFormField>
    </Matrix>
  </div>
</template>
