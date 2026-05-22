<script setup lang="ts">
import type { AutoFormProps } from '@movk/nuxt'
import type { z } from 'zod'

const { afz } = useAutoForm()

const sharedSchema = afz.object({
  name: afz.string({ controlProps: { placeholder: '请输入姓名' } }).min(2).meta({ label: '姓名' }),
  email: afz.email().meta({ label: '邮箱' }),
  age: afz.number().min(0).max(150).meta({ label: '年龄' }),
  bio: afz.string({ type: 'textarea', controlProps: { rows: 2 } }).optional().meta({ label: '简介' })
})

const stateA = reactive<Partial<z.output<typeof sharedSchema>>>({})
const stateB = reactive<Partial<z.output<typeof sharedSchema>>>({})
const stateC = reactive<Partial<z.output<typeof sharedSchema>>>({})

type Orientation = 'vertical' | 'horizontal'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const orientationItems: Orientation[] = ['vertical', 'horizontal']
const sizeItems: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']

const orientation = ref<Orientation>('horizontal')
const size = ref<Size>('sm')

const dynamicMeta = computed<AutoFormProps['globalMeta']>(() => ({
  orientation: orientation.value,
  size: size.value,
  ui: {
    label: 'whitespace-nowrap'
  }
}))
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Showcase title="字段 meta 默认值" description="未传 globalMeta 时，字段使用自身 meta() 配置或组件默认值" :state="stateA">
      <MAutoForm :schema="sharedSchema" :state="stateA" />
    </Showcase>

    <Showcase title="globalMeta 响应式覆盖" description="globalMeta 响应式下发 size、orientation 与 label UI 配置" :state="stateB">
      <template #toolbar>
        <USelect v-model="orientation" :items="orientationItems" size="xs" class="w-30" />
        <USelect v-model="size" :items="sizeItems" size="xs" class="w-20" />
      </template>
      <MAutoForm :schema="sharedSchema" :state="stateB" :global-meta="dynamicMeta" />
    </Showcase>

    <Showcase title="校验默认项下发" description="globalMeta 统一设置 validateOnInputDelay 控制输入防抖" :state="stateC">
      <MAutoForm
        :schema="sharedSchema"
        :state="stateC"
        :global-meta="{ size: 'sm', validateOnInputDelay: 800 }"
        :validate-on="['input']"
      />
    </Showcase>
  </div>
</template>
