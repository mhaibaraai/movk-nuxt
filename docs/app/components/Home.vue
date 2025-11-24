<script lang="ts" setup>
import type { TabsItem } from '@nuxt/ui'
import { camelCase, capitalize, chunk, debounce, kebabCase, pascalCase, unique } from '@movk/core'

const items = [{
  label: '字符串处理',
  icon: 'i-lucide:message-square-text',
  slot: 'string'
}, {
  label: '数组处理',
  icon: 'i-lucide:gallery-vertical-end',
  slot: 'array'
}, {
  label: '异步工具',
  icon: 'i-lucide:clock',
  slot: 'async'
}] satisfies TabsItem[]

// String Demo
const stringInput = ref('Hello World')
const stringResult = ref('')

function processString(type: 'camel' | 'kebab' | 'cap' | 'pascal') {
  if (type === 'camel') {
    stringResult.value = camelCase(stringInput.value)
  }
  if (type === 'kebab') {
    stringResult.value = kebabCase(stringInput.value)
  }
  if (type === 'cap') {
    stringResult.value = capitalize(stringInput.value)
  }
  if (type === 'pascal') {
    stringResult.value = pascalCase(stringInput.value)
  }
}

// Array Demo
const arrayInput = ref([1, 2, 2, 3, 4, 4, 5, 6, 7, 8])
const arrayResult = ref<any>(null)

function processArray(type: 'chunk' | 'unique') {
  if (type === 'chunk') {
    arrayResult.value = chunk(arrayInput.value, 3)
  }
  if (type === 'unique') {
    arrayResult.value = unique(arrayInput.value)
  }
}

// Async Demo
const debounceInput = ref('')
const debounceCount = ref(0)
const triggerCount = ref(0)
const lastTriggerTime = ref('')

const debouncedFn = debounce(() => {
  debounceCount.value++
  lastTriggerTime.value = new Date().toLocaleTimeString()
}, 500)

function onDebounceInput() {
  triggerCount.value++
  debouncedFn()
}
</script>

<template>
  <UCard class="w-full max-w-2xl mx-auto shadow-lg ring-1 ring-gray-200 dark:ring-gray-800">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          交互式演示
        </h3>
        <UBadge color="primary" variant="subtle" size="xs">
          Live Demo
        </UBadge>
      </div>
    </template>

    <UTabs :items="items" class="w-full">
      <template #string>
        <div class="p-4 space-y-6 min-h-65">
          <UFormField label="输入文本">
            <UInput
              v-model="stringInput"
              icon="i-lucide:square-pen"
              placeholder="输入任意字符串..."
              class="w-full"
            />
          </UFormField>

          <UFieldGroup>
            <UButton
              color="neutral"
              variant="solid"
              icon="i-lucide:arrow-left-right"
              @click="processString('camel')"
            >
              camelCase
            </UButton>
            <UButton
              color="neutral"
              variant="solid"
              icon="i-lucide:arrow-up-right"
              @click="processString('pascal')"
            >
              PascalCase
            </UButton>
            <UButton
              color="neutral"
              variant="solid"
              icon="i-lucide:minus"
              @click="processString('kebab')"
            >
              kebab-case
            </UButton>
            <UButton
              color="neutral"
              variant="solid"
              icon="i-lucide:arrow-up"
              @click="processString('cap')"
            >
              Capitalize
            </UButton>
          </UFieldGroup>

          <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 transition-all min-h-[86px]">
            <div class="text-xs text-gray-500 mb-1">
              转换结果
            </div>
            <div v-if="stringResult" class="font-mono text-primary-500 font-medium text-lg">
              {{ stringResult }}
            </div>
            <div v-else class="text-gray-400 dark:text-gray-500 text-sm italic">
              等待操作...
            </div>
          </div>
        </div>
      </template>

      <template #array>
        <div class="p-4 space-y-6 min-h-65">
          <UFormField label="原始数组">
            <UInput
              :model-value="JSON.stringify(arrayInput)"
              class="w-full"
              readonly
            />
          </UFormField>

          <UFieldGroup>
            <UButton
              color="primary"
              variant="soft"
              icon="i-lucide:funnel"
              @click="processArray('unique')"
            >
              Unique (去重)
            </UButton>
            <UButton
              color="primary"
              variant="soft"
              icon="i-lucide:layout-grid"
              @click="processArray('chunk')"
            >
              Chunk (分块 size=3)
            </UButton>
          </UFieldGroup>

          <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 transition-all min-h-[86px]">
            <div class="text-xs text-gray-500 mb-1">
              处理结果
            </div>
            <div v-if="arrayResult" class="font-mono text-primary-500 font-medium">
              {{ JSON.stringify(arrayResult) }}
            </div>
            <div v-else class="text-gray-400 dark:text-gray-500 text-sm italic">
              等待操作...
            </div>
          </div>
        </div>
      </template>

      <template #async>
        <div class="p-4 space-y-6 min-h-65">
          <UFormField label="防抖测试 (Debounce 500ms)" hint="请快速输入字符">
            <UInput
              v-model="debounceInput"
              icon="i-lucide:zap"
              placeholder="在此处快速输入..."
              class="w-full"
              @input="onDebounceInput"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 text-center">
              <div class="text-xs text-gray-500 mb-1">
                输入事件触发
              </div>
              <div class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ triggerCount }}
              </div>
            </div>
            <div class="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg border border-primary-100 dark:border-primary-900/20 text-center">
              <div class="text-xs text-primary-600 dark:text-primary-400 mb-1">
                实际执行次数
              </div>
              <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {{ debounceCount }}
              </div>
            </div>
          </div>

          <div class="flex justify-end items-center gap-2 text-xs text-gray-400 h-5">
            <template v-if="lastTriggerTime">
              <UIcon name="i-lucide:clock" />
              <span>最后执行: {{ lastTriggerTime }}</span>
            </template>
          </div>
        </div>
      </template>
    </UTabs>
  </UCard>
</template>
