<script setup lang="ts">
const { afz } = useAutoForm()
const schema = afz.object({ keyword: afz.string().default('') })
const form = ref({ keyword: '' })
const activeKeyword = ref('')
const items = ['Apple', 'Banana', 'Pear']
const results = computed(() => items.filter(item => item.toLowerCase().includes(activeKeyword.value.toLowerCase())))
</script>

<template>
  <div class="space-y-3">
    <MSearchForm
      v-model="form"
      :schema="schema"
      :sync-query="{ replace: false }"
      @submit="activeKeyword = $event.data.keyword ?? ''"
      @query-restore="activeKeyword = $event.keyword ?? ''"
      @reset="activeKeyword = $event.keyword ?? ''"
    />
    <p>{{ results.join(', ') }}</p>
  </div>
</template>
