<script setup lang="ts">
import type { PillGroupProps, PillsItem } from '@movk/nuxt'

interface User {
  id: number
  name: string
  email: string
  avatar?: { src: string }
}

const literalItems = ['grid', 'list', 'kanban']

const viewItems: PillsItem[] = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
  { label: 'Kanban', value: 'kanban' }
]

const formatItems: PillsItem[] = [
  { label: 'HEX', value: 'hex' },
  { label: 'RGB', value: 'rgb' },
  { label: 'HSL', value: 'hsl' },
  { label: 'CMYK', value: 'cmyk' }
]

const userItems = ref<User[]>([
  { id: 1, name: 'Alice', email: 'alice@movk.dev', avatar: { src: 'https://i.pravatar.cc/40?img=1' } },
  { id: 2, name: 'Bob', email: 'bob@movk.dev', avatar: { src: 'https://i.pravatar.cc/40?img=2' } },
  { id: 3, name: 'Carol', email: 'carol@movk.dev', avatar: { src: 'https://i.pravatar.cc/40?img=3' } },
  { id: 4, name: 'Dave', email: 'dave@movk.dev', avatar: { src: 'https://i.pravatar.cc/40?img=4' } }
])

const planItems: PillsItem[] = [
  { label: 'Basic', value: 'basic', description: '免费 · 5 项目' },
  { label: 'Pro', value: 'pro', description: '$9/月 · 无限项目' },
  { label: 'Team', value: 'team', description: '$29/月 · 协作' },
  { label: 'Enterprise', value: 'enterprise', description: '$99/月 · 无限项目' }
]

