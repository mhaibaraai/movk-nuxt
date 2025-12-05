<script lang="ts" setup>
const searchQuery = ref('initial')
const { data } = await useFetch('/api/search', {
  query: { q: searchQuery },
  watch: false
})
// does not trigger a refetch
searchQuery.value = 'new search'
</script>

<template>
  <div>2</div>
</template>
