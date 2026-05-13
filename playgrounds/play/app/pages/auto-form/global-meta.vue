<script setup lang="ts">
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

const dynamicMeta = computed(() => ({
  orientation: orientation.value,
  size: size.value
}))
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Showcase title="默认 globalMeta" description="未传 globalMeta，全部字段使用各自默认值" :state="stateA">
      <MAutoForm :schema="sharedSchema" :state="stateA" />
    </Showcase>

    <Showcase
      title="动态 globalMeta"
      description="切换右上角控件，所有字段同步更新 size / orientation"
      :state="stateB"
    >
      <template #toolbar>
        <USelect v-model="orientation" :items="orientationItems" size="xs" class="w-30" />
        <USelect v-model="size" :items="sizeItems" size="xs" class="w-20" />
      </template>
      <MAutoForm :schema="sharedSchema" :state="stateB" :global-meta="dynamicMeta" />
    </Showcase>

    <Showcase
      title="校验默认值"
      description="globalMeta 也可统一设置 validateOnInputDelay 等校验默认"
      :state="stateC"
    >
      <MAutoForm
        :schema="sharedSchema"
        :state="stateC"
        :global-meta="{ size: 'sm', validateOnInputDelay: 800 }"
        :validate-on="['input']"
      />
    </Showcase>
  </div>
</template>
