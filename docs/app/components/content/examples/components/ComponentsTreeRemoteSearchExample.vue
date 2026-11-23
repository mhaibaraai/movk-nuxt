<script setup lang="ts">
const items = [{ label: 'Apple' }, { label: 'Pear' }, { label: 'Banana' }]
const search = ref('pe')
const selected = ref<string[]>([])
const tree = useTemplateRef('tree')
const roots: { label: string, defaultExpanded?: boolean, isLeaf?: boolean }[] = [{ label: 'Fruit', defaultExpanded: true }]

async function searchMethod(term: string) {
  return items.filter(item => item.label.toLowerCase().includes(term.toLowerCase()))
}
</script>

<template>
  <div class="space-y-3">
    <UButton label="Reload children" @click="tree?.reload('Fruit')" />
    <MTree
      ref="tree"
      v-model:search="search"
      v-model:selected-keys="selected"
      :items="roots"
      :search-method="searchMethod"
      :load-children="async () => items.map(item => ({ ...item, isLeaf: true }))"
      strategy="leaf"
      lazy
      searchable
      checkable
    />
    <p>{{ selected.join(', ') }}</p>
  </div>
</template>
