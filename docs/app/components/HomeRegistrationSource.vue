<script setup lang="ts">
import formSource from './HomeRegistrationForm.vue?raw'
import tableSource from './HomeRegistrationTable.vue?raw'

const props = defineProps<{ file: 'form' | 'table' }>()

const files = {
  form: { filename: 'HomeRegistrationForm.vue', code: formSource },
  table: { filename: 'HomeRegistrationTable.vue', code: tableSource }
}

const source = computed(() => files[props.file])
</script>

<template>
  <ProsePre
    :code="source.code"
    :filename="source.filename"
    language="vue"
    :ui="{
      root: 'm-0 flex h-full min-w-0 flex-col rounded-none ring-0',
      header: 'shrink-0',
      copy: 'opacity-100!',
      base: 'min-h-0 grow overflow-auto whitespace-pre [&>code]:whitespace-pre'
    }"
  >
    <code>{{ source.code.trimEnd() }}</code>
  </ProsePre>
</template>
