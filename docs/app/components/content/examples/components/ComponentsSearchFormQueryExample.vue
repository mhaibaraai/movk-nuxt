<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { SearchFormProps, SearchFormQuerySync } from '@movk/nuxt'
import type { z } from 'zod'

const props = withDefaults(defineProps<{
  queryMode?: 'off' | 'default' | 'custom'
  payloadMode?: 'clean' | 'raw' | 'custom'
}>(), { queryMode: 'off', payloadMode: 'clean' })

const { afz } = useAutoForm()
const route = useRoute()
const schema = afz.object({
  keyword: afz.string().optional().meta({ label: '关键词' }),
  note: afz.string().optional().meta({ label: '备注' })
})
type State = z.input<typeof schema>
const state = ref<State>({ keyword: '  nuxt  ', note: '  ' })
const submitted = ref<State>()
const revision = ref(0)

const customSync: SearchFormQuerySync<typeof schema> = {
  replace: false,
  parse: query => ({
    keyword: typeof query.keyword === 'string' ? query.keyword.replace(/^search:/, '') : undefined,
    note: typeof query.note === 'string' ? query.note : undefined
  }),
  serialize: value => ({
    keyword: value.keyword ? `search:${value.keyword}` : undefined,
    note: value.note
  })
}
const syncQuery = computed(() => props.queryMode === 'off' ? false : props.queryMode === 'default' ? true : customSync)
const customTransform: SearchFormProps<typeof schema>['transformPayload'] = value => ({
  keyword: value.keyword?.trim().toUpperCase() || undefined,
  note: value.note?.trim() || undefined
})
const transformPayload = computed(() => props.payloadMode === 'custom' ? customTransform : props.payloadMode === 'clean')

function onSubmit(event: FormSubmitEvent<State>) {
  submitted.value = event.data
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <UButton size="xs" variant="outline" @click="state = { keyword: '  nuxt  ', note: '  ' }">
        填入空白样本
      </UButton>
      <UButton size="xs" variant="outline" :disabled="queryMode === 'off'" @click="revision++">
        重新从 URL 读取
      </UButton>
    </div>
    <MSearchForm
      :key="`${queryMode}-${revision}`"
      v-model="state"
      :schema="schema"
      :sync-query="syncQuery"
      :transform-payload="transformPayload"
      :cols="2"
      @submit="onSubmit"
    >
      <template #extraActions="{ clear }">
        <UButton label="清空" size="sm" color="neutral" variant="ghost" @click="clear" />
      </template>
    </MSearchForm>
    <pre class="text-xs p-3 rounded bg-muted overflow-auto">{{ { state, submitted, query: route.query } }}</pre>
  </div>
</template>