const periodItems: PillsItem[] = [
  { label: '本日', value: 'day' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

const techItems: PillsItem[] = [
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Solid', value: 'solid' }
]

const todoItems: PillsItem[] = [
  { label: 'Todo', value: 'todo' },
  { label: 'Doing', value: 'doing' },
  { label: 'Done', value: 'done' }
]

const trendItems: PillsItem[] = [
  { label: '热门', value: 'hot' },
  { label: '最新', value: 'new' },
  { label: '推荐', value: 'rec' }
]

const tagItems: PillsItem[] = [
  { label: '前端', value: 'fe' },
  { label: '后端', value: 'be' },
  { label: '运维', value: 'ops' },
  { label: '设计', value: 'design' }
]

const disabledItems: PillsItem[] = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list', disabled: true },
  { label: 'Kanban', value: 'kanban' }
]

// 单选 (multiple=false / 默认)
const singleScalar = ref<string | undefined>('grid')
const singleObject = ref<PillsItem | undefined>()
const singleUser = ref<User | undefined>(userItems.value[2])
const singleDeselectable = ref<string | undefined>('todo')
const singleOnSelect = ref<string | undefined>('en')
const singleDisabled = ref<string | undefined>('grid')
const singleDescription = ref<string | undefined>('basic')
const singleVertical = ref<string | undefined>('week')
const singleSlot = ref<string | undefined>('hot')
const singleMatrix = ref<string | undefined>('grid')
const formFieldCompat = ref<string | undefined>('grid')
const fieldGroupCompat = ref<string | undefined>('list')

// 多选 (multiple=true)
const multiScalar = ref<string[]>(['hex', 'rgb'])
const multiObject = ref<PillsItem[]>([{
  label: 'HSL',
  value: 'hsl'
},
{
  label: 'CMYK',
  value: 'cmyk'
}])
const multiUser = ref<User[]>([])
const multiOnSelect = ref<string[]>(['fe'])
const multiMax = ref<string[]>(['day', 'week'])
const multiMin = ref<string[]>(['vue'])
const multiDisabled = ref<string[]>(['grid'])
const multiVertical = ref<string[]>(['week'])
const multiUi = ref<string[]>([])
const multiMatrix = ref<string[]>(['grid', 'kanban'])

const eventLog = ref<{ id: number, name: string, payload: unknown, time: string }[]>([])
let seq = 0
function logEvent(name: string, payload: unknown) {
  eventLog.value = [
    { id: ++seq, name, payload, time: new Date().toLocaleTimeString('zh-CN', { hour12: false }) },
    ...eventLog.value
  ].slice(0, 10)
}
function clearLog() {
  eventLog.value = []
}

const langItems: PillsItem[] = [
  { label: 'English', value: 'en', icon: 'i-lucide-globe', onSelect: () => logEvent('item.onSelect', { lang: 'en' }) },
  { label: '简体中文', value: 'zh-CN', icon: 'i-lucide-globe', onSelect: () => logEvent('item.onSelect', { lang: 'zh-CN' }) },
  { label: '日本語', value: 'ja', icon: 'i-lucide-globe', onSelect: () => logEvent('item.onSelect', { lang: 'ja' }) }
]

const tagItemsWithHook: PillsItem[] = tagItems.map(it => ({
  ...it,
  onSelect: () => logEvent('item.onSelect', it.value)
}))

const sizes: NonNullable<PillGroupProps['size']>[] = ['xs', 'sm', 'md', 'lg', 'xl']
const variants: NonNullable<PillGroupProps['activeVariant']>[] = ['solid', 'outline', 'soft', 'subtle']
</script>

<template>
  <Navbar />

  <Showcase title="1. 字面量 items" description="字符串数组,无需 value-key" :state="{ value: singleObject }">
    <MPillGroup
      v-model="singleObject"
      :items="[
        {

        }
      ]"
    />
  </Showcase>

  <!-- <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="UFormField 兼容" description="外层字段尺寸和错误态传递到按钮组" :state="{ value: formFieldCompat }">
      <UFormField label="视图模式" size="xs" error="示例错误态">
        <MPillGroup v-model="formFieldCompat" :items="viewItems" value-key="value" />
      </UFormField>
    </Showcase>

    <Showcase title="UFieldGroup 兼容" description="按钮组和操作按钮共同继承分组尺寸" :state="{ value: fieldGroupCompat }">
      <UFieldGroup size="xs" class="w-full">
        <MPillGroup v-model="fieldGroupCompat" :items="viewItems" value-key="value" />
        <UButton icon="i-lucide-filter" color="neutral" variant="subtle" />
      </UFieldGroup>
    </Showcase>
  </div>

  <div class="p-4 space-y-2">
    <h2 class="text-lg font-semibold">
      单选模式 (默认 / multiple=false)
    </h2>
  </div>

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="1. 字面量 items" description="字符串数组,无需 value-key" :state="{ value: singleObject }">
      <MPillGroup v-model="singleObject" :items="literalItems" />
    </Showcase>

    <Showcase title="2. 对象 items + value-key" description="v-model 是 value 字段标量" :state="{ value: singleScalar }">
      <MPillGroup v-model="singleScalar" :items="viewItems" value-key="value" />
    </Showcase>

    <Showcase title="3. 业务对象 + by='id'" description="v-model 是 user 整对象,by 加速比对" :state="{ value: singleUser }">
      <MPillGroup v-model="singleUser" :items="userItems" label-key="name" description-key="email" by="id" />
    </Showcase>

    <Showcase title="4. description 双行布局" description="size=lg + 套餐对比" :state="{ value: singleDescription }">
      <MPillGroup v-model="singleDescription" :items="planItems" value-key="value" size="lg" />
    </Showcase>

    <Showcase title="5. deselectable" description="再次点击清空" :state="{ value: singleDeselectable }">
      <MPillGroup v-model="singleDeselectable" :items="todoItems" value-key="value" deselectable />
    </Showcase>

    <Showcase title="6. 纵向排列" description="orientation=vertical" :state="{ value: singleVertical }">
      <MPillGroup v-model="singleVertical" :items="periodItems" value-key="value" orientation="vertical" />
    </Showcase>

    <Showcase title="7. item.onSelect 钩子" description="单项点击在 v-model 更新前触发" :state="{ value: singleOnSelect, eventLog }">
      <MPillGroup
        v-model="singleOnSelect"
        :items="langItems"
        value-key="value"
        @change="(v) => logEvent('change', v)"
      />
      <template #aside-extra>
        <UButton size="xs" variant="ghost" :disabled="!eventLog.length" class="self-start" @click="clearLog">
          Clear log
        </UButton>
      </template>
    </Showcase>

    <Showcase title="8. 禁用态" description="单项 disabled + 整体 disabled" :state="{ value: singleDisabled }">
      <div class="flex flex-col gap-3">
        <MPillGroup v-model="singleDisabled" :items="disabledItems" value-key="value" />
        <MPillGroup v-model="singleDisabled" :items="viewItems" value-key="value" disabled />
      </div>
    </Showcase>

    <Showcase title="9. label slot + ui 覆盖" description="自定义 label + 圆形容器" :state="{ value: singleSlot }">
      <MPillGroup v-model="singleSlot" :items="trendItems" value-key="value">
        <template #label="{ item, selected }">
          <span class="font-mono">{{ selected ? '★' : '·' }} {{ item && typeof item === 'object' ? item.label : item }}</span>
        </template>
      </MPillGroup>
    </Showcase>
  </div>

  <div class="p-4 space-y-2 pt-8">
    <h2 class="text-lg font-semibold">
      多选模式 (multiple=true)
    </h2>
  </div>

  <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Showcase title="11. 标量数组" description="value-key='value', v-model 是 value 数组" :state="{ value: multiScalar }">
      <MPillGroup v-model="multiScalar" :items="formatItems" value-key="value" multiple />
    </Showcase>

    <Showcase title="12. 对象数组 (不传 value-key)" description="v-model 拿到 item 对象数组" :state="{ value: multiObject }">
      <MPillGroup v-model="multiObject" :items="formatItems" multiple />
    </Showcase>

    <Showcase title="13. 业务对象 + by='id'" description="O(1) Map 命中优化" :state="{ value: multiUser }">
      <MPillGroup v-model="multiUser" :items="userItems" label-key="name" by="id" multiple />
    </Showcase>

    <Showcase title="14. max=2 触顶禁用" description="未选项被锁定" :state="{ value: multiMax }">
      <MPillGroup v-model="multiMax" :items="periodItems" value-key="value" multiple :max="2" />
    </Showcase>

    <Showcase title="15. min=1 阻止取消" description="已选 1 项时取消失败 (新增能力)" :state="{ value: multiMin }">
      <MPillGroup v-model="multiMin" :items="techItems" value-key="value" multiple :min="1" />
    </Showcase>

    <Showcase title="16. 纵向排列" description="orientation=vertical" :state="{ value: multiVertical }">
      <MPillGroup v-model="multiVertical" :items="periodItems" value-key="value" orientation="vertical" multiple />
    </Showcase>

    <Showcase title="17. item.onSelect + change" description="单项钩子与 emit 顺序" :state="{ value: multiOnSelect, eventLog }">
      <MPillGroup
        v-model="multiOnSelect"
        :items="tagItemsWithHook"
        value-key="value"
        multiple
        @change="(v) => logEvent('change', v)"
      />
      <template #aside-extra>
        <UButton size="xs" variant="ghost" :disabled="!eventLog.length" class="self-start" @click="clearLog">
          Clear log
        </UButton>
      </template>
    </Showcase>

    <Showcase title="18. 禁用态" description="单项 disabled + 整体 disabled" :state="{ value: multiDisabled }">
      <div class="flex flex-col gap-3">
        <MPillGroup v-model="multiDisabled" :items="disabledItems" value-key="value" multiple />
        <MPillGroup v-model="multiDisabled" :items="formatItems" value-key="value" multiple disabled />
      </div>
    </Showcase>

    <Showcase title="19. ui 覆盖" description="圆形容器 + 主题色" :state="{ value: multiUi }">
      <MPillGroup
        v-model="multiUi"
        :items="tagItems"
        value-key="value"
        multiple
        color="success"
        :ui="{ list: 'rounded-full bg-success/5 ring-1 ring-success/30 gap-2 p-1.5' }"
      />
    </Showcase>
  </div>

  <Matrix v-slot="{ size, variant }" :attrs="{ size: sizes, variant: variants }" class="p-4">
    <div class="flex flex-col gap-2">
      <UFormField :label="`${size} · ${variant} · single`" size="xs">
        <MPillGroup v-model="singleMatrix" :items="literalItems" :size="size" :active-variant="variant" />
      </UFormField>
      <UFormField :label="`${size} · ${variant} · multiple`" size="xs">
        <MPillGroup v-model="multiMatrix" :items="literalItems" multiple :size="size" :active-variant="variant" />
      </UFormField>
    </div>
  </Matrix> -->
</template>
