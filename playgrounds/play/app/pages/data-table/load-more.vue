<script setup lang="ts">
import type { Person } from '../../composables/useMockData'

const columns = usePeopleColumns()

function makeFeed(total: number, pageSize = 12) {
  const items = ref<Person[]>([])
  const loaded = ref(0)
  const append = (count: number) => {
    const next = makePeople(Math.min(count, total - loaded.value), loaded.value)
    items.value = [...items.value, ...next]
    loaded.value += next.length
  }
  const reset = () => {
    items.value = []
    loaded.value = 0
  }
  return { items, loaded, total, pageSize, append, reset }
}

const basic = makeFeed(60)
async function basicLoadMore() {
  await new Promise(r => setTimeout(r, 500))
  basic.append(basic.pageSize)
}
const basicCanLoadMore = computed(() => basic.loaded.value < basic.total)

const gated = makeFeed(48)
const paused = ref(false)
async function gatedLoadMore() {
  await new Promise(r => setTimeout(r, 500))
  gated.append(gated.pageSize)
}
const gatedCanLoadMore = computed(() => !paused.value && gated.loaded.value < gated.total)

const tuned = makeFeed(60)
const distance = ref(100)
async function tunedLoadMore() {
  await new Promise(r => setTimeout(r, 500))
  tuned.append(tuned.pageSize)
}
const tunedCanLoadMore = computed(() => tuned.loaded.value < tuned.total)

const manual = makeFeed(48)
const manualLoading = ref(false)
function manualLoadMore(): void {
  if (manualLoading.value) return
  manualLoading.value = true
  setTimeout(() => {
    manual.append(manual.pageSize)
    manualLoading.value = false
  }, 600)
}
const manualCanLoadMore = computed(() => manual.loaded.value < manual.total)
function manualReset(): void {
  manual.reset()
  manualLoading.value = false
}
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="触底加载"
      description="传入 load-more 回调即启用无限滚动，回调返回 Promise 时组件自动派生 loading"
    >
      <template #toolbar>
        <UButton size="xs" variant="outline" icon="i-lucide-rotate-ccw" @click="basic.reset">
          重置
        </UButton>
        <span class="text-xs text-muted tabular-nums">已加载 {{ basic.loaded.value }} / {{ basic.total }}</span>
      </template>

      <MDataTable
        :data="basic.items.value"
        :columns="columns"
        :load-more="basicLoadMore"
        :can-load-more="basicCanLoadMore"
        bordered
        :ui="{ root: 'h-[60vh]' }"
      />
    </Showcase>

    <Showcase
      title="终止加载"
      description="can-load-more 为 false 时停止触发，可独立于剩余数据强制暂停"
    >
      <template #toolbar>
        <USwitch v-model="paused" label="暂停加载" />
        <UButton size="xs" variant="outline" icon="i-lucide-rotate-ccw" @click="gated.reset">
          重置
        </UButton>
        <span class="text-xs text-muted tabular-nums">已加载 {{ gated.loaded.value }} / {{ gated.total }}</span>
      </template>

      <MDataTable
        :data="gated.items.value"
        :columns="columns"
        :load-more="gatedLoadMore"
        :can-load-more="gatedCanLoadMore"
        bordered
        :ui="{ root: 'h-[60vh]' }"
      />
    </Showcase>

    <Showcase
      title="触发阈值"
      description="load-more-distance 设置触发加载的距底像素阈值，值越大越提前触发"
    >
      <template #toolbar>
        <USelect
          v-model="distance"
          :items="[
            { label: 'distance 40（贴底触发）', value: 40 },
            { label: 'distance 100（默认）', value: 100 },
            { label: 'distance 240（提前触发）', value: 240 }
          ]"
          value-key="value"
          size="xs"
          class="w-52"
        />
        <UButton size="xs" variant="outline" icon="i-lucide-rotate-ccw" @click="tuned.reset">
          重置
        </UButton>
        <span class="text-xs text-muted tabular-nums">已加载 {{ tuned.loaded.value }} / {{ tuned.total }}</span>
      </template>

      <MDataTable
        :data="tuned.items.value"
        :columns="columns"
        :load-more="tunedLoadMore"
        :can-load-more="tunedCanLoadMore"
        :load-more-distance="distance"
        bordered
        :ui="{ root: 'h-[60vh]' }"
      />
    </Showcase>

    <Showcase
      title="调用方接管 loading"
      description="load-more 同步返回（不交回 Promise）时，由调用方自行接管 loading prop"
    >
      <template #toolbar>
        <UButton size="xs" variant="outline" icon="i-lucide-rotate-ccw" @click="manualReset">
          重置
        </UButton>
        <UBadge :color="manualLoading ? 'primary' : 'neutral'" variant="subtle" size="sm">
          {{ manualLoading ? 'loading…' : 'idle' }}
        </UBadge>
        <span class="text-xs text-muted tabular-nums">已加载 {{ manual.loaded.value }} / {{ manual.total }}</span>
      </template>

      <MDataTable
        :data="manual.items.value"
        :columns="columns"
        :load-more="manualLoadMore"
        :can-load-more="manualCanLoadMore"
        :loading="manualLoading"
        bordered
        :ui="{ root: 'h-[60vh]' }"
      />
    </Showcase>
  </div>
</template>
